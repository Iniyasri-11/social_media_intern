import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { ShieldCheck, Sun, Moon, ArrowLeft, Image as ImageIcon, Sparkles, Hash, Camera, Cpu, CheckCircle } from 'lucide-react';

function verdictClass(verdict) {
  if (!verdict) return 'default';
  const v = verdict.toLowerCase();
  if (v.includes('authentic') || v.includes('true') || v.includes('real')) return 'authentic';
  if (v.includes('fake') || v.includes('false') || v.includes('misinformation')) return 'fake';
  if (v.includes('suspicious')) return 'suspicious';
  return 'default';
}

function ScoreBar({ label, score, icon: Icon, colorClass = 'fill-blue' }) {
  const pct = score != null ? Math.round(score * 100) : null;
  return (
    <div className="score-row-card">
      <div className="score-label-wrap">
        {Icon && <Icon size={16} className="score-icon-tag" />}
        <span className="score-title">{label}</span>
        <span className="score-pct-badge">{pct != null ? `${pct}%` : '—'}</span>
      </div>
      <div className="score-bar-track">
        <div className={`score-bar-fill ${colorClass}`} style={{ width: pct != null ? `${pct}%` : '0%' }} />
      </div>
    </div>
  );
}

export default function PostCheckPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [postText, setPostText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!postText.trim() && !imageFile) return;

    setLoading(true);
    setResult(null);
    setError('');
    try {
      const form = new FormData();
      if (postText.trim()) form.append('post_text', postText.trim());
      if (imageFile) form.append('image', imageFile);

      const res = await fetch('/api/verify', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const cls = result ? verdictClass(result.verdict) : 'default';

  return (
    <div className="app-page">
      {/* ── Navigation Topbar ── */}
      <nav className="topbar">
        <div className="topbar-left">
          <button className="btn-back-feed" onClick={() => navigate('/')} title="Back to Social Feed">
            <ArrowLeft size={18} />
            <span>Feed</span>
          </button>
          <div className="topbar-brand" onClick={() => navigate('/')}>
            <div className="brand-shield-logo">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <span className="topbar-name">Trustgram Lab</span>
          </div>
        </div>

        <div className="topbar-right">
          <button className="btn-icon-round" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user && (
            <span className="topbar-user">
              👤 @{user.username || user.full_name || 'User'}
            </span>
          )}
          <button id="btn-topbar-logout" className="btn-logout" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="page-content">
        <div className="page-header">
          <h1>Neural Post Authenticity Lab</h1>
          <p>Inspect any text caption, news report, or image against our multi-model AI verification pipeline.</p>
        </div>

        <div className="lab-grid-layout">
          {/* Input Card */}
          <div className="card lab-input-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="post-text">Post Content / Headline</label>
                <textarea
                  id="post-text"
                  placeholder="Paste article headline, viral social post, or tweet text here…"
                  value={postText}
                  onChange={e => setPostText(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Media File (JPEG, JPG, PNG)</label>
                <div
                  className={`file-drop ${imageFile ? 'has-file' : ''}`}
                  onClick={() => !imageFile && fileRef.current?.click()}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                    id="image-upload"
                    style={{ display: imageFile ? 'none' : 'block' }}
                  />
                  {imageFile ? (
                    <div className="file-preview-inline">
                      {imagePreview && <img src={imagePreview} alt="Preview" className="inline-thumb" />}
                      <span className="file-name-text">📎 {imageFile.name}</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); clearImage(); }}
                        className="btn-clear-img"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <div className="drop-prompt">
                      <ImageIcon size={28} className="text-muted" />
                      <span>Click or drag an image here for EXIF & Deepfake inspection</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                id="btn-verify"
                type="submit"
                className="btn-verify btn-primary"
                disabled={loading || (!postText.trim() && !imageFile)}
              >
                {loading ? (
                  <span className="btn-loading-content">
                    <span className="spinner-small" /> Analyzing multi-model signals…
                  </span>
                ) : (
                  <>
                    <Sparkles size={18} /> Verify Authenticity Now
                  </>
                )}
              </button>
            </form>

            {error && !loading && (
              <div className="api-error" style={{ marginTop: '1rem' }}>
                ❌ {error}
              </div>
            )}
          </div>

          {/* Results Display */}
          <div className="card lab-result-card">
            {loading && (
              <div className="loading-wrap">
                <div className="spinner" />
                <h4>Running Trustgram Neural Scanner</h4>
                <p>Inspecting SHA-256 hash, EXIF camera signatures, and PyTorch deepfake transformers…</p>
              </div>
            )}

            {!loading && !result && (
              <div className="result-placeholder">
                <ShieldCheck size={56} className="placeholder-icon" />
                <h3>No Verification Run Yet</h3>
                <p>Submit text or upload an image on the left to view comprehensive credibility signals.</p>
              </div>
            )}

            {!loading && result && (
              <div className="result-active-panel">
                <div className={`verdict-badge verdict-${cls}`}>
                  {result.verdict}
                </div>
                <h3 className="result-headline">
                  Trust Score: {Math.round((result.confidence_score ?? 0.8) * 100)}%
                </h3>
                <p className="result-message">{result.message}</p>

                <div className="scores-grid-vertical">
                  <ScoreBar label="Overall Trust Score" score={result.confidence_score} icon={ShieldCheck} colorClass="fill-green" />
                  <ScoreBar label="NLP Text Credibility" score={result.text_score} icon={CheckCircle} colorClass="fill-indigo" />
                  {result.image_score != null && (
                    <ScoreBar label="Image Metadata & Optics" score={result.image_score} icon={Camera} colorClass="fill-blue" />
                  )}
                  {result.deepfake_analysis && (
                    <ScoreBar
                      label="Deepfake Safety Index"
                      score={result.deepfake_analysis.deepfake_score}
                      icon={Cpu}
                      colorClass="fill-yellow"
                    />
                  )}
                </div>

                {result.metadata_analysis && (
                  <div className="lab-meta-box">
                    <strong>Camera / Hardware Metadata:</strong>
                    <div className="meta-tags-list">
                      <span className="meta-pill">Format: {result.metadata_analysis.format}</span>
                      {result.metadata_analysis.camera_make && (
                        <span className="meta-pill">Make: {result.metadata_analysis.camera_make}</span>
                      )}
                      {result.metadata_analysis.software && (
                        <span className="meta-pill">Software: {result.metadata_analysis.software}</span>
                      )}
                    </div>
                  </div>
                )}

                {result.sha256_hash && (
                  <div className="hash-line">
                    <Hash size={14} /> SHA-256 Ledger: <code>{result.sha256_hash}</code>
                  </div>
                )}

                {result.warnings?.length > 0 && (
                  <div className="warnings">
                    <p>⚠️ Flagged Annotations:</p>
                    <ul>
                      {result.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
