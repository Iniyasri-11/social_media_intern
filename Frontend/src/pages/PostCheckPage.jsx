import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

function verdictClass(verdict) {
  if (!verdict) return 'default'
  const v = verdict.toLowerCase()
  if (v.includes('authentic') || v.includes('true') || v.includes('real')) return 'authentic'
  if (v.includes('fake') || v.includes('false') || v.includes('misinformation')) return 'fake'
  if (v.includes('suspicious')) return 'suspicious'
  return 'default'
}

function ScoreBar({ label, score }) {
  const pct = score != null ? Math.round(score * 100) : null
  return (
    <div className="score-row">
      <label>
        {label}
        <span>{pct != null ? `${pct}%` : '—'}</span>
      </label>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: pct != null ? `${pct}%` : '0%' }} />
      </div>
    </div>
  )
}

export default function PostCheckPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [postText,  setPostText]  = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState(null)
  const [error,     setError]     = useState('')
  const fileRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!postText.trim() && !imageFile) return

    setLoading(true)
    setResult(null)
    setError('')
    try {
      const form = new FormData()
      if (postText.trim()) form.append('post_text', postText.trim())
      if (imageFile)       form.append('image', imageFile)

      const res  = await fetch('/api/verify', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleFileChange(e) { setImageFile(e.target.files[0] || null) }

  function clearImage() {
    setImageFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const cls = result ? verdictClass(result.verdict) : 'default'

  return (
    <div className="app-page">

      {/* ── Navigation ── */}
      <nav className="topbar">
        <div className="topbar-brand">
          <div className="topbar-icon">🛡️</div>
          <span className="topbar-name">PostAuthenti</span>
        </div>
        <div className="topbar-right">
          {user && (
            <span className="topbar-user">
              👤 {user.username || user.full_name || 'User'}
            </span>
          )}
          <button id="btn-topbar-logout" className="btn-logout" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="page-content">
        <div className="page-header">
          <h1>Post Authenticity Checker</h1>
          <p>Paste a social-media post and let the AI model analyse it.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="post-text">Post text</label>
              <textarea
                id="post-text"
                placeholder="Paste the post content here…"
                value={postText}
                onChange={e => setPostText(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Image (optional — JPEG / PNG)</label>
              <div className={`file-drop${imageFile ? ' has-file' : ''}`}>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileChange}
                  id="image-upload"
                />
                {imageFile ? `📎 ${imageFile.name}` : '📁 Click or drag an image here'}
              </div>
              {imageFile && (
                <div className="file-name">
                  {imageFile.name}{' '}
                  <button
                    type="button"
                    onClick={clearImage}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '.8rem' }}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>

            <button
              id="btn-verify"
              type="submit"
              className="btn-verify"
              disabled={loading || (!postText.trim() && !imageFile)}
            >
              {loading ? 'Analysing…' : 'Verify Post'}
            </button>
          </form>

          {loading && (
            <div className="loading-wrap">
              <div className="spinner" />
              Running AI model — this may take a few seconds…
            </div>
          )}

          {error && !loading && (
            <div className="api-error">❌ {error}</div>
          )}

          {result && !loading && (
            <div className="result">
              <div className={`verdict-badge verdict-${cls}`}>
                {result.verdict}
              </div>
              <p className="result-message">{result.message}</p>

              <div className="scores-grid">
                <ScoreBar label="Overall confidence" score={result.confidence_score} />
                <ScoreBar label="Text authenticity"  score={result.text_score} />
                {result.image_score != null && (
                  <ScoreBar label="Image authenticity" score={result.image_score} />
                )}
              </div>

              {result.warnings?.length > 0 && (
                <div className="warnings">
                  <p>Warnings</p>
                  <ul>
                    {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}

              {result.sha256_hash && (
                <p className="hash-line">SHA-256: <span>{result.sha256_hash}</span></p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
