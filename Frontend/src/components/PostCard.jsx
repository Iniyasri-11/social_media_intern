import { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  MoreHorizontal,
  Sparkles,
  Check,
  Trash2,
  Clock,
  PlusSquare,
} from 'lucide-react';
import ShareModal from './ShareModal';
import { useProfile } from '../ProfileContext';

export default function PostCard({ post, user, onAuditClick, onDeletePost }) {
  const { profile, deleteUserPost, toggleFollow, getFollowStatus, addMyStory } = useProfile();
  const [likes, setLikes] = useState(post.likes || 124);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [showComments, setShowComments] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [comments, setComments] = useState(post.commentsList || [
    { id: 1, user: 'david_lens', text: 'Checked the EXIF tags, crystal clear optical glass!' },
    { id: 2, user: 'sarah_ai', text: 'Love the neural transparency feature on Trustgram.' },
  ]);
  const [newComment, setNewComment] = useState('');

  const isOwnPost = post.author?.username === profile.username || post.author?.username === 'you';
  const followStatus = getFollowStatus(post.author?.username);

  const handleToggleLike = () => {
    setIsLiked(prev => !prev);
    setLikes(prev => (isLiked ? prev - 1 : prev + 1));
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const item = {
      id: Date.now(),
      user: user?.username || profile.username || 'you',
      text: newComment.trim(),
    };
    setComments(prev => [...prev, item]);
    setNewComment('');
  };

  const handleDelete = (e) => {
    if (e) e.stopPropagation();
    const promptText = isOwnPost
      ? 'Delete this post permanently from Trustgram?'
      : 'Remove this post from your feed?';
    if (window.confirm(promptText)) {
      deleteUserPost(post.id);
      if (onDeletePost) onDeletePost(post.id);
      setShowMoreMenu(false);
    }
  };

  const handleAddToStory = () => {
    addMyStory({
      media: post.image,
      caption: post.caption || 'Shared moment 🛡️',
      verdict: post.verdict || 'Authentic',
    });
    setShowMoreMenu(false);
    setToastMsg('Added to your story!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const verdict = post.verdict || (post.confidence_score >= 0.7 ? 'Authentic' : post.confidence_score >= 0.4 ? 'Suspicious' : 'Likely Misinformation');
  const isAuth = verdict.toLowerCase().includes('authentic') || verdict.toLowerCase().includes('true');
  const isSusp = verdict.toLowerCase().includes('suspicious');
  const pct = Math.round((post.confidence_score ?? 0.85) * 100);
  const postShareUrl = `${window.location.origin}/#${post.id}`;

  return (
    <>
      <article className="post-card">
        {/* Header */}
        <div className="post-header">
          <div className="post-author-group">
            <div className="post-author-avatar-wrap">
              <img
                src={isOwnPost ? profile.avatar : (post.author?.avatar || profile.avatar)}
                alt={post.author?.name || 'author'}
                className="post-author-avatar"
              />
            </div>
            <div className="post-author-info">
              <div className="author-name-row">
                <span className="author-name">{isOwnPost ? profile.name : post.author?.name}</span>
                {post.author?.verified && (
                  <span className="badge-verified-author" title="Trustgram Verified Creator">
                    <ShieldCheck size={14} />
                  </span>
                )}
                <span className="dot-sep">•</span>
                <span className="post-time">{post.timeAgo || 'Just now'}</span>
              </div>
              <span className="author-handle">@{isOwnPost ? profile.username : post.author?.username}</span>
            </div>
          </div>

          <div className="post-header-actions">
            {!isOwnPost && (
              <button
                className={`btn-follow-toggle ${
                  followStatus === 'requested'
                    ? 'btn-requested-pill'
                    : followStatus === 'following'
                    ? 'btn-is-following'
                    : 'btn-follow-action'
                }`}
                onClick={() => toggleFollow(post.author)}
                title={followStatus === 'requested' ? 'Follow Request Sent' : followStatus === 'following' ? 'Following' : 'Follow'}
              >
                {followStatus === 'requested' ? (
                  <><Clock size={12} /> Requested</>
                ) : followStatus === 'following' ? (
                  'Following'
                ) : (
                  'Follow'
                )}
              </button>
            )}
            
            <div className="more-menu-container">
              <button
                className="btn-post-more"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              >
                <MoreHorizontal size={18} />
              </button>
              
              {showMoreMenu && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                    onClick={() => setShowMoreMenu(false)}
                  />
                  <div className="post-options-dropdown" onClick={e => e.stopPropagation()}>
                    <button className="dropdown-item item-delete" onClick={handleDelete}>
                      <Trash2 size={16} /> {isOwnPost ? 'Delete Post' : 'Remove from Feed'}
                    </button>
                    <button className="dropdown-item" onClick={handleAddToStory}>
                      <PlusSquare size={16} /> Add to Story
                    </button>
                    <button className="dropdown-item" onClick={() => { setIsShareModalOpen(true); setShowMoreMenu(false); }}>
                      <Send size={16} /> Share Post
                    </button>
                    <button className="dropdown-item" onClick={() => { onAuditClick(post); setShowMoreMenu(false); }}>
                      <ShieldCheck size={16} /> View Trust Audit
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Temporary action toast */}
        {toastMsg && (
          <div className="followers-toast-notice" style={{ margin: '0 1rem 0.5rem' }}>
            <Check size={14} className="text-green" /> {toastMsg}
          </div>
        )}

        {/* Media Image with floating Authenticity Tag */}
        <div className="post-media-container">
          <img
            src={post.image}
            alt={post.caption}
            className="post-media-image"
            onDoubleClick={handleToggleLike}
          />

          <button
            className={`post-authenticity-ribbon ${isAuth ? 'ribbon-auth' : isSusp ? 'ribbon-susp' : 'ribbon-fake'}`}
            onClick={() => onAuditClick(post)}
            title="Click to view full AI Authenticity Audit breakdown"
          >
            {isAuth ? <ShieldCheck size={16} /> : isSusp ? <AlertTriangle size={16} /> : <XCircle size={16} />}
            <span>{pct}% {verdict}</span>
            <span className="ribbon-audit-hint">Audit ➔</span>
          </button>
        </div>

        {/* Engagement Actions Bar */}
        <div className="post-actions-bar">
          <div className="actions-left">
            <button
              className={`btn-action ${isLiked ? 'action-liked' : ''}`}
              onClick={handleToggleLike}
              title="Like"
            >
              <Heart size={22} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : 'currentColor'} />
            </button>

            <button
              className="btn-action"
              onClick={() => setShowComments(!showComments)}
              title="Comments"
            >
              <MessageCircle size={22} />
            </button>

            <button
              className="btn-action"
              onClick={() => setIsShareModalOpen(true)}
              title="Share post & view link"
            >
              <Send size={22} />
            </button>
          </div>

          <div className="actions-right">
            <button
              className={`btn-action ${isBookmarked ? 'action-bookmarked' : ''}`}
              onClick={() => setIsBookmarked(!isBookmarked)}
              title="Save"
            >
              <Bookmark size={22} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Like Count & Caption */}
        <div className="post-body">
          <div className="post-likes-count">
            <strong>{likes.toLocaleString()} likes</strong>
          </div>

          <div className="post-caption-block">
            <span className="caption-author">@{isOwnPost ? profile.username : post.author?.username}</span>
            <span className="caption-text"> {post.caption}</span>
          </div>

          {/* AI Trust Snippet */}
          <div className="post-trust-snippet" onClick={() => onAuditClick(post)}>
            <Sparkles size={14} className="trust-snippet-icon" />
            <span>
              {isAuth
                ? `Verified Authentic • Camera EXIF & Vision Models passed`
                : `Flagged as ${verdict} • Click for multi-modal audit report`}
            </span>
          </div>

          {/* Comments Toggle */}
          <button
            className="btn-view-comments"
            onClick={() => setShowComments(!showComments)}
          >
            {showComments ? 'Hide comments' : `View all ${comments.length} comments`}
          </button>

          {/* Comments Drawer / Thread */}
          {showComments && (
            <div className="post-comments-thread">
              {comments.map(c => (
                <div key={c.id} className="comment-row">
                  <strong className="comment-user">@{c.user}</strong>
                  <span className="comment-text">{c.text}</span>
                </div>
              ))}

              <form onSubmit={handleAddComment} className="comment-input-form">
                <input
                  type="text"
                  placeholder="Add a comment on authenticity..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="comment-inline-input"
                />
                <button
                  type="submit"
                  className="btn-post-comment"
                  disabled={!newComment.trim()}
                >
                  Post
                </button>
              </form>
            </div>
          )}
        </div>
      </article>

      {/* Share Dialog displaying full URL */}
      {isShareModalOpen && (
        <ShareModal
          title={post.caption}
          url={postShareUrl}
          thumbnail={post.image}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </>
  );
}
