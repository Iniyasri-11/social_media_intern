import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { useProfile } from '../ProfileContext';
import {
  Home,
  Compass,
  Film,
  MessageCircle,
  Bell,
  PlusSquare,
  User,
  Layers,
  Sun,
  Moon,
  ShieldCheck,
  LogOut,
  Flame,
} from 'lucide-react';

export default function SidebarNav({ onCreateClick, onMessagesClick, onNotificationsClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <aside className="trustgram-sidebar">
      {/* Brand Logo */}
      <div className="sidebar-brand" onClick={() => navigate('/')}>
        <div className="brand-shield-logo">
          <ShieldCheck size={26} className="text-white" />
        </div>
        <span className="brand-title-text">Trustgram</span>
      </div>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        <button
          className={`nav-link-btn ${currentPath === '/' || currentPath === '/feed' ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          <Home size={22} />
          <span>Home</span>
        </button>

        <button
          className={`nav-link-btn ${currentPath === '/explore' ? 'active' : ''}`}
          onClick={() => navigate('/explore')}
        >
          <Compass size={22} />
          <span>Explore</span>
        </button>

        <button
          className={`nav-link-btn ${currentPath === '/reels' ? 'active' : ''}`}
          onClick={() => navigate('/reels')}
        >
          <Film size={22} />
          <span>Reels</span>
        </button>

        {onMessagesClick && (
          <button className="nav-link-btn" onClick={onMessagesClick}>
            <MessageCircle size={22} />
            <span>Messages</span>
          </button>
        )}

        {onNotificationsClick && (
          <button className="nav-link-btn" onClick={onNotificationsClick}>
            <Bell size={22} />
            <span>Notifications</span>
          </button>
        )}

        <button
          className="nav-link-btn btn-create-nav"
          onClick={onCreateClick || (() => navigate('/'))}
        >
          <PlusSquare size={22} />
          <span>Create Post</span>
        </button>

        <button
          className={`nav-link-btn ${currentPath === '/verify' || currentPath === '/post' ? 'active' : ''}`}
          onClick={() => navigate('/verify')}
        >
          <Layers size={22} />
          <span>Verification Lab</span>
        </button>

        <button
          className={`nav-link-btn ${currentPath === '/profile' ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
        >
          <div className="nav-profile-avatar-wrap">
            <img src={profile.avatar} alt="Profile" className="nav-profile-avatar-img" />
          </div>
          <span>Profile</span>
        </button>

        <button
          className="nav-link-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={22} className="text-yellow" /> : <Moon size={22} className="text-indigo" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </nav>

      {/* Sidebar Footer User Card */}
      <div className="sidebar-footer">
        {user ? (
          <div className="sidebar-user-card" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
            <div className="user-avatar-pill">
              <img src={profile.avatar} alt="avatar" className="sidebar-avatar-img" />
            </div>
            <div className="sidebar-user-details">
              <span className="user-display-name">{profile.name}</span>
              <span className="user-trust-tag">@{profile.username} • 🛡️ Verified</span>
            </div>
            <button
              className="btn-sidebar-logout"
              onClick={(e) => {
                e.stopPropagation();
                logout();
                navigate('/login');
              }}
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="sidebar-auth-prompt">
            <button className="btn-primary w-full" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
