"""
app/routes/social_api.py

API endpoints for social features: user profiles, follow/unfollow, search, messaging, notifications.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.db.database import get_db
from app.db import models

router = APIRouter(
    prefix="/api",
    tags=["Social"],
)


# ============================================================================
# USER PROFILE ENDPOINTS
# ============================================================================

@router.get("/users/{username}")
async def get_user_profile(username: str, db: Session = Depends(get_db)) -> dict:
    """
    Get user profile and stats.

    Args:
        username: Username to retrieve
        db: Database session

    Returns:
        User profile with stats
    """
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    posts_count = db.query(models.Post).filter(
        models.Post.user_id == user.id, models.Post.is_deleted == False
    ).count()
    followers_count = db.query(models.Follow).filter(
        models.Follow.following_id == user.id
    ).count()
    following_count = db.query(models.Follow).filter(
        models.Follow.follower_id == user.id
    ).count()

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "name": user.name,
        "bio": user.bio,
        "avatar": user.avatar,
        "website": user.website,
        "is_verified": user.is_verified,
        "posts_count": posts_count,
        "followers_count": followers_count,
        "following_count": following_count,
        "created_at": user.created_at,
    }


@router.put("/users/profile")
async def update_profile(
    user_id: int,
    name: Optional[str] = None,
    bio: Optional[str] = None,
    avatar: Optional[str] = None,
    website: Optional[str] = None,
    db: Session = Depends(get_db),
) -> dict:
    """
    Update user profile.

    Args:
        user_id: ID of user to update
        name: Display name
        bio: User bio
        avatar: Avatar URL
        website: Website URL
        db: Database session

    Returns:
        Updated user profile
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if name:
        user.name = name
    if bio is not None:
        user.bio = bio
    if avatar:
        user.avatar = avatar
    if website is not None:
        user.website = website

    user.updated_at = datetime.utcnow()
    db.commit()

    return {
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "bio": user.bio,
        "avatar": user.avatar,
        "website": user.website,
    }


# ============================================================================
# FOLLOW/UNFOLLOW ENDPOINTS
# ============================================================================

@router.post("/users/{username}/follow")
async def toggle_follow(
    username: str, follower_id: int, db: Session = Depends(get_db)
) -> dict:
    """
    Follow or unfollow a user.

    Args:
        username: Username to follow/unfollow
        follower_id: ID of user initiating follow
        db: Database session

    Returns:
        Follow status
    """
    user_to_follow = db.query(models.User).filter(models.User.username == username).first()
    if not user_to_follow:
        raise HTTPException(status_code=404, detail="User not found")

    follower = db.query(models.User).filter(models.User.id == follower_id).first()
    if not follower:
        raise HTTPException(status_code=404, detail="Follower not found")

    # Check if already following
    existing = (
        db.query(models.Follow)
        .filter(
            models.Follow.follower_id == follower_id,
            models.Follow.following_id == user_to_follow.id,
        )
        .first()
    )

    if existing:
        db.delete(existing)
        following = False
    else:
        follow = models.Follow(
            follower_id=follower_id, following_id=user_to_follow.id, status="active"
        )
        db.add(follow)
        following = True

    db.commit()

    return {
        "username": username,
        "following": following,
        "followers_count": db.query(models.Follow).filter(
            models.Follow.following_id == user_to_follow.id
        ).count(),
    }


@router.get("/users/{username}/followers")
async def get_followers(
    username: str, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)
) -> dict:
    """
    Get list of user's followers.

    Args:
        username: Username to get followers for
        skip: Number to skip
        limit: Number to return
        db: Database session

    Returns:
        List of followers
    """
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    followers = (
        db.query(models.Follow)
        .filter(models.Follow.following_id == user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "followers": [
            {
                "id": f.follower_user.id,
                "username": f.follower_user.username,
                "avatar": f.follower_user.avatar,
            }
            for f in followers
        ]
    }


@router.get("/users/{username}/following")
async def get_following(
    username: str, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)
) -> dict:
    """
    Get list of users that a user follows.

    Args:
        username: Username to get following for
        skip: Number to skip
        limit: Number to return
        db: Database session

    Returns:
        List of users being followed
    """
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    following = (
        db.query(models.Follow)
        .filter(models.Follow.follower_id == user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "following": [
            {
                "id": f.following_user.id,
                "username": f.following_user.username,
                "avatar": f.following_user.avatar,
            }
            for f in following
        ]
    }


# ============================================================================
# SEARCH ENDPOINTS
# ============================================================================

@router.get("/search")
async def search(
    q: str = Query(..., min_length=1),
    search_type: str = "all",  # "all", "users", "posts", "hashtags"
    limit: int = 20,
    db: Session = Depends(get_db),
) -> dict:
    """
    Search users, posts, and hashtags.

    Args:
        q: Search query
        search_type: Type of search to perform
        limit: Max results per type
        db: Database session

    Returns:
        Search results
    """
    results = {
        "query": q,
        "users": [],
        "posts": [],
        "hashtags": [],
    }

    if search_type in ("all", "users"):
        users = (
            db.query(models.User)
            .filter(
                (models.User.username.ilike(f"%{q}%"))
                | (models.User.name.ilike(f"%{q}%"))
            )
            .limit(limit)
            .all()
        )
        results["users"] = [
            {"id": u.id, "username": u.username, "name": u.name, "avatar": u.avatar}
            for u in users
        ]

    if search_type in ("all", "posts"):
        posts = (
            db.query(models.Post)
            .filter(
                models.Post.caption.ilike(f"%{q}%"),
                models.Post.is_deleted == False,
            )
            .limit(limit)
            .all()
        )
        results["posts"] = [
            {
                "id": p.id,
                "caption": p.caption[:100],
                "user_id": p.user_id,
                "created_at": p.created_at,
            }
            for p in posts
        ]

    if search_type in ("all", "hashtags"):
        # Simple hashtag search by parsing hashtags field
        posts_with_tag = (
            db.query(models.Post)
            .filter(
                models.Post.hashtags.ilike(f"%{q}%"),
                models.Post.is_deleted == False,
            )
            .all()
        )
        tags = set()
        for post in posts_with_tag:
            if post.hashtags:
                for tag in post.hashtags.split(","):
                    tag_clean = tag.strip().lower()
                    if q.lower() in tag_clean:
                        tags.add(tag_clean)
        results["hashtags"] = list(tags)[:limit]

    return results


# ============================================================================
# MESSAGING ENDPOINTS
# ============================================================================

@router.get("/messages")
async def get_conversations(
    user_id: int, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)
) -> dict:
    """
    Get list of conversations for a user.

    Args:
        user_id: ID of user
        skip: Number to skip
        limit: Number to return
        db: Database session

    Returns:
        List of conversations
    """
    # Get unique conversations
    conversations = (
        db.query(models.Message)
        .filter(
            (models.Message.sender_id == user_id)
            | (models.Message.recipient_id == user_id)
        )
        .order_by(models.Message.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    # Extract unique participants
    participants = {}
    for msg in conversations:
        other_user_id = (
            msg.sender_id if msg.recipient_id == user_id else msg.recipient_id
        )
        if other_user_id not in participants:
            participants[other_user_id] = msg

    return {
        "conversations": [
            {
                "user_id": uid,
                "last_message": msg.text,
                "last_message_at": msg.created_at,
            }
            for uid, msg in participants.items()
        ]
    }


@router.get("/messages/{conversation_user_id}")
async def get_messages(
    user_id: int,
    conversation_user_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
) -> dict:
    """
    Get message history with a specific user.

    Args:
        user_id: ID of current user
        conversation_user_id: ID of conversation partner
        skip: Number to skip
        limit: Number to return
        db: Database session

    Returns:
        List of messages
    """
    messages = (
        db.query(models.Message)
        .filter(
            (
                (models.Message.sender_id == user_id)
                & (models.Message.recipient_id == conversation_user_id)
            )
            | (
                (models.Message.sender_id == conversation_user_id)
                & (models.Message.recipient_id == user_id)
            )
        )
        .order_by(models.Message.created_at.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "messages": [
            {
                "id": m.id,
                "sender_id": m.sender_id,
                "text": m.text,
                "is_read": m.is_read,
                "created_at": m.created_at,
            }
            for m in messages
        ]
    }


@router.post("/messages")
async def send_message(
    sender_id: int,
    recipient_id: int,
    text: str,
    db: Session = Depends(get_db),
) -> dict:
    """
    Send a message to another user.

    Args:
        sender_id: ID of sender
        recipient_id: ID of recipient
        text: Message text
        db: Database session

    Returns:
        Created message
    """
    message = models.Message(
        sender_id=sender_id, recipient_id=recipient_id, text=text, is_read=False
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    return {
        "id": message.id,
        "sender_id": message.sender_id,
        "recipient_id": message.recipient_id,
        "text": message.text,
        "is_read": message.is_read,
        "created_at": message.created_at,
    }


# ============================================================================
# NOTIFICATIONS ENDPOINTS
# ============================================================================

@router.get("/notifications")
async def get_notifications(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    unread_only: bool = False,
    db: Session = Depends(get_db),
) -> dict:
    """
    Get notifications for a user.

    Args:
        user_id: ID of user
        skip: Number to skip
        limit: Number to return
        unread_only: Only return unread notifications
        db: Database session

    Returns:
        List of notifications
    """
    query = db.query(models.Notification).filter(models.Notification.user_id == user_id)
    
    if unread_only:
        query = query.filter(models.Notification.is_read == False)

    notifications = (
        query.order_by(models.Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "notifications": [
            {
                "id": n.id,
                "type": n.type,
                "message": n.message,
                "sender_id": n.sender_id,
                "post_id": n.post_id,
                "is_read": n.is_read,
                "created_at": n.created_at,
            }
            for n in notifications
        ]
    }


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int, db: Session = Depends(get_db)
) -> dict:
    """
    Mark a notification as read.

    Args:
        notification_id: ID of notification
        db: Database session

    Returns:
        Updated notification
    """
    notification = (
        db.query(models.Notification)
        .filter(models.Notification.id == notification_id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    db.commit()

    return {"id": notification.id, "is_read": notification.is_read}


@router.put("/notifications/read-all")
async def mark_all_read(user_id: int, db: Session = Depends(get_db)) -> dict:
    """
    Mark all notifications as read for a user.

    Args:
        user_id: ID of user
        db: Database session

    Returns:
        Count of marked notifications
    """
    notifications = (
        db.query(models.Notification)
        .filter(models.Notification.user_id == user_id, models.Notification.is_read == False)
        .all()
    )

    for n in notifications:
        n.is_read = True

    db.commit()

    return {"marked_count": len(notifications)}
