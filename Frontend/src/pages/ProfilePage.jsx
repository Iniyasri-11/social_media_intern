import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../ProfileContext';
import { useTheme } from '../ThemeContext';
import SidebarNav from '../components/SidebarNav';
import EditProfileModal from '../components/EditProfileModal';
import FollowersModal from '../components/FollowersModal';
import CreatePostModal from '../components/CreatePostModal';
import AuditModal from '../components/AuditModal';
import ShareModal from '../components/ShareModal';
import CreateHighlightModal from '../components/CreateHighlightModal';
import HighlightViewerModal from '../components/HighlightViewerModal';
import {
  Grid,
  Bookmark,
  ShieldCheck,
  Globe,
  Camera,
  Heart,
  MessageCircle,
  Plus,
  Share2,
  Trash2,
  Layers,
  Sparkles,
  X,
  Film,
} from 'lucide-react';

export default function ProfilePage() {
  const {
    profile,
    userPosts,
    savedPosts,
    highlights,
    addUserPost,
    deleteUserPost,
    deleteHighlight,
  } = useProfile();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'saved' | 'audits'
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState(null); // 'followers' | 'following' | null
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [auditTargetPost, setAuditTargetPost] = useState(null);
  const [shareModalData, setShareModalData] = useState(null); // { title, url, thumbnail } | null
  const [selectedGridPost, setSelectedGridPost] = useState(null);

  // Story Highlight Modals
  const [isCreateHighlightOpen, setIsCreateHighlightOpen] = useState(false);
  const [activeViewerHighlight, setActiveViewerHighlight] = useState(null);

  const handleShareProfile = () => {
    setShareModalData({
      title: `${profile.name} (@${profile.username}) on Trustgram`,
      url: window.location.href,
      thumbnail: profile.avatar,
    });
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('Delete this post permanently from your profile?')) {
      deleteUserPost(postId);
      setSelectedGridPost(null);
    }
  };

  const followersCount = profile.followersCount ?? (profile.followersList?.length || 0);
  const followingCount = profile.followingCount ?? (profile.followingList?.length || 0);

  return (
    <div className="trustgram-layout profile-layout-view">
      {/* ── Left Sidebar ── */}
      <SidebarNav onCreateClick={() => setIsCreateOpen(true)} />

      {/* ── Profile Main Content ── */}
      <main className="trustgram-feed-container profile-container">
        
        {/* Profile Header */}
        <section className="profile-header-card">
          <div className="profile-avatar-column">
            <div className="profile-avatar-ring" onClick={() => setIsEditOpen(true)} title="Click to Change Profile Avatar">
              <img src={profile.avatar} alt={profile.name} className="profile-main-avatar" />
              <div className="avatar-edit-overlay">
                <Camera size={22} className="text-white" />
              </div>
            </div>
          </div>

          <div className="profile-info-column">
            {/* Username & Action Buttons Row */}
            <div className="profile-top-row">
              <div className="profile-username-group">
                <h2 className="profile-username-text">@{profile.username}</h2>
                {profile.isVerified && (
                  <span className="profile-verified-badge" title="Trustgram Verified Member">
                    <ShieldCheck size={18} />
                  </span>
                )}
                <span className="profile-trust-pill">🛡️ {profile.trustScore}% Trust Score</span>
              </div>

              <div className="profile-actions-row">
                <button className="btn-profile-edit" onClick={() => setIsEditOpen(true)}>
                  Edit profile
                </button>
                <button className="btn-profile-share" onClick={handleShareProfile} title="Share Profile Link">
                  <Share2 size={16} />
                </button>
                <button className="btn-profile-settings" onClick={() => navigate('/verify')} title="Verification Lab">
                  <Layers size={16} />
                </button>
              </div>
            </div>

            {/* Counts Row: Posts, Followers, Following */}
            <div className="profile-stats-row">
              <div className="stat-item">
                <strong>{userPosts.length}</strong> posts
              </div>
              <button
                className="stat-item stat-clickable"
                onClick={() => setFollowersModalTab('followers')}
              >
                <strong>{followersCount}</strong> followers
              </button>
              <button
                className="stat-item stat-clickable"
                onClick={() => setFollowersModalTab('following')}
              >
                <strong>{followingCount}</strong> following
              </button>
            </div>

            {/* Bio & Links */}
            <div className="profile-bio-block">
              <h1 className="profile-full-name">{profile.name}</h1>
              <p className="profile-bio-text">{profile.bio}</p>
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="profile-link"
                >
                  <Globe size={14} /> {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Highlights Bar with Interactive Story Viewer & Add Highlight */}
        <section className="profile-highlights-tray">
          {highlights.map(h => (
            <div
              key={h.id}
              className="highlight-item"
              onClick={() => setActiveViewerHighlight(h)}
              title={`View "${h.title}" story highlight`}
            >
              <div className="highlight-ring-wrap">
                <div className="highlight-ring">
                  <img src={h.cover} alt={h.title} className="highlight-avatar" />
                </div>
                <button
                  className="btn-delete-highlight"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete the "${h.title}" highlight?`)) {
                      deleteHighlight(h.id);
                    }
                  }}
                  title="Delete Highlight"
                >
                  <X size={12} />
                </button>
              </div>
              <span className="highlight-title">{h.title}</span>
            </div>
          ))}

          <div
            className="highlight-item"
            onClick={() => setIsCreateHighlightOpen(true)}
            title="Create new story highlight with videos, reels, or stories"
          >
            <div className="highlight-ring highlight-add">
              <Plus size={24} className="text-muted" />
            </div>
            <span className="highlight-title">New Highlight</span>
          </div>
        </section>

        {/* Navigation Tabs (POSTS | SAVED | AUDITS) */}
        <div className="profile-tabs-nav">
          <button
            className={`profile-tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <Grid size={16} />
            <span>POSTS ({userPosts.length})</span>
          </button>
          <button
            className={`profile-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <Bookmark size={16} />
            <span>SAVED ({savedPosts.length})</span>
          </button>
          <button
            className={`profile-tab-btn ${activeTab === 'audits' ? 'active' : ''}`}
            onClick={() => setActiveTab('audits')}
          >
            <ShieldCheck size={16} />
            <span>AUDIT LEDGER</span>
          </button>
        </div>

        {/* TAB 1: POSTS GRID (Instagram 3x3) */}
        {activeTab === 'posts' && (
          userPosts.length > 0 ? (
            <div className="profile-posts-grid">
              {userPosts.map(post => (
                <div
                  key={post.id}
                  className="grid-post-card"
                  onClick={() => setSelectedGridPost(post)}
                >
                  <img src={post.image} alt={post.caption} className="grid-post-img" />
                  
                  <div className="grid-authenticity-badge">
                    <ShieldCheck size={12} /> {Math.round(post.confidence_score * 100)}%
                  </div>

                  <div className="grid-hover-overlay">
                    <div className="overlay-stat">
                      <Heart size={18} fill="#fff" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="overlay-stat">
                      <MessageCircle size={18} fill="#fff" />
                      <span>{post.commentsCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-tab-box">
              <Camera size={44} className="text-muted" />
              <h4>No Posts Yet</h4>
              <p>Upload and verify your first authentic moment to share with the Trustgram community.</p>
              <button className="btn-primary" onClick={() => setIsCreateOpen(true)}>
                <Plus size={16} /> Create First Post
              </button>
            </div>
          )
        )}

        {/* TAB 2: SAVED POSTS */}
        {activeTab === 'saved' && (
          <div className="profile-saved-tab">
            {savedPosts.length > 0 ? (
              <div className="profile-posts-grid">
                {savedPosts.map(post => (
                  <div
                    key={post.id}
                    className="grid-post-card"
                    onClick={() => setAuditTargetPost(post)}
                  >
                    <img src={post.image} alt={post.caption} className="grid-post-img" />
                    <div className="grid-hover-overlay">
                      <span style={{ color: '#fff', fontSize: '0.85rem' }}>Saved Post</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-tab-box">
                <Bookmark size={40} className="text-muted" />
                <h4>Save posts from the feed</h4>
                <p>When you bookmark photos and verified reports, they will be securely stored here.</p>
                <button className="btn-primary" onClick={() => navigate('/')}>
                  Explore Feed
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUTHENTICITY AUDIT LEDGER */}
        {activeTab === 'audits' && (
          <div className="profile-audits-tab">
            <div className="audit-ledger-header">
              <Sparkles size={20} className="text-indigo" />
              <div>
                <h4>Cryptographic Trust Ledger</h4>
                <p>Immutable record of your verified camera signatures, SHA-256 hashes, and deepfake certifications.</p>
              </div>
            </div>

            <div className="audits-list-cards">
              {userPosts.map(post => (
                <div key={post.id} className="audit-ledger-row">
                  <img src={post.image} alt="thumb" className="audit-row-thumb" />
                  <div className="audit-row-info">
                    <div className="audit-row-title-line">
                      <span className="audit-row-verdict tag-pass">✓ {post.verdict}</span>
                      <span className="audit-row-score">Score: {Math.round(post.confidence_score * 100)}%</span>
                      <span className="dot-sep">•</span>
                      <span className="post-time">{post.createdAt}</span>
                    </div>
                    <p className="audit-row-caption">{post.caption}</p>
                    <span className="audit-row-hash">Ledger ID: #TRG-{post.id.slice(-6)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn-audit-inspect"
                      onClick={() => setAuditTargetPost(post)}
                    >
                      Audit Details
                    </button>
                    <button
                      className="btn-audit-delete"
                      onClick={() => handleDeletePost(post.id)}
                      title="Delete Post"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ── Post Detail / Options Modal with Delete & Share ── */}
      {selectedGridPost && (
        <div className="modal-backdrop" onClick={() => setSelectedGridPost(null)}>
          <div className="modal-content post-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="brand-shield-logo" style={{ width: 34, height: 34 }}>
                  <ShieldCheck size={18} className="text-white" />
                </div>
                <div>
                  <h3>Post Details</h3>
                  <p className="modal-subtitle">Verified on Trustgram</p>
                </div>
              </div>
              <button className="btn-icon-close" onClick={() => setSelectedGridPost(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <img src={selectedGridPost.image} alt="post" className="post-detail-modal-img" />
              <p className="post-detail-modal-caption">{selectedGridPost.caption}</p>

              <div className="post-detail-actions-row">
                <button
                  className="btn-primary"
                  onClick={() => {
                    setShareModalData({
                      title: selectedGridPost.caption,
                      url: `${window.location.origin}/#${selectedGridPost.id}`,
                      thumbnail: selectedGridPost.image,
                    });
                    setSelectedGridPost(null);
                  }}
                >
                  <Share2 size={16} /> Share Post (View URL)
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => {
                    setAuditTargetPost(selectedGridPost);
                    setSelectedGridPost(null);
                  }}
                >
                  <ShieldCheck size={16} /> Trust Audit
                </button>

                <button
                  className="btn-delete-action"
                  onClick={() => handleDeletePost(selectedGridPost.id)}
                >
                  <Trash2 size={16} /> Delete Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Story / Reel Highlight Modal ── */}
      {isCreateHighlightOpen && (
        <CreateHighlightModal onClose={() => setIsCreateHighlightOpen(false)} />
      )}

      {/* ── Story Highlight Viewer Modal ── */}
      {activeViewerHighlight && (
        <HighlightViewerModal
          highlight={activeViewerHighlight}
          onClose={() => setActiveViewerHighlight(null)}
          onDeleteHighlight={(id) => deleteHighlight(id)}
        />
      )}

      {/* ── Edit Profile Modal ── */}
      {isEditOpen && (
        <EditProfileModal onClose={() => setIsEditOpen(false)} />
      )}

      {/* ── Followers / Following / Requested Modal ── */}
      {followersModalTab && (
        <FollowersModal
          initialTab={followersModalTab}
          onClose={() => setFollowersModalTab(null)}
        />
      )}

      {/* ── Create Post Modal ── */}
      {isCreateOpen && (
        <CreatePostModal
          user={profile}
          onClose={() => setIsCreateOpen(false)}
          onPostCreated={(post) => addUserPost(post)}
        />
      )}

      {/* ── Share Modal (Displays URL explicitly) ── */}
      {shareModalData && (
        <ShareModal
          title={shareModalData.title}
          url={shareModalData.url}
          thumbnail={shareModalData.thumbnail}
          onClose={() => setShareModalData(null)}
        />
      )}

      {/* ── Trust Audit Modal ── */}
      {auditTargetPost && (
        <AuditModal
          post={auditTargetPost}
          onClose={() => setAuditTargetPost(null)}
        />
      )}
    </div>
  );
}
