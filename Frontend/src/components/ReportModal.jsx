import { X, Flag, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function ReportModal({ post, onClose }) {
  if (!post) return null;

  const [selectedReason, setSelectedReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reportReasons = [
    { id: 'fake', label: 'Misinformation / Deepfake' },
    { id: 'harassment', label: 'Harassment or Abuse' },
    { id: 'hate', label: 'Hate Speech' },
    { id: 'spam', label: 'Spam' },
    { id: 'copyright', label: 'Copyright Infringement' },
    { id: 'other', label: 'Other' },
  ];

  const handleSubmit = () => {
    if (selectedReason) {
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  if (submitted) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: 'center', padding: '60px 40px' }}>
            <AlertTriangle size={48} style={{ margin: '0 auto 16px', color: '#FF9800' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Report Submitted</h3>
            <p style={{ fontSize: '13px', color: '#666' }}>
              Thank you. Our team will review this content.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <Flag size={20} style={{ marginRight: '8px' }} />
            Report Post
          </h3>
          <button type="button" className="btn-icon-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
              Reason for Report
            </label>
            {reportReasons.map(reason => (
              <label
                key={reason.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px',
                  marginBottom: '8px',
                  border: selectedReason === reason.id ? '1px solid #0066ff' : '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: selectedReason === reason.id ? '#f0f5ff' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason.id}
                  checked={selectedReason === reason.id}
                  onChange={e => setSelectedReason(e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                <span style={{ fontSize: '13px' }}>{reason.label}</span>
              </label>
            ))}
          </div>

          {selectedReason && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                Additional Details (Optional)
              </label>
              <textarea
                value={additionalInfo}
                onChange={e => setAdditionalInfo(e.target.value)}
                placeholder="Tell us more..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '8px',
                  fontSize: '13px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedReason}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: selectedReason ? '#0066ff' : '#ccc',
                color: 'white',
                cursor: selectedReason ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              Submit Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
