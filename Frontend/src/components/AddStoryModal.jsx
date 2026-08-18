import { useState, useRef } from 'react';
import { X, Upload, Camera, Sparkles, Image as ImageIcon, Check } from 'lucide-react';
import { useProfile } from '../ProfileContext';

const PRESET_STORIES = [
  {
    name: 'Sunset Horizon 🌅',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    caption: 'Golden hour waves on the Pacific coastline 🌊',
  },
  {
    name: 'Mountain Peak 🏔️',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    caption: 'Climbed above the clouds at 14,000ft today.',
  },
  {
    name: 'City Lights 🌃',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80',
    caption: 'Midnight neon reflections after the rain in downtown.',
  },
];

export default function AddStoryModal({ onClose }) {
  const { profile, addMyStory } = useProfile();
  const [media, setMedia] = useState(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!media) return;
    addMyStory({
      media,
      caption: caption.trim() || 'Verified story moment 🛡️',
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content add-story-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="brand-shield-logo" style={{ width: 34, height: 34 }}>
              <Camera size={18} className="text-white" />
            </div>
            <div>
              <h3>Add to Your Story</h3>
              <p className="modal-subtitle">Share an authentic moment with @{profile.username}</p>
            </div>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Media preview / dropzone */}
          {media ? (
            <div className="story-upload-preview">
              <img src={media} alt="Story preview" className="story-upload-img" />
              <button
                type="button"
                className="btn-remove-preview"
                onClick={() => setMedia(null)}
              >
                <X size={16} /> Remove
              </button>
            </div>
          ) : (
            <div
              className="upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={32} className="text-indigo" />
              <p className="dropzone-main-text">Upload a photo for your story</p>
              <span className="dropzone-sub-text">Tap to browse files</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
          )}

          {/* Quick presets */}
          {!media && (
            <div className="presets-tray">
              <span className="presets-label">✨ Or select a sample story photo:</span>
              <div className="preset-buttons-row">
                {PRESET_STORIES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn-preset-chip"
                    onClick={() => {
                      setMedia(preset.url);
                      setCaption(preset.caption);
                    }}
                  >
                    <ImageIcon size={14} /> {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Story Caption</label>
            <input
              type="text"
              placeholder="Add a caption to your story..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
              className="feed-search-input"
            />
          </div>

          <div className="compose-footer" style={{ marginTop: '1.25rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!media}
            >
              <Sparkles size={16} /> Share to Story
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
