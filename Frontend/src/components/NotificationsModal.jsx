import { X, Bell } from 'lucide-react';

export default function NotificationsModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <Bell size={20} style={{ marginRight: '8px' }} />
            Notifications
          </h3>
          <button type="button" className="btn-icon-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
            No new notifications
          </p>
        </div>
      </div>
    </div>
  );
}
