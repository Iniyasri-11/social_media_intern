import { useState, useEffect } from 'react';
import { X, ShieldCheck, Heart, Trash2, ChevronLeft, ChevronRight, Play, Pause, Film, Sparkles } from 'lucide-react';
import { useProfile } from '../ProfileContext';

export default function HighlightViewerModal({ highlight, onClose, onDeleteHighlight }) {
  const { profile } = useProfile();
  const items = highlight?.items && highlight.items.length > 0
    ? highlight.items
    : [
        {
          id: 'def_item',
          type: 'photo',
          media: highlight?.cover || profile.avatar,
          caption: highlight?.title || 'Story Highlight',
          time: 'Highlight',
          verdict: 'Authentic 99%',
        },
      ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [liked, setLiked] = useState(false);

  const currentItem = items[currentIndex] || items[0];

  // Auto progression timer (5 seconds per slide if not paused)
  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      if (currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // finished all items in this highlight
        onClose();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, isPaused, items.length, onClose]);

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete the "${highlight.title}" highlight from your profile?`)) {
      if (onDeleteHighlight) onDeleteHighlight(highlight.id);
      onClose();
    }
  };

  return (
    <div className="story-modal-backdrop highlight-viewer-backdrop" onClick={onClose}>
      <div
        className="story-modal-viewer highlight-viewer-card"
        onClick={e => e.stopPropagation()}
      >
        {/* Segmented Progress Bars */}
        <div className="highlight-segments-bar">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="highlight-segment-track">
              <div
                className={`highlight-segment-fill ${
                  idx < currentIndex
                    ? 'segment-completed'
                    : idx === currentIndex && !isPaused
                    ? 'segment-active-anim'
                    : idx === currentIndex && isPaused
                    ? 'segment-paused'
                    : ''
                }`}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="story-viewer-header">
          <div className="story-viewer-author">
            <img src={profile.avatar} alt={profile.name} className="story-header-avatar" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="story-header-name">{profile.name}</span>
                {profile.isVerified && (
                  <span className="story-verified-tag" title="Verified Member">
                    <ShieldCheck size={14} />
                  </span>
                )}
              </div>
              <span className="highlight-sub-title">{highlight.title} • {currentItem.time || 'Story'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn-story-control"
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? 'Play' : 'Pause'}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>

            <button
              className="btn-story-delete"
              onClick={handleDelete}
              title="Delete this Highlight"
            >
              <Trash2 size={16} />
            </button>

            <button className="btn-story-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Media Container with Left/Right Click Nav */}
        <div className="story-media-box">
          <img src={currentItem.media} alt={currentItem.caption} className="story-main-media" />

          {/* Navigation Click Overlay Zones */}
          <div className="story-nav-zone zone-left" onClick={handlePrev}>
            <ChevronLeft size={28} className="zone-arrow" />
          </div>
          <div className="story-nav-zone zone-right" onClick={handleNext}>
            <ChevronRight size={28} className="zone-arrow" />
          </div>

          {/* Floating Authenticity Badge */}
          {currentItem.verdict && (
            <div className="highlight-trust-ribbon">
              <ShieldCheck size={14} />
              <span>{currentItem.verdict}</span>
            </div>
          )}

          {/* Caption Overlay */}
          <div className="story-caption-overlay">
            <p>{currentItem.caption || highlight.title}</p>
          </div>
        </div>

        {/* Viewer Footer */}
        <div className="story-viewer-footer">
          <div className="highlight-item-counter">
            {currentIndex + 1} of {items.length} moments in {highlight.title}
          </div>
          <button
            className={`btn-story-like ${liked ? 'liked' : ''}`}
            onClick={() => setLiked(!liked)}
          >
            <Heart size={20} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : 'currentColor'} />
          </button>
        </div>
      </div>
    </div>
  );
}
