"""
app/db/models.py

SQLAlchemy ORM models for Trustgram: User, Post, Comment, Like, Bookmark, Follow,
Notification, Message, Report, VerificationVote, and VerificationRecord.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class User(Base):
    """User account model with authentication and profile info."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone_number = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    avatar = Column(String(500), nullable=True)
    website = Column(String(500), nullable=True)
    is_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    is_suspended = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="user", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")
    followers = relationship("Follow", foreign_keys="Follow.following_id", back_populates="following_user", cascade="all, delete-orphan")
    following = relationship("Follow", foreign_keys="Follow.follower_id", back_populates="follower_user", cascade="all, delete-orphan")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender", cascade="all, delete-orphan")
    received_messages = relationship("Message", foreign_keys="Message.recipient_id", back_populates="recipient", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    reports_submitted = relationship("Report", foreign_keys="Report.reporter_id", back_populates="reporter", cascade="all, delete-orphan")
    votes = relationship("VerificationVote", back_populates="user", cascade="all, delete-orphan")


class Post(Base):
    """Social media post with verification scores and metadata."""
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    caption = Column(Text, nullable=True)
    media_url = Column(String(500), nullable=True)
    media_type = Column(String(50), nullable=True)  # "image", "video", "text"
    source_url = Column(String(500), nullable=True)
    hashtags = Column(Text, nullable=True)  # Comma-separated or JSON
    
    # Verification scores (0-100)
    verdict = Column(String(50), nullable=True)  # "Reliable", "Mostly Reliable", "Needs Verification", "Misleading"
    confidence_score = Column(Float, nullable=True)
    text_score = Column(Float, nullable=True)
    image_score = Column(Float, nullable=True)
    deepfake_score = Column(Float, nullable=True)
    originality_score = Column(Float, nullable=True)
    source_score = Column(Float, nullable=True)
    
    # Metadata
    sha256_hash = Column(String(64), index=True, nullable=True)
    metadata_analysis = Column(Text, nullable=True)  # JSON
    warnings = Column(Text, nullable=True)  # JSON array of warnings
    message = Column(Text, nullable=True)  # Human-readable explanation
    similar_count = Column(Integer, default=0)  # Count of similar posts
    earliest_date = Column(DateTime, nullable=True)  # Earliest known date online
    
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="post", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="post", cascade="all, delete-orphan")
    verification_votes = relationship("VerificationVote", back_populates="post", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="post", cascade="all, delete-orphan")


class Comment(Base):
    """Comments and threaded replies on posts."""
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True)  # For nested replies
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    post = relationship("Post", back_populates="comments")
    user = relationship("User", back_populates="comments")
    replies = relationship("Comment", remote_side=[id], cascade="all, delete-orphan")


class Like(Base):
    """User likes on posts."""
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    post = relationship("Post", back_populates="likes")
    user = relationship("User", back_populates="likes")


class Bookmark(Base):
    """User bookmarks (saved posts)."""
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    post = relationship("Post", back_populates="bookmarks")
    user = relationship("User", back_populates="bookmarks")


class Follow(Base):
    """User follow relationships."""
    __tablename__ = "follows"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    follower_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    following_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String(50), default="active")  # "active", "pending", "blocked"
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    follower_user = relationship("User", foreign_keys=[follower_id])
    following_user = relationship("User", foreign_keys=[following_id])


class Notification(Base):
    """User notifications (likes, comments, follows, messages, verifications)."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    type = Column(String(50), nullable=False)  # "like", "comment", "follow", "message", "verification", "report"
    message = Column(Text, nullable=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="notifications", foreign_keys=[user_id])


class Message(Base):
    """Direct messages between users."""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    text = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="received_messages")


class Report(Base):
    """User reports for posts, comments, and users."""
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    target_type = Column(String(50), nullable=False)  # "post", "comment", "user"
    target_id = Column(Integer, nullable=False)  # post_id, comment_id, or user_id
    reason = Column(String(255), nullable=False)  # "misinformation", "manipulated_media", "spam", "harassment", "fake_account", "other"
    details = Column(Text, nullable=True)
    status = Column(String(50), default="open")  # "open", "investigating", "resolved", "dismissed"
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    reporter = relationship("User", back_populates="reports_submitted", foreign_keys=[reporter_id])
    post = relationship("Post", back_populates="reports", foreign_keys=[target_id])


class VerificationVote(Base):
    """Community fact-checking votes on posts."""
    __tablename__ = "verification_votes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    vote_type = Column(String(50), nullable=False)  # "true", "false", "misleading", "cannot_verify"
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    post = relationship("Post", back_populates="verification_votes")
    user = relationship("User", back_populates="votes")


class VerificationRecord(Base):
    """
    Stores an audit log of every post/image verification request.
    Tracks SHA-256 image hashes, post text, individual sub-scores, and overall verdicts.
    """
    __tablename__ = "verification_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    sha256_hash = Column(String(64), index=True, nullable=True)
    post_text = Column(Text, nullable=True)
    post_url = Column(Text, nullable=True)
    verdict = Column(String(50), nullable=False)
    confidence_score = Column(Float, nullable=False)
    text_score = Column(Float, nullable=True)
    image_score = Column(Float, nullable=True)
    deepfake_score = Column(Float, nullable=True)
    originality_score = Column(Float, nullable=True)
    source_score = Column(Float, nullable=True)
    c2pa_valid = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
