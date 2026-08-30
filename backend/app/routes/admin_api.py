"""
app/routes/admin_api.py

Admin API endpoints for dashboard stats, reports review, user management, and audit logs.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.db.database import get_db
from app.db import models

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
)


# ============================================================================
# ADMIN DASHBOARD STATS
# ============================================================================

@router.get("/stats")
async def get_admin_stats(db: Session = Depends(get_db), user_id: int = None) -> dict:
    """
    Get admin dashboard statistics.

    Args:
        db: Database session
        user_id: ID of requesting admin (for auth validation)

    Returns:
        Dashboard statistics
    """
    # Verify admin (simplified - in production use proper auth middleware)
    if user_id:
        admin_user = db.query(models.User).filter(models.User.id == user_id).first()
        if not admin_user or not admin_user.is_admin:
            raise HTTPException(status_code=403, detail="Not authorized")

    total_users = db.query(models.User).count()
    total_posts = db.query(models.Post).count()
    verified_posts = db.query(models.Post).filter(
        models.Post.verdict == "Reliable"
    ).count()
    flagged_posts = db.query(models.Post).filter(
        models.Post.verdict.in_(["Misleading", "Suspicious"])
    ).count()
    open_reports = db.query(models.Report).filter(models.Report.status == "open").count()
    suspended_users = db.query(models.User).filter(models.User.is_suspended == True).count()

    # Score distribution
    score_distribution = {
        "90-100": db.query(models.Post).filter(
            models.Post.confidence_score >= 90
        ).count(),
        "70-89": db.query(models.Post).filter(
            models.Post.confidence_score >= 70,
            models.Post.confidence_score < 90,
        ).count(),
        "40-69": db.query(models.Post).filter(
            models.Post.confidence_score >= 40,
            models.Post.confidence_score < 70,
        ).count(),
        "0-39": db.query(models.Post).filter(
            models.Post.confidence_score < 40
        ).count(),
    }

    return {
        "total_users": total_users,
        "total_posts": total_posts,
        "verified_posts": verified_posts,
        "flagged_posts": flagged_posts,
        "open_reports": open_reports,
        "suspended_users": suspended_users,
        "score_distribution": score_distribution,
    }


# ============================================================================
# REPORTS MANAGEMENT
# ============================================================================

@router.get("/reports")
async def get_reports(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
) -> dict:
    """
    Get list of reports for moderation.

    Args:
        status: Filter by status (open, investigating, resolved, dismissed)
        skip: Number to skip
        limit: Number to return
        db: Database session

    Returns:
        List of reports
    """
    query = db.query(models.Report)

    if status:
        query = query.filter(models.Report.status == status)

    reports = (
        query.order_by(models.Report.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "reports": [
            {
                "id": r.id,
                "reporter_id": r.reporter_id,
                "target_type": r.target_type,
                "target_id": r.target_id,
                "reason": r.reason,
                "details": r.details,
                "status": r.status,
                "created_at": r.created_at,
            }
            for r in reports
        ]
    }


@router.put("/reports/{report_id}")
async def update_report(
    report_id: int,
    status: str,  # "open", "investigating", "resolved", "dismissed"
    action: Optional[str] = None,  # "remove_content", "suspend_user", "none"
    db: Session = Depends(get_db),
) -> dict:
    """
    Update report status and take action.

    Args:
        report_id: ID of report
        status: New status
        action: Action to take
        db: Database session

    Returns:
        Updated report
    """
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = status
    report.updated_at = datetime.utcnow()

    # Take action if specified
    if action == "remove_content" and report.target_type == "post":
        post = db.query(models.Post).filter(models.Post.id == report.target_id).first()
        if post:
            post.is_deleted = True

    elif action == "suspend_user":
        user_id = (
            report.target_id if report.target_type == "user" else report.reporter_id
        )
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            user.is_suspended = True

    db.commit()

    return {
        "id": report.id,
        "status": report.status,
        "action_taken": action,
        "updated_at": report.updated_at,
    }


# ============================================================================
# USER MANAGEMENT
# ============================================================================

@router.post("/users/{username}/suspend")
async def suspend_user(
    username: str, reason: Optional[str] = None, db: Session = Depends(get_db)
) -> dict:
    """
    Suspend or restore a user account.

    Args:
        username: Username to suspend/restore
        reason: Reason for suspension
        db: Database session

    Returns:
        Updated user status
    """
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_suspended = not user.is_suspended
    db.commit()

    return {
        "username": user.username,
        "is_suspended": user.is_suspended,
        "reason": reason,
    }


@router.delete("/posts/{post_id}")
async def delete_post_admin(
    post_id: int, reason: Optional[str] = None, db: Session = Depends(get_db)
) -> dict:
    """
    Delete a post as admin.

    Args:
        post_id: ID of post to delete
        reason: Reason for deletion
        db: Database session

    Returns:
        Deletion confirmation
    """
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.is_deleted = True
    db.commit()

    return {
        "post_id": post_id,
        "deleted": True,
        "reason": reason,
    }


# ============================================================================
# AUDIT LOG
# ============================================================================

@router.get("/audit-logs")
async def get_audit_logs(
    skip: int = 0,
    limit: int = 50,
    post_id: Optional[int] = None,
    db: Session = Depends(get_db),
) -> dict:
    """
    Get AI verification audit logs.

    Args:
        skip: Number to skip
        limit: Number to return
        post_id: Filter by post ID
        db: Database session

    Returns:
        List of verification records
    """
    query = db.query(models.VerificationRecord)

    if post_id:
        query = query.filter(models.VerificationRecord.post_id == post_id)

    records = (
        query.order_by(models.VerificationRecord.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "audit_logs": [
            {
                "id": r.id,
                "post_id": r.post_id,
                "sha256_hash": r.sha256_hash,
                "verdict": r.verdict,
                "confidence_score": r.confidence_score,
                "text_score": r.text_score,
                "image_score": r.image_score,
                "deepfake_score": r.deepfake_score,
                "originality_score": r.originality_score,
                "source_score": r.source_score,
                "c2pa_valid": r.c2pa_valid,
                "created_at": r.created_at,
            }
            for r in records
        ]
    }


@router.get("/audit-logs/stats")
async def get_audit_stats(db: Session = Depends(get_db)) -> dict:
    """
    Get verification audit statistics.

    Args:
        db: Database session

    Returns:
        Audit statistics
    """
    total_verifications = db.query(models.VerificationRecord).count()
    
    reliable_count = db.query(models.VerificationRecord).filter(
        models.VerificationRecord.verdict == "Reliable"
    ).count()
    
    misleading_count = db.query(models.VerificationRecord).filter(
        models.VerificationRecord.verdict == "Misleading"
    ).count()

    avg_confidence = 0.0
    records = db.query(models.VerificationRecord).all()
    if records:
        avg_confidence = sum(r.confidence_score for r in records) / len(records)

    return {
        "total_verifications": total_verifications,
        "reliable_count": reliable_count,
        "misleading_count": misleading_count,
        "average_confidence": round(avg_confidence, 2),
    }
