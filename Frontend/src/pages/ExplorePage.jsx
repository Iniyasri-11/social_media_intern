import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarNav from '../components/SidebarNav';
import CreatePostModal from '../components/CreatePostModal';
import AuditModal from '../components/AuditModal';
import { useProfile } from '../ProfileContext';
import { Search, ShieldCheck, Heart, MessageCircle, Sparkles, Flame, Camera, Cpu, Globe } from 'lucide-react';

const EXPLORE_POSTS = [
  {
    id: 'exp_1',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    caption: 'Silicon photonics optical processor wafer tested under laser microscope.',
    author: { name: 'Dr. Alistair Chen', username: 'al_vision_lab', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', verified: true },
    likes: 4210,
    commentsCount: 92,
    verdict: 'Authentic',
    confidence_score: 0.99,
    category: 'tech',
  },
  {
    id: 'exp_2',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    caption: 'First light piercing through the ancient temperate rainforest canopy.',
    author: { name: 'Elena Vance Lens', username: 'elena_lens', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', verified: true },
    likes: 8320,
    commentsCount: 154,
    verdict: 'Authentic',
    confidence_score: 0.97,
    category: 'nature',
  },
  {
    id: 'exp_3',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    caption: 'Cybernetic architectural synthesis in simulated Tokyo 2099.',
    author: { name: 'Cyber Design', username: 'cyber_future_art', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', verified: false },
    likes: 1205,
    commentsCount: 38,
    verdict: 'Suspicious',
    confidence_score: 0.38,
    category: 'ai_art',
  },
  {
    id: 'exp_4',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    caption: 'Galactic core starburst emission captured in high-resolution infrared spectrum.',
    author: { name: 'Cosmic Observatories', username: 'cosmos_astro', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', verified: true },
    likes: 12400,
    commentsCount: 420,
    verdict: 'Authentic',
    confidence_score: 0.99,
    category: 'tech',
  },
  {
    id: 'exp_5',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&auto=format&fit=crop&q=80',
    caption: 'Rare violet northern lights over Tromsø fjord.',
    author: { name: 'Arctic Expeditions', username: 'arctic_live', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', verified: true },
    likes: 6710,
    commentsCount: 88,
    verdict: 'Authentic',
    confidence_score: 0.94,
    category: 'nature',
  },
  {
    id: 'exp_6',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80',
    caption: 'Financial district morning opening bells and economic indicator review.',
    author: { name: 'Reuters World News', username: 'reuters_world', avatar: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=150&auto=format&fit=crop&q=80', verified: true },
    likes: 3100,
    commentsCount: 45,
    verdict: 'Authentic',
    confidence_score: 0.96,
    category: 'news',
  },
];

export default function ExplorePage() {
  const { profile, addUserPost } = useProfile();
  const [posts, setPosts] = useState(EXPLORE_POSTS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [auditTargetPost, setAuditTargetPost] = useState(null);

  const categories = [
    { id: 'all', label: 'Explore All' },
    { id: 'nature', label: '🌿 Photography & Nature' },
    { id: 'tech', label: '🔬 Science & Optics' },
    { id: 'news', label: '📰 Verified Journalism' },
    { id: 'ai_art', label: '🤖 AI & 3D Concepts' },
  ];

  const filteredPosts = posts.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.caption.toLowerCase().includes(q) || p.author.name.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="trustgram-layout explore-layout-view">
      <SidebarNav onCreateClick={() => setIsCreateOpen(true)} />

      <main className="trustgram-feed-container explore-container">
        {/* Explore Search & Category Pills */}
        <div className="explore-header-bar">
          <div className="feed-search-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search authentic photos, topics, lenses, or hashtags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="feed-search-input"
            />
          </div>

          <div className="filter-chips-row">
            {categories.map(c => (
              <button
                key={c.id}
                className={`filter-chip ${selectedCategory === c.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3x3 Explore Grid */}
        <div className="explore-media-grid">
          {filteredPosts.map(post => (
            <div
              key={post.id}
              className="explore-grid-item"
              onClick={() => setAuditTargetPost(post)}
            >
              <img src={post.image} alt={post.caption} className="explore-grid-img" />

              <div className="explore-badge-tag">
                <ShieldCheck size={13} /> {Math.round(post.confidence_score * 100)}%
              </div>

              <div className="explore-hover-overlay">
                <div className="explore-author-chip">
                  <img src={post.author.avatar} alt="avatar" />
                  <span>@{post.author.username}</span>
                </div>
                <div className="explore-stats-row">
                  <div className="stat-pill">
                    <Heart size={16} fill="#fff" />
                    <span>{post.likes.toLocaleString()}</span>
                  </div>
                  <div className="stat-pill">
                    <MessageCircle size={16} fill="#fff" />
                    <span>{post.commentsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {isCreateOpen && (
        <CreatePostModal
          user={profile}
          onClose={() => setIsCreateOpen(false)}
          onPostCreated={(post) => addUserPost(post)}
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
