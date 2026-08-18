import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { ShieldCheck, Sun, Moon, ArrowRight, User, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in both username and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(username.trim(), password.trim());
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await login('demo', 'demo');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Theme Switcher Top Right */}
      <div className="auth-top-bar">
        <button className="btn-icon-round" onClick={toggleTheme} title="Toggle Dark/Light Mode">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <div className="brand-shield-logo">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <span className="auth-logo-text">Trustgram</span>
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-sub">Sign in to your authentic social network.</p>

        {error && <div className="api-error" style={{ marginBottom: '1.25rem' }}>❌ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-username">Username or Identifier</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="login-username"
                type="text"
                placeholder="e.g. demo or alex_lens"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary btn-auth-submit"
            disabled={loading}
          >
            {loading ? 'Signing in…' : (
              <>
                Sign In <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Quick Demo One-Click Login */}
          <div className="demo-login-divider">
            <span>or explore without password</span>
          </div>

          <button
            type="button"
            className="btn-secondary btn-demo-auth"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            <Sparkles size={16} className="text-indigo" /> ⚡ 1-Click Instant Demo Login
          </button>
        </form>

        <div className="auth-footer-prompt">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">
            Create an account
          </Link>
        </div>

        <div className="auth-verified-pill">
          <CheckCircle2 size={14} className="text-green" />
          <span>Protected by Multi-Modal AI Neural Shield</span>
        </div>
      </div>
    </div>
  );
}