import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { ProfileProvider } from './ProfileContext';
import LandingFeedPage from './pages/LandingFeedPage';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';
import ReelsPage from './pages/ReelsPage';
import PostCheckPage from './pages/PostCheckPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <BrowserRouter>
            <Routes>
              {/* Home Verified Feed */}
              <Route path="/" element={<LandingFeedPage />} />
              <Route path="/feed" element={<LandingFeedPage />} />

              {/* Explore Grid */}
              <Route path="/explore" element={<ExplorePage />} />

              {/* Reels Experience */}
              <Route path="/reels" element={<ReelsPage />} />

              {/* User Profile (Self and Other Users) */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/user/:username" element={<ProfilePage />} />
              <Route path="/u/:username" element={<ProfilePage />} />

              {/* AI Verification Scanner */}
              <Route path="/verify" element={<PostCheckPage />} />
              <Route path="/post" element={<PostCheckPage />} />

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
