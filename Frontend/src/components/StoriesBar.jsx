import { useState } from 'react';
import { Plus, X, ShieldCheck, Heart, Trash2 } from 'lucide-react';
import { useProfile } from '../ProfileContext';
import AddStoryModal from './AddStoryModal';

const INITIAL_STORIES = [
  {
    id: 'story_1',
    user: 'elena_lens',
    name: 'Elena Vance',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    media: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=80',
    verified: true,
    caption: 'Backstage at the international photography showcase 📸',
    hasUnseen: true,
  },
  {
    id: 'story_2',
    user: 'reuters_wire',
    name: 'Reuters Press',
    avatar: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=150&auto=format&fit=crop&q=80',
    media: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80',
    verified: true,
    caption: 'Live updates from global climate summit in Geneva.',
    hasUnseen: true,
  },
  {
    id: 'story_3',
    user: 'cosmos_astro',
    name: 'Cosmic Observatories',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    media: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    verified: true,
    caption: 'Deep field Webb telescope snapshot of galaxy cluster SMACS 0723.',
    hasUnseen: true,
  },
  {
    id: 'story_4',
    user: 'alex_tech',
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    media: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    verified: true,
    caption: 'Testing quantum silicon chip benchmarks in our lab.',
    hasUnseen: false,
  },
  {
    id: 'story_5',
    user: 'maya_nature',
    name: 'Maya Chen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    media: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    verified: true,
    caption: 'Foggy morning in the Redwood forests 🌲',
    hasUnseen: true,
  },
];

export default function StoriesBar({ onAddStoryClick }) {
  const { profile, myStories, deleteMyStory } = useProfile();
  const [stories, setStories] = useState(INITIAL_STORIES);
  const [activeStory, setActiveStory] = useState(null);
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);

  const hasMyStories = myStories && myStories.length > 0;

  const handleOpenMyStory = () => {
    if (hasMyStories) {
      setActiveStory({
        id: myStories[0].id,
        user: profile.username,
        name: profile.name,
        avatar: profile.avatar,
        media: myStories[0].media,
        verified: profile.isVerified,
        caption: myStories[0].caption,
        isOwnStory: true,
      });
    } else {
      setIsAddStoryOpen(true);
    }
  };

  const handleOpenStory = (story) => {
    setActiveStory(story);
    setStories(prev => prev.map(s => s.id === story.id ? { ...s, hasUnseen: false } : s));
  };

  const handleDeleteActiveStory = (storyId) => {
    deleteMyStory(storyId);
    setActiveStory(null);
  };

  return (
    <>
      <div className="stories-tray">
        {/* Your Story Button with User's Real Avatar */}
        <div className="story-item" onClick={handleOpenMyStory}>
          <div className={`story-avatar-wrap story-add-wrap ${hasMyStories ? 'story-ring-gradient' : ''}`}>
            <img
              src={profile.avatar}
              alt="Your profile avatar"
              className="story-avatar"
            />
            <div
              className="story-plus-badge"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddStoryOpen(true);
              }}
              title="Add Story"
            >
              <Plus size={14} />
            </div>
          </div>
          <span className="story-username">Your Story</span>
        </div>

        {/* Other Creators' Stories */}
        {stories.map(story => (
          <div
            key={story.id}
            className={`story-item ${story.hasUnseen ? 'story-unseen' : 'story-seen'}`}
            onClick={() => handleOpenStory(story)}
          >
            <div className="story-ring-gradient">
              <img src={story.avatar} alt={story.name} className="story-avatar" />
            </div>
            <span className="story-username">{story.user}</span>
          </div>
        ))}
      </div>

      {/* Add Story Modal */}
      {isAddStoryOpen && (
        <AddStoryModal onClose={() => setIsAddStoryOpen(false)} />
      )}

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="story-modal-backdrop" onClick={() => setActiveStory(null)}>
          <div className="story-modal-viewer" onClick={e => e.stopPropagation()}>
            <div className="story-progress-bar-track">
              <div className="story-progress-bar-fill" />
            </div>

            <div className="story-viewer-header">
              <div className="story-viewer-author">
                <img src={activeStory.avatar} alt={activeStory.name} className="story-header-avatar" />
                <span className="story-header-name">{activeStory.name}</span>
                {activeStory.verified && (
                  <span className="story-verified-tag" title="Verified Creator">
                    <ShieldCheck size={14} />
                  </span>
                )}
                <span className="story-header-time">2h ago</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeStory.isOwnStory && (
                  <button
                    className="btn-story-delete"
                    onClick={() => handleDeleteActiveStory(activeStory.id)}
                    title="Delete Story"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button className="btn-story-close" onClick={() => setActiveStory(null)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="story-media-box">
              <img src={activeStory.media} alt={activeStory.caption} className="story-main-media" />
              <div className="story-caption-overlay">
                <p>{activeStory.caption}</p>
              </div>
            </div>

            <div className="story-viewer-footer">
              <input
                type="text"
                placeholder={activeStory.isOwnStory ? "Your verified story" : `Reply to ${activeStory.user}...`}
                className="story-reply-input"
                readOnly={activeStory.isOwnStory}
              />
              <button className="btn-story-like">
                <Heart size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
