import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { useProfile } from '../ProfileContext';
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import AuditModal from '../components/AuditModal';
import SidebarNav from '../components/SidebarNav';
import {
  ShieldCheck,
  Sun,
  Moon,
  Search,
  PlusSquare,
  Sparkles,
  TrendingUp,
  Flame,
  Check,
} from 'lucide-react';

const INITIAL_FEED_POSTS = [
  {
    id: 'post_1',
    author: {
      username: 'james_wildlife',
      name: 'James Wilson',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    timeAgo: '2h ago',
    caption: 'Bengal tiger drinking at dusk in Ranthambore Sanctuary. Shot on Canon EOS R5 with 400mm f/2.8L lens. Zero digital composite.',
    image: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=900&auto=format&fit=crop&q=80',
    likes: 3420,
    isLiked: false,
    isBookmarked: false,
    commentsList: [
      { id: 1, user: 'nat_geo_fan', text: 'Stunning raw camera capture! Verified EXIF looks solid.' },
      { id: 2, user: 'maya_lens', text: 'The depth of field and fur detail is incredible.' },
    ],
    verdict: 'Authentic',
    confidence_score: 0.98,
    text_score: 0.96,
    image_score: 0.99,
    sha256_hash: '3d9f1e8a8b1c4f5298d0092bf7e456ac781909a3bf835cb17c5b61e27a98213f',
    metadata_analysis: {
      format: 'JPEG',
      camera_make: 'Canon',
      camera_model: 'EOS R5 Hardware',
      software: 'Digital Photo Professional v4',
    },
    deepfake_analysis: {
      is_deepfake: false,
      deepfake_score: 0.99,
      raw_label: 'Real',
    },
    warnings: [],
    message: 'Cryptographically verified original camera capture with intact hardware timestamps.',
  },
  {
    id: 'post_2',
    author: {
      username: 'cyber_future_art',
      name: 'Cybernetic Design Lab',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      verified: false,
    },
    timeAgo: '5h ago',
    caption: 'BREAKING: Underground floating transit terminal unveiled in Neo-Seoul today. What do you think about futuristic city engineering?',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=900&auto=format&fit=crop&q=80',
    likes: 1840,
    isLiked: false,
    isBookmarked: false,
    commentsList: [
      { id: 1, user: 'fact_checker_99', text: 'This is 3D render concept art, not an actual subway station!' },
    ],
    verdict: 'Suspicious',
    confidence_score: 0.41,
    text_score: 0.52,
    image_score: 0.38,
    sha256_hash: '921bf3480cdfe0358bb01e0915ab9c34f0a2e7c102a00c6d713910c2834b6e79',
    metadata_analysis: {
      format: 'PNG',
      camera_make: 'Synthesized Renderer',
      camera_model: 'Midjourney / Blender 4.2',
      software: 'Blender 4.2 Cycles',
    },
    deepfake_analysis: {
      is_deepfake: true,
      deepfake_score: 0.32,
      raw_label: 'Fake / Synthetic',
    },
    warnings: [
      'Vision ML model detected synthetic diffusion noise artifacts.',
      'Missing physical optical lens signatures in EXIF stream.',
    ],
    message: 'Flagged as synthetic 3D/AI generation presented as factual breaking news.',
  },
  {
    id: 'post_3',
    author: {
      username: 'reuters_world',
      name: 'Reuters World News',
      avatar: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    timeAgo: '8h ago',
    caption: 'WASHINGTON — The Federal Reserve opted to maintain current benchmark interest rates following a two-day policy deliberation.',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=900&auto=format&fit=crop&q=80',
    likes: 5120,
    isLiked: false,
    isBookmarked: false,
    commentsList: [
      { id: 1, user: 'investor_sam', text: 'Markets expected this pause. Great factual reporting.' },
    ],
    verdict: 'Authentic',
    confidence_score: 0.95,
    text_score: 0.98,
    image_score: 0.92,
    sha256_hash: 'c87fa901e457d19c016e8b23ad432098b1a45700cf98132470ab0192e485a720',
    metadata_analysis: {
      format: 'JPEG',
      camera_make: 'Sony',
      camera_model: 'ILCE-7RM5',
      software: 'Adobe Photoshop Lightroom Classic',
    },
    deepfake_analysis: {
      is_deepfake: false,
      deepfake_score: 0.97,
      raw_label: 'Real',
    },
    warnings: [],
    message: 'Official journalistic dispatch verified across international wire feeds.',
  },
];

export default function LandingFeedPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { profile, addUserPost, toggleFollow, getFollowStatus } = useProfile();
  const navigate = useNavigate();

  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('trustgram_feed_posts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    return INITIAL_FEED_POSTS;
  });

  const [filter, setFilter] = useState('all'); // 'all' | 'authentic' | 'suspicious' | 'trending'
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [auditTargetPost, setAuditTargetPost] = useState(null);

  const handlePostCreated = (newPost) => {
    setPosts(prev => {
      const updated = [newPost, ...prev];
      localStorage.setItem('trustgram_feed_posts', JSON.stringify(updated));
      return updated;
    });
    addUserPost(newPost);
  };

  const handleDeleteFeedPost = (postId) => {
    setPosts(prev => {
      const updated = prev.filter(p => p.id !== postId);
      localStorage.setItem('trustgram_feed_posts', JSON.stringify(updated));
      return updated;
    });
  };

  const filteredPosts = posts.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = p.caption.toLowerCase().includes(q) ||
        p.author.name.toLowerCase().includes(q) ||
        p.author.username.toLowerCase().includes(q);
      if (!matchText) return false;
    }

    if (filter === 'authentic') {
      return p.verdict.toLowerCase().includes('authentic') || p.confidence_score >= 0.7;
    }
    if (filter === 'suspicious') {
      return p.verdict.toLowerCase().includes('suspicious') || p.confidence_score < 0.7;
    }
    if (filter === 'trending') {
      return p.likes > 2000;
    }
    return true;
  });

  return (
    <div className="trustgram-layout">
      {/* ══════════════════════════════════════
          SHARED INSTAGRAM SIDEBAR
      ══════════════════════════════════════ */}
      <SidebarNav
        onCreateClick={() => setIsCreateOpen(true)}
      />

      {/* ══════════════════════════════════════
          MAIN FEED CONTENT
      ══════════════════════════════════════ */}
      <main className="trustgram-feed-container">
        
        {/* Mobile Topbar */}
        <header className="mobile-header">
          <div className="brand-logo-inline" onClick={() => navigate('/')}>
            <ShieldCheck size={22} />
            <span>Trustgram</span>
          </div>
          <div className="mobile-header-actions">
            <button className="btn-icon-round" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="btn-icon-round" onClick={() => setIsCreateOpen(true)}>
              <PlusSquare size={18} />
            </button>
          </div>
        </header>

        {/* Search & Filter Header Bar */}
        <div className="feed-header-bar">
          <div className="feed-search-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search authentic posts, creators, or topics..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="feed-search-input"
            />
          </div>

          <div className="filter-chips-row">
            <button
              className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Posts
            </button>
            <button
              className={`filter-chip chip-auth ${filter === 'authentic' ? 'active' : ''}`}
              onClick={() => setFilter('authentic')}
            >
              🛡️ Verified Authentic
            </button>
            <button
              className={`filter-chip chip-susp ${filter === 'suspicious' ? 'active' : ''}`}
              onClick={() => setFilter('suspicious')}
            >
              ⚠️ Flagged / AI Risk
            </button>
            <button
              className={`filter-chip ${filter === 'trending' ? 'active' : ''}`}
              onClick={() => setFilter('trending')}
            >
              🔥 Trending
            </button>
          </div>
        </div>

        {/* Instagram Stories Carousel */}
        <StoriesBar
          user={profile}
          onAddStoryClick={() => setIsCreateOpen(true)}
        />

        {/* Create Post Banner Callout */}
        <div className="feed-create-banner" onClick={() => setIsCreateOpen(true)}>
          <div className="create-banner-avatar">
            <img src={profile.avatar} alt="You" />
          </div>
          <div className="create-banner-text">
            <span>Share a moment with AI Authenticity Verification...</span>
          </div>
          <button className="btn-banner-upload">
            <PlusSquare size={18} /> Create
          </button>
        </div>

        {/* Feed Posts List */}
        <div className="posts-feed-stream">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                user={profile}
                onAuditClick={setAuditTargetPost}
                onDeletePost={handleDeleteFeedPost}
              />
            ))
          ) : (
            <div className="empty-feed-card">
              <ShieldCheck size={48} className="text-muted" />
              <h3>No posts found matching filter</h3>
              <p>Try clearing your search or explore other authenticity categories.</p>
              <button className="btn-primary" onClick={() => { setFilter('all'); setSearchQuery(''); }}>
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ══════════════════════════════════════
          RIGHT SIDEBAR (Widgets & Fact Checks)
      ══════════════════════════════════════ */}
      <aside className="trustgram-widgets-sidebar">
        
        {/* User Mini Profile Widget */}
        <div className="widget-card user-trust-widget" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <div className="widget-user-header">
            <img src={profile.avatar} alt="profile" className="widget-user-avatar" />
            <div>
              <h4>{profile.name}</h4>
              <p className="widget-user-handle">@{profile.username}</p>
            </div>
          </div>
          <div className="trust-meter-box">
            <div className="trust-meter-row">
              <span>Account Trust Rating</span>
              <strong className="text-green">{profile.trustScore}%</strong>
            </div>
            <div className="trust-meter-track">
              <div className="trust-meter-fill" style={{ width: `${profile.trustScore}%` }} />
            </div>
            <span className="trust-meter-sub">
              {profile.followingCount} following • {profile.followersCount} followers
            </span>
          </div>
        </div>

        {/* Live AI Fact-Checking Stream */}
        <div className="widget-card">
          <div className="widget-header-title">
            <Sparkles size={18} className="text-indigo" />
            <h3>Live Neural Fact-Checks</h3>
          </div>
          <div className="fact-checks-list">
            <div className="fact-item">
              <span className="fact-tag tag-verified">✓ Confirmed Fact</span>
              <p className="fact-text">JWST space telescope captures gravitational lensing anomaly.</p>
              <span className="fact-source">Source: NASA / ESA Bulletin</span>
            </div>
            <div className="fact-item">
              <span className="fact-tag tag-debunk">⚠️ Debunked Rumor</span>
              <p className="fact-text">Viral image of purple snowfall in Switzerland identified as Photoshop composite.</p>
              <span className="fact-source">Source: Trustgram EXIF Engine</span>
            </div>
          </div>
        </div>

        {/* Suggested Creators */}
        <div className="widget-card">
          <div className="widget-header-title">
            <TrendingUp size={18} className="text-blue" />
            <h3>Suggested Verified Creators</h3>
          </div>
          <div className="suggested-users-list">
            {[
              { username: 'natgeo', name: 'National Geographic', avatar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80' },
              { username: 'al_vision_lab', name: 'Dr. Alistair Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
              { username: 'elena_lens', name: 'Elena Vance Lens', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
            ].map(creator => {
              const status = getFollowStatus(creator.username);
              return (
                <div key={creator.username} className="suggested-user-row">
                  <img src={creator.avatar} alt={creator.name} className="suggested-avatar" />
                  <div className="suggested-info">
                    <span className="suggested-name">{creator.name}</span>
                    <span className="suggested-handle">@{creator.username}</span>
                  </div>
                  <button
                    className={`btn-suggested-follow ${
                      status === 'requested'
                        ? 'btn-requested-pill'
                        : status === 'following'
                        ? 'is-following'
                        : ''
                    }`}
                    onClick={() => toggleFollow(creator)}
                  >
                    {status === 'requested' ? 'Requested' : status === 'following' ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <footer className="widget-footer">
          <p>© 2026 Trustgram • AI-Driven Media Authenticity Platform</p>
          <div className="footer-links">
            <a href="#privacy">Privacy</a> • <a href="#terms">Terms</a> • <a href="#neural">Neural API</a>
          </div>
        </footer>
      </aside>

      {/* ══════════════════════════════════════
          MODALS
      ══════════════════════════════════════ */}
      {isCreateOpen && (
        <CreatePostModal
          user={profile}
          onClose={() => setIsCreateOpen(false)}
          onPostCreated={handlePostCreated}
        />
      )}

      {auditTargetPost && (
        <AuditModal
          post={auditTargetPost}
          onClose={() => setAuditTargetPost(null)}
        />
      )}
    </div>
  );
}
