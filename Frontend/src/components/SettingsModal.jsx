import React, { useState } from 'react';
import { X, LogOut, Lock, Bell, Eye } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: 'Alice Verified',
    bio: 'Data journalist and fact-checker',
    website: 'https://alice.example.com',
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    verificationAlerts: true,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {['profile', 'notifications', 'privacy', 'security'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                Save Changes
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {[
                { id: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                { id: 'pushNotifications', label: 'Push Notifications', desc: 'Desktop notifications' },
                {
                  id: 'verificationAlerts',
                  label: 'Verification Alerts',
                  desc: 'Notify when verification completes',
                },
              ].map((notif) => (
                <label
                  key={notif.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={settings[notif.id]}
                    onChange={(e) => setSettings({ ...settings, [notif.id]: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{notif.label}</p>
                    <p className="text-sm text-gray-600">{notif.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Privacy Note:</strong> Your profile and posts are visible to all users
                  by default. You can adjust your privacy settings here.
                </p>
              </div>

              {[
                { label: 'Profile Visibility', options: ['Public', 'Friends Only', 'Private'] },
                { label: 'Who Can Message', options: ['Everyone', 'Followers Only', 'No One'] },
              ].map((setting, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {setting.label}
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900">
                    {setting.options.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <button className="w-full flex items-center gap-2 p-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium">
                <Lock className="w-4 h-4" />
                Change Password
              </button>

              <button className="w-full flex items-center gap-2 p-3 border-2 border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-50 transition font-medium">
                <Eye className="w-4 h-4" />
                View Active Sessions
              </button>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-900 mb-3">
                  <strong>Danger Zone:</strong> Logging out will end your session on all devices.
                </p>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout All Devices
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
