import { useState } from 'react';
import { X, Copy, Check, Share2, Globe, Send, MessageCircle } from 'lucide-react';

export default function ShareModal({ title, url, thumbnail, onClose }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content share-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="brand-shield-logo" style={{ width: 34, height: 34 }}>
              <Share2 size={18} className="text-white" />
            </div>
            <div>
              <h3>Share Content</h3>
              <p className="modal-subtitle">Share this authentic post across platforms</p>
            </div>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body share-modal-body">
          {thumbnail && (
            <div className="share-preview-card">
              <img src={thumbnail} alt="preview" className="share-thumb-img" />
              <div className="share-preview-text">
                <strong>{title || 'Trustgram Verified Post'}</strong>
                <span>🛡️ AI Multi-Factor Cryptographically Verified</span>
              </div>
            </div>
          )}

          <div className="share-url-group">
            <label>Shareable Web Link</label>
            <div className="share-input-row">
              <div className="share-input-wrap">
                <Globe size={16} className="share-globe-icon" />
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="share-url-input"
                  onClick={(e) => e.target.select()}
                />
              </div>
              <button
                className={`btn-copy-url ${copied ? 'btn-copied' : ''}`}
                onClick={handleCopy}
              >
                {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
              </button>
            </div>
          </div>

          <div className="share-quick-options">
            <span>Or share directly to:</span>
            <div className="share-social-grid">
              <button
                className="social-share-btn"
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out this verified post on Trustgram 🛡️')}`)}
              >
                𝕏 Twitter / X
              </button>
              <button
                className="social-share-btn"
                onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`)}
              >
                💬 WhatsApp
              </button>
              <button
                className="social-share-btn"
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`)}
              >
                💼 LinkedIn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
