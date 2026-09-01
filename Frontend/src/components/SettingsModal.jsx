import { X, Settings } from 'lucide-react';

export default function SettingsModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <Settings size={20} style={{ marginRight: '8px' }} />
            Settings
          </h3>
          <button type="button" className="btn-icon-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div style={{ padding: '20px' }}>
            <h4 style={{ marginBottom: '16px' }}>Privacy & Safety</h4>
            <label style={{ display: 'block', marginBottom: '12px' }}>
              <input type="checkbox" defaultChecked /> Private Account
            </label>
            <label style={{ display: 'block', marginBottom: '12px' }}>
              <input type="checkbox" defaultChecked /> Allow Messages from Verified Users Only
            </label>
            
            <h4 style={{ marginTop: '24px', marginBottom: '16px' }}>Notifications</h4>
            <label style={{ display: 'block', marginBottom: '12px' }}>
              <input type="checkbox" defaultChecked /> Email Notifications
            </label>
            <label style={{ display: 'block', marginBottom: '12px' }}>
              <input type="checkbox" defaultChecked /> Push Notifications
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
