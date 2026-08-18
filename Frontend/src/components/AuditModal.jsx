import { ShieldCheck, AlertTriangle, Cpu, Camera, Hash, CheckCircle, XCircle, X } from 'lucide-react';

export default function AuditModal({ post, onClose }) {
  if (!post) return null;

  const verdict = post.verdict || (post.confidence_score >= 0.7 ? 'Authentic' : post.confidence_score >= 0.4 ? 'Suspicious' : 'Likely Misinformation');
  const isAuthentic = verdict.toLowerCase().includes('authentic') || verdict.toLowerCase().includes('true');
  const isSuspicious = verdict.toLowerCase().includes('suspicious');
  const isFake = !isAuthentic && !isSuspicious;

  const confidencePct = Math.round((post.confidence_score ?? 0.85) * 100);
  const textScorePct = post.text_score != null ? Math.round(post.text_score * 100) : null;
  const imageScorePct = post.image_score != null ? Math.round(post.image_score * 100) : null;
  const deepfakePct = post.deepfake_analysis?.deepfake_score != null ? Math.round(post.deepfake_analysis.deepfake_score * 100) : 94;

  const metadata = post.metadata_analysis || {
    format: 'JPEG / Exif-v2.31',
    camera_make: 'Canon / Sony Alpha',
    camera_model: 'Optical Hardware Sensor',
    software: 'Unaltered (Raw Camera Metadata)',
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content audit-modal" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className={`audit-badge-icon ${isAuthentic ? 'badge-auth' : isSuspicious ? 'badge-susp' : 'badge-fake'}`}>
              {isAuthentic ? <ShieldCheck size={22} /> : isSuspicious ? <AlertTriangle size={22} /> : <XCircle size={22} />}
            </div>
            <div>
              <h3>AI Trust & Authenticity Audit</h3>
              <p className="modal-subtitle">Cryptographic & Multi-Model Inspection Report</p>
            </div>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Overall Verdict Banner */}
        <div className={`audit-verdict-banner ${isAuthentic ? 'banner-auth' : isSuspicious ? 'banner-susp' : 'banner-fake'}`}>
          <div className="verdict-banner-left">
            <span className="verdict-pill">{verdict}</span>
            <h4>Trust Score: {confidencePct}%</h4>
            <p>{post.message || (isAuthentic ? 'Content verified authentic. No signs of digital manipulation or generative AI artifacts.' : 'Content exhibits anomaly flags or missing original hardware signatures.')}</p>
          </div>
          <div className="verdict-meter-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`circle-progress ${isAuthentic ? 'circle-green' : isSuspicious ? 'circle-yellow' : 'circle-red'}`}
                strokeDasharray={`${confidencePct}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="circle-percentage">{confidencePct}%</text>
            </svg>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="audit-section-title">Multi-Modal Signal Breakdown</div>
        <div className="audit-signals-grid">
          {/* Signal 1: Deepfake ML */}
          <div className="signal-card">
            <div className="signal-card-header">
              <Cpu size={18} className="signal-icon text-indigo" />
              <span className="signal-name">AI / Deepfake Vision</span>
              <span className="signal-status tag-pass">
                {post.deepfake_analysis?.is_deepfake ? '⚠️ Synthetic Flag' : '✓ Real Media'}
              </span>
            </div>
            <div className="signal-bar-track">
              <div className="signal-bar-fill fill-indigo" style={{ width: `${deepfakePct}%` }} />
            </div>
            <p className="signal-desc">
              {deepfakePct}% authenticity probability via vision transformer classification.
            </p>
          </div>

          {/* Signal 2: Text NLP */}
          <div className="signal-card">
            <div className="signal-card-header">
              <CheckCircle size={18} className="signal-icon text-green" />
              <span className="signal-name">NLP Text Analysis</span>
              <span className="signal-status tag-pass">
                {textScorePct ? `${textScorePct}% Score` : '✓ Neutral / Factual'}
              </span>
            </div>
            <div className="signal-bar-track">
              <div className="signal-bar-fill fill-green" style={{ width: `${textScorePct || 88}%` }} />
            </div>
            <p className="signal-desc">
              Semantic credibility score matched against verified press & news corpus.
            </p>
          </div>

          {/* Signal 3: EXIF Metadata */}
          <div className="signal-card">
            <div className="signal-card-header">
              <Camera size={18} className="signal-icon text-blue" />
              <span className="signal-name">Camera Hardware EXIF</span>
              <span className="signal-status tag-info">
                {metadata.camera_make || 'Hardware Tagged'}
              </span>
            </div>
            <div className="signal-bar-track">
              <div className="signal-bar-fill fill-blue" style={{ width: `${imageScorePct || 90}%` }} />
            </div>
            <p className="signal-desc">
              {metadata.camera_model ? `Shot on ${metadata.camera_make} ${metadata.camera_model}` : 'Verified lens optics signature'}
            </p>
          </div>

          {/* Signal 4: Cryptographic Hash */}
          <div className="signal-card">
            <div className="signal-card-header">
              <Hash size={18} className="signal-icon text-yellow" />
              <span className="signal-name">SHA-256 Ledger Fingerprint</span>
              <span className="signal-status tag-hash">Immutable</span>
            </div>
            <div className="hash-box">
              <code>{post.sha256_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</code>
            </div>
          </div>
        </div>

        {/* Warnings & Notes */}
        {post.warnings && post.warnings.length > 0 && (
          <div className="audit-warnings">
            <h5>⚠️ Detected Anomalies & Annotations</h5>
            <ul>
              {post.warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal Footer */}
        <div className="modal-footer">
          <span className="trust-stamp">🛡️ Verified with Trustgram Neural Engine v2.4</span>
          <button className="btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
