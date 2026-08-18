import { useState } from 'react';
import { X, Check, Sparkles, Film, Image as ImageIcon, Plus, CheckCircle, Video } from 'lucide-react';
import { useProfile } from '../ProfileContext';

export default function CreateHighlightModal({ onClose }) {
  const { profile, myStories, userPosts, addHighlight } = useProfile();

  const [title, setTitle] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [coverUrl, setCoverUrl] = useState('');

  // Collect candidate items from active/archived stories and user posts/reels
  const sampleReels = [
    {
      id: 'candidate_reel_1',
      type: 'reel',
      media: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      caption: 'Majestic waterfall cascade in Iceland 🌊',
      time: '1 week ago',
      verdict: 'Authentic 99%',
    },
    {
      id: 'candidate_reel_2',
      type: 'reel',
      media: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
      caption: 'Unreal quantum cityscape rendering ⚡',
      time: '2 weeks ago',
      verdict: 'Synthesized',
    },
  ];

  const storyItems = (myStories || []).map(s => ({
    id: s.id,
    type: s.type || 'story',
    media: s.media,
    caption: s.caption,
    time: s.time || 'Recent',
    verdict: s.verdict || 'Authentic',
  }));

  const postItems = (userPosts || []).map(p => ({
    id: p.id,
    type: 'photo',
    media: p.image,
    caption: p.caption,
    time: p.createdAt || 'Recent',
    verdict: p.verdict || 'Authentic',
  }));

  const allAvailableItems = [...storyItems, ...sampleReels, ...postItems];

  const handleToggleItem = (item) => {
    const isSelected = selectedItems.some(i => i.id === item.id);
    if (isSelected) {
      const updated = selectedItems.filter(i => i.id !== item.id);
      setSelectedItems(updated);
      if (coverUrl === item.media && updated.length > 0) {
        setCoverUrl(updated[0].media);
      }
    } else {
      const updated = [...selectedItems, item];
      setSelectedItems(updated);
      if (!coverUrl) {
        setCoverUrl(item.media);
      }
    }
  };

  const handleSaveHighlight = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalItems = selectedItems.length > 0
      ? selectedItems
      : [
          {
            id: 'hl_def_' + Date.now(),
            type: 'story',
            media: coverUrl || profile.avatar,
            caption: title.trim(),
            time: 'Just now',
            verdict: 'Authentic 99%',
          },
        ];

    const finalCover = coverUrl || finalItems[0]?.media || profile.avatar;

    addHighlight({
      id: 'hl_' + Date.now(),
      title: title.trim(),
      cover: finalCover,
      items: finalItems,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content create-highlight-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="brand-shield-logo" style={{ width: 34, height: 34 }}>
              <Film size={18} className="text-white" />
            </div>
            <div>
              <h3>New Story Highlight</h3>
              <p className="modal-subtitle">Add stories, videos, and reels to your profile highlights</p>
            </div>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSaveHighlight} className="modal-body">
          {/* Highlight Title */}
          <div className="form-group">
            <label htmlFor="hl-title">Highlight Name</label>
            <input
              id="hl-title"
              type="text"
              placeholder="e.g. Travel ✈️, Reels & Videos 🎥, Studio 📸"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="feed-search-input"
            />
          </div>

          {/* Select Stories / Videos / Reels from User Archive */}
          <div className="highlight-picker-section">
            <div className="highlight-picker-header">
              <label>Select Stories, Reels & Media ({selectedItems.length} selected)</label>
              <span className="picker-hint">Tap items to add to this highlight</span>
            </div>

            {allAvailableItems.length > 0 ? (
              <div className="highlight-items-grid">
                {allAvailableItems.map(item => {
                  const isChecked = selectedItems.some(i => i.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className={`highlight-picker-item ${isChecked ? 'item-selected' : ''}`}
                      onClick={() => handleToggleItem(item)}
                    >
                      <img src={item.media} alt={item.caption} className="picker-item-thumb" />
                      
                      <div className="picker-item-type-badge">
                        {item.type === 'reel' ? (
                          <><Film size={12} /> Reel</>
                        ) : item.type === 'story' ? (
                          <><Sparkles size={12} /> Story</>
                        ) : (
                          <><ImageIcon size={12} /> Post</>
                        )}
                      </div>

                      {isChecked && (
                        <div className="picker-item-check-badge">
                          <Check size={14} className="text-white" />
                        </div>
                      )}

                      <div className="picker-item-overlay">
                        <span className="picker-item-caption">{item.caption}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-picker-notice">
                <Film size={32} className="text-muted" />
                <p>No archived stories yet. You can still create this highlight and add photos or stories later!</p>
              </div>
            )}
          </div>

          {/* Cover photo preview */}
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Cover Photo URL (optional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={coverUrl}
              onChange={e => setCoverUrl(e.target.value)}
              className="feed-search-input"
            />
          </div>

          <div className="compose-footer" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!title.trim()}>
              <Plus size={16} /> Create Highlight
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
