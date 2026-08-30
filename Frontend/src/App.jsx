import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { ProfileProvider } from './ProfileContext';
import LandingPage from './pages/LandingPage';
import LandingFeedPage from './pages/LandingFeedPage';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';
import ReelsPage from './pages/ReelsPage';
import PostCheckPage from './pages/PostCheckPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MessagesPage from './pages/MessagesPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <BrowserRouter>
            <Routes>
              {/* Landing Page */}
              <Route path="/welcome" element={<LandingPage />} />

              {/* Instagram-Style Home Feed */}
              <Route path="/" element={<LandingFeedPage />} />
              <Route path="/feed" element={<LandingFeedPage />} />

              {/* Instagram Explore Grid */}
              <Route path="/explore" element={<ExplorePage />} />

              {/* Instagram Reels Experience */}
              <Route path="/reels" element={<ReelsPage />} />

              {/* Instagram User Profile Management */}
              <Route path="/profile" element={<ProfilePage />} />

              {/* Neural Authenticity Verification Lab */}
              <Route path="/verify" element={<PostCheckPage />} />
              <Route path="/post" element={<PostCheckPage />} />

              {/* Direct Messaging */}
              <Route path="/messages" element={<MessagesPage />} />

              {/* Admin Dashboard */}
              <Route path="/admin" element={<AdminDashboardPage />} />

              {/* Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
