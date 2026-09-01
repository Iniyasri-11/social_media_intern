import { X, Users, CheckCircle } from 'lucide-react';

export default function CommunityPersonsVerificationModal({ post, onClose }) {
  if (!post) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Users size={20} />
            <div>
              <h3 className="modal-title">Community Verification</h3>
              <p className="modal-subtitle">People Verification Report</p>
            </div>
          </div>
          <button type="button" className="btn-icon-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
            <Users size={40} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>People verification data not available for this post</p>
          </div>
        </div>
      </div>
    </div>
  );
}
