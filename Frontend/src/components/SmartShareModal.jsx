import { X, Share2, Copy, MessageCircle, Mail } from 'lucide-react';
import { useState } from 'react';

export default function SmartShareModal({ post, onClose }) {
  if (!post) return null;

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/post/${post.id || 'demo'}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <Share2 size={20} style={{ marginRight: '8px' }} />
            Share
          </h3>
          <button type="button" className="btn-icon-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <button
              onClick={handleCopyLink}
              style={{
                padding: '16px',
                textAlign: 'center',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Copy size={24} style={{ margin: '0 auto 8px', color: '#0066ff' }} />
              <div style={{ fontSize: '13px', fontWeight: '600' }}>
                {copied ? 'Copied!' : 'Copy Link'}
              </div>
            </button>

            <a
              href={`mailto:?subject=${post.caption || 'Check this out'}&body=Check this post: ${window.location.href}`}
              style={{
                padding: '16px',
                textAlign: 'center',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
            >
              <Mail size={24} style={{ margin: '0 auto 8px', color: '#EA4335' }} />
              <div style={{ fontSize: '13px', fontWeight: '600' }}>Email</div>
            </a>

            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.caption || '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '16px',
                textAlign: 'center',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
            >
              <div style={{ fontSize: '24px', margin: '0 auto 8px' }}>𝕏</div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>Tweet</div>
            </a>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '16px',
                textAlign: 'center',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
            >
              <div style={{ fontSize: '24px', margin: '0 auto 8px' }}>f</div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>Facebook</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
