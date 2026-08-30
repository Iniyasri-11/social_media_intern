"""
app/routes/posts_api.py

API endpoints for social posts: feed, create, like, bookmark, comment, voting, and reporting.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.db.database import get_db
from app.db import models
from app.services.verification_service import verify_post

router = APIRouter(
    prefix="/api/posts",
    tags=["Posts"],
)


@router.get("/feed")
async def get_feed(
    skip: int = 0,
    limit: int = 20,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
) -> dict:
    """
    Get paginated home feed with posts from followed users and recommendations.

    Args:
        skip: Number of posts to skip
        limit: Number of posts to return
        user_id: Current user ID
        db: Database session

    Returns:
        Dict with posts list and metadata
    """
    # Get all non-deleted posts, ordered by creation date
    posts = (
        db.query(models.Post)
        .filter(models.Post.is_deleted == False)
        .order_by(models.Post.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "posts": [_post_to_dict(p, db) for p in posts],
        "skip": skip,
        "limit": limit,
        "total": db.query(models.Post).filter(models.Post.is_deleted == False).count(),
    }


@router.post("")
async def create_post(
    caption: str = Form(None),
    source_url: str = Form(None),
    hashtags: str = Form(None),
    user_id: int = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
) -> dict:
    """
    Create a new post with optional image and background verification.

    Args:
        caption: Post caption/text
        source_url: Optional source URL reference
        hashtags: Comma-separated hashtags
        user_id: ID of post creator
        image: Optional image file
        db: Database session

    Returns:
        Created post object
    """
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Read image bytes if provided
    image_bytes = None
    if image:
        image_bytes = await image.read()

    # Run verification in background (simplified: run sync for now)
    verification_result = None
    if caption or image_bytes:
        try:
            verification_result = verify_post(
                post_text=caption,
                post_url=source_url,
                image_bytes=image_bytes,
                image_filename=image.filename if image else None,
                db=db,
            )
        except Exception as e:
            print(f"Verification error: {e}")
            verification_result = None

    # Create post
    post = models.Post(
        user_id=user_id,
        caption=caption,
        source_url=source_url,
        hashtags=hashtags,
        media_type="image" if image_bytes else "text",
    )

    if verification_result:
        post.verdict = verification_result.get("verdict")
        post.confidence_score = verification_result.get("confidence_score")
        post.text_score = verification_result.get("text_score")
        post.image_score = verification_result.get("image_score")
        post.deepfake_score = verification_result.get("deepfake_score")
        post.sha256_hash = verification_result.get("sha256_hash")
        post.message = verification_result.get("message")

    db.add(post)
    db.commit()
    db.refresh(post)

    return _post_to_dict(post, db)


@router.get("/{post_id}")
async def get_post(post_id: int, db: Session = Depends(get_db)) -> dict:
    """
    Get a single post with full verification details.

    Args:
        post_id: ID of post to retrieve
        db: Database session

    Returns:
        Post object with metadata
    """
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return _post_to_dict(post, db)


@router.post("/{post_id}/like")
async def toggle_like(
    post_id: int, user_id: int, db: Session = Depends(get_db)
) -> dict:
    """
    Like or unlike a post.

    Args:
        post_id: ID of post to like
        user_id: ID of user liking
        db: Database session

    Returns:
        Updated post with like count
    """
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check if already liked
    existing = (
        db.query(models.Like)
        .filter(models.Like.post_id == post_id, models.Like.user_id == user_id)
        .first()
    )

    if existing:
        db.delete(existing)
    else:
        like = models.Like(post_id=post_id, user_id=user_id)
        db.add(like)

    db.commit()

    like_count = db.query(models.Like).filter(models.Like.post_id == post_id).count()
    return {"post_id": post_id, "likes": like_count}


@router.post("/{post_id}/bookmark")
async def toggle_bookmark(
    post_id: int, user_id: int, db: Session = Depends(get_db)
) -> dict:
    """
    Bookmark (save) or unbookmark a post.

    Args:
        post_id: ID of post to bookmark
        user_id: ID of user bookmarking
        db: Database session

    Returns:
        Bookmark status
    """
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = (
        db.query(models.Bookmark)
        .filter(models.Bookmark.post_id == post_id, models.Bookmark.user_id == user_id)
        .first()
    )

    if existing:
        db.delete(existing)
        bookmarked = False
    else:
        bookmark = models.Bookmark(post_id=post_id, user_id=user_id)
        db.add(bookmark)
        bookmarked = True

    db.commit()

    return {"post_id": post_id, "bookmarked": bookmarked}


@router.delete("/{post_id}")
async def delete_post(
    post_id: int, user_id: int, db: Session = Depends(get_db)
) -> dict:
    """
    Delete own post.

    Args:
        post_id: ID of post to delete
        user_id: ID of user (must be post owner)
        db: Database session

    Returns:
        Success message
    """
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    post.is_deleted = True
    db.commit()

    return {"message": "Post deleted"}


@router.get("/{post_id}/comments")
async def get_comments(
    post_id: int, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)
) -> dict:
    """
    Get comments on a post.

    Args:
        post_id: ID of post
        skip: Number of comments to skip
        limit: Number of comments to return
        db: Database session

    Returns:
        List of comments
    """
    comments = (
        db.query(models.Comment)
        .filter(models.Comment.post_id == post_id, models.Comment.parent_id == None)
        .order_by(models.Comment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "comments": [_comment_to_dict(c) for c in comments],
        "skip": skip,
        "limit": limit,
    }


@router.post("/{post_id}/comments")
async def create_comment(
    post_id: int,
    user_id: int,
    text: str,
    parent_id: Optional[int] = None,
    db: Session = Depends(get_db),
) -> dict:
    """
    Add a comment to a post or reply to another comment.

    Args:
        post_id: ID of post to comment on
        user_id: ID of commenting user
        text: Comment text
        parent_id: Optional ID of parent comment (for nested replies)
        db: Database session

    Returns:
        Created comment
    """
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = models.Comment(
        post_id=post_id, user_id=user_id, text=text, parent_id=parent_id
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return _comment_to_dict(comment)


@router.post("/{post_id}/vote")
async def community_fact_check(
    post_id: int,
    user_id: int,
    vote_type: str,  # "true", "false", "misleading", "cannot_verify"
    db: Session = Depends(get_db),
) -> dict:
    """
    Community fact-checking vote on a post.

    Args:
        post_id: ID of post to vote on
        user_id: ID of voting user
        vote_type: Type of vote
        db: Database session

    Returns:
        Updated vote totals
    """
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check if user already voted
    existing = (
        db.query(models.VerificationVote)
        .filter(
            models.VerificationVote.post_id == post_id,
            models.VerificationVote.user_id == user_id,
        )
        .first()
    )

    if existing:
        existing.vote_type = vote_type
    else:
        vote = models.VerificationVote(
            post_id=post_id, user_id=user_id, vote_type=vote_type
        )
        db.add(vote)

    db.commit()

    # Get vote totals
    votes = db.query(models.VerificationVote).filter(
        models.VerificationVote.post_id == post_id
    ).all()
    vote_counts = {
        "true": sum(1 for v in votes if v.vote_type == "true"),
        "false": sum(1 for v in votes if v.vote_type == "false"),
        "misleading": sum(1 for v in votes if v.vote_type == "misleading"),
        "cannot_verify": sum(1 for v in votes if v.vote_type == "cannot_verify"),
    }

    return {"post_id": post_id, "votes": vote_counts, "total_votes": len(votes)}


@router.post("/{post_id}/report")
async def report_post(
    post_id: int,
    reporter_id: int,
    reason: str,
    details: Optional[str] = None,
    db: Session = Depends(get_db),
) -> dict:
    """
    Report a post for violating policies.

    Args:
        post_id: ID of post to report
        reporter_id: ID of user reporting
        reason: Reason for report
        details: Additional details
        db: Database session

    Returns:
        Created report
    """
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    report = models.Report(
        reporter_id=reporter_id,
        target_type="post",
        target_id=post_id,
        reason=reason,
        details=details,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "report_id": report.id,
        "status": report.status,
        "created_at": report.created_at,
    }


def _post_to_dict(post: models.Post, db: Session) -> dict:
    """Convert Post model to dictionary."""
    likes = db.query(models.Like).filter(models.Like.post_id == post.id).count()
    comments = db.query(models.Comment).filter(models.Comment.post_id == post.id).count()
    
    return {
        "id": post.id,
        "user_id": post.user_id,
        "caption": post.caption,
        "media_url": post.media_url,
        "media_type": post.media_type,
        "source_url": post.source_url,
        "hashtags": post.hashtags,
        "verdict": post.verdict,
        "confidence_score": post.confidence_score,
        "text_score": post.text_score,
        "image_score": post.image_score,
        "deepfake_score": post.deepfake_score,
        "originality_score": post.originality_score,
        "source_score": post.source_score,
        "likes": likes,
        "comments": comments,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
    }


def _comment_to_dict(comment: models.Comment) -> dict:
    """Convert Comment model to dictionary."""
    return {
        "id": comment.id,
        "post_id": comment.post_id,
        "user_id": comment.user_id,
        "parent_id": comment.parent_id,
        "text": comment.text,
        "created_at": comment.created_at,
        "updated_at": comment.updated_at,
    }
