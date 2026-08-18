import { useState, useRef } from 'react';
import { X, Upload, Check, Camera, Sparkles, User, Globe, FileText, Phone } from 'lucide-react';
import { useProfile } from '../ProfileContext';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
];

export default function EditProfileModal({ onClose }) {
  const { profile, updateProfile } = useProfile();

  const [name, setName] = useState(profile.name || '');
  const [username, setUsername] = useState(profile.username || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [website, setWebsite] = useState(profile.website || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [avatar, setAvatar] = useState(profile.avatar);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || profile.name,
      username: username.trim().toLowerCase() || profile.username,
      bio: bio.trim(),
      website: website.trim(),
      phone: phone.trim(),
      avatar,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content edit-profile-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="brand-shield-logo" style={{ width: 34, height: 34 }}>
              <User size={18} className="text-white" />
            </div>
            <div>
              <h3>Edit Profile</h3>
              <p className="modal-subtitle">Update your public Trustgram identity</p>
            </div>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body">
          {/* Avatar Change Section */}
          <div className="edit-avatar-section">
            <div className="avatar-preview-wrap">
              <img src={avatar} alt="Current avatar" className="edit-avatar-img" />
              <button
                type="button"
                className="btn-avatar-camera"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Photo"
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>

            <div className="avatar-action-details">
              <h4>Profile Picture</h4>
              <p>Upload a custom photo or pick a quick avatar preset</p>
              <div className="avatar-presets-tray">
                {PRESET_AVATARS.map((preset, idx) => (
                  <img
                    key={idx}
                    src={preset}
                    alt={`preset ${idx}`}
                    className={`preset-thumb ${avatar === preset ? 'preset-active' : ''}`}
                    onClick={() => setAvatar(preset)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-group">
            <label htmlFor="edit-name">Display Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="edit-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your Full Name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-username">Username</label>
            <div className="input-with-icon">
              <span className="input-icon-text">@</span>
              <input
                id="edit-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-bio">Bio (150 chars max)</label>
            <textarea
              id="edit-bio"
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell the community about your authentic content..."
              maxLength={150}
              className="compose-textarea"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-website">Website / Portfolio Link</label>
            <div className="input-with-icon">
              <Globe size={18} className="input-icon" />
              <input
                id="edit-website"
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-phone">Contact Phone</label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input
                id="edit-phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 0192"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="compose-footer" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {savedSuccess ? <><Check size={18} /> Saved!</> : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
