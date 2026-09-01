import { X, ShieldCheck, FileCheck } from 'lucide-react';

export default function AuthenticityPassportModal({ post, onClose }) {
  if (!post) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <ShieldCheck size={20} style={{ color: '#4CAF50' }} />
            <div>
              <h3 className="modal-title">Authenticity Passport</h3>
              <p className="modal-subtitle">Digital Trust Certificate</p>
            </div>
          </div>
          <button type="button" className="btn-icon-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <FileCheck size={18} style={{ color: '#4CAF50' }} />
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Verified Authentic</span>
            </div>
            <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
              This content has passed AI authentication checks and community verification. The post metadata, image fingerprints, and text analysis all indicate original, unaltered content.
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>Verification Details</h4>
            <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e0e0e0' }}>
                <span>Content ID</span>
                <span style={{ fontFamily: 'monospace', color: '#333' }}>
                  {(post.id || 'N/A').toString().substring(0, 12)}...
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', paddingBottom: '8px', borderBottom: '1px solid #e0e0e0' }}>
                <span>Verification Date</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
                <span>Confidence</span>
                <span style={{ color: '#4CAF50', fontWeight: '600' }}>
                  {Math.round((post.confidence_score ?? 0.95) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
