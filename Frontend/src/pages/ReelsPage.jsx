import { useState } from 'react';
import SidebarNav from '../components/SidebarNav';
import CreatePostModal from '../components/CreatePostModal';
import AuditModal from '../components/AuditModal';
import { useProfile } from '../ProfileContext';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  ShieldCheck,
  Music,
  MoreVertical,
  Volume2,
  VolumeX,
  Sparkles,
  Check,
} from 'lucide-react';

const REELS_DATA = [
  {
    id: 'reel_1',
    videoPoster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    caption: 'Majestic waterfall cascade in Iceland filmed on Sony FX3 cinema line. 🌊 #nature #iceland #cinematography',
    author: {
      name: 'Elena Vance',
      username: 'elena_lens',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    audio: 'Original Sound — @elena_lens (Cinematic Ambience)',
    likes: 18420,
    commentsCount: 312,
    verdict: 'Authentic',
    confidence_score: 0.99,
  },
  {
    id: 'reel_2',
    videoPoster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    caption: 'Synthesized Unreal Engine 5 quantum cityscape rendering test ⚡',
    author: {
      name: 'Cyber Future Art',
      username: 'cyber_future_art',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      verified: false,
    },
    audio: 'Cyberpunk Synthwave Vol. 4',
    likes: 4120,
    commentsCount: 94,
    verdict: 'Suspicious',
    confidence_score: 0.42,
  },
];

export default function ReelsPage() {
  const { profile, addUserPost, followUser, unfollowUser } = useProfile();
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [likesMap, setLikesMap] = useState({});
  const [savedMap, setSavedMap] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [auditTargetPost, setAuditTargetPost] = useState(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const activeReel = REELS_DATA[currentReelIndex];

  const handleToggleLike = (id) => {
    setLikesMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const isLiked = likesMap[activeReel.id] || false;
  const isBookmarked = savedMap[activeReel.id] || false;
  const likeCount = isLiked ? activeReel.likes + 1 : activeReel.likes;

  return (
    <div className="trustgram-layout reels-layout-view">
      <SidebarNav onCreateClick={() => setIsCreateOpen(true)} />

      <main className="trustgram-feed-container reels-container">
        <div className="reel-viewer-card">
          {/* Media Background */}
          <div className="reel-media-wrap">
            <img src={activeReel.videoPoster} alt="Reel video" className="reel-video-image" />
            
            {/* Audio Toggle Button */}
            <button className="btn-reel-mute" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Authenticity Floating Pill */}
            <div
              className={`reel-trust-badge ${activeReel.verdict === 'Authentic' ? 'ribbon-auth' : 'ribbon-susp'}`}
              onClick={() => setAuditTargetPost(activeReel)}
            >
              <ShieldCheck size={16} />
              <span>{Math.round(activeReel.confidence_score * 100)}% {activeReel.verdict} Video</span>
              <span className="ribbon-audit-hint">Audit ➔</span>
            </div>

            {/* Caption & Author Overlay */}
            <div className="reel-info-overlay">
              <div className="reel-author-row">
                <img src={activeReel.author.avatar} alt="avatar" className="reel-avatar" />
                <span className="reel-username">@{activeReel.author.username}</span>
                {activeReel.author.verified && <ShieldCheck size={14} className="text-green" />}
                <button
                  className="btn-follow-reel"
                  onClick={() => followUser(activeReel.author)}
                >
                  Follow
                </button>
              </div>

              <p className="reel-caption">{activeReel.caption}</p>

              <div className="reel-audio-tag">
                <Music size={14} />
                <span className="audio-scroller-text">{activeReel.audio}</span>
              </div>
            </div>
          </div>

          {/* Right Floating Actions */}
          <div className="reel-actions-column">
            <button
              className={`btn-reel-action ${isLiked ? 'action-liked' : ''}`}
              onClick={() => handleToggleLike(activeReel.id)}
            >
              <Heart size={26} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : 'currentColor'} />
              <span>{likeCount.toLocaleString()}</span>
            </button>

            <button className="btn-reel-action">
              <MessageCircle size={26} />
              <span>{activeReel.commentsCount}</span>
            </button>

            <button className="btn-reel-action" onClick={handleShare}>
              {copiedShare ? <Check size={24} className="text-green" /> : <Send size={26} />}
              <span>Share</span>
            </button>

            <button
              className={`btn-reel-action ${isBookmarked ? 'action-bookmarked' : ''}`}
              onClick={() => setSavedMap(prev => ({ ...prev, [activeReel.id]: !prev[activeReel.id] }))}
            >
              <Bookmark size={26} fill={isBookmarked ? 'currentColor' : 'none'} />
              <span>Save</span>
            </button>

            <button className="btn-reel-action" onClick={() => setAuditTargetPost(activeReel)}>
              <ShieldCheck size={26} className="text-indigo" />
              <span>Audit</span>
            </button>

            <div className="spinning-vinyl-record">
              <img src={activeReel.author.avatar} alt="vinyl" />
            </div>
          </div>
        </div>

        {/* Next / Previous Reels Controls */}
        <div className="reels-nav-controls">
          <button
            className="btn-reel-prev"
            disabled={currentReelIndex === 0}
            onClick={() => setCurrentReelIndex(prev => prev - 1)}
          >
            ▲ Previous Reel
          </button>
          <button
            className="btn-reel-next"
            disabled={currentReelIndex === REELS_DATA.length - 1}
            onClick={() => setCurrentReelIndex(prev => prev + 1)}
          >
            ▼ Next Reel
          </button>
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
