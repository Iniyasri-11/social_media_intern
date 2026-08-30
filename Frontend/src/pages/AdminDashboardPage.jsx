import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, AlertTriangle, Ban, TrendingUp } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    total_users: 2450,
    total_posts: 8923,
    verified_posts: 7234,
    flagged_posts: 456,
    open_reports: 23,
    suspended_users: 12,
    score_distribution: {
      '90-100': 4500,
      '70-89': 2200,
      '40-69': 1500,
      '0-39': 723,
    },
  });

  const [reports, setReports] = useState([
    {
      id: 1,
      reporter: 'user123',
      target: 'Misinformation about vaccines',
      reason: 'misinformation',
      status: 'open',
      created_at: '2024-08-22T10:30:00',
    },
    {
      id: 2,
      reporter: 'user456',
      target: 'Fake celebrity endorsement',
      reason: 'misinformation',
      status: 'investigating',
      created_at: '2024-08-22T09:15:00',
    },
  ]);

  const totalScore = Object.values(stats.score_distribution).reduce((a, b) => a + b, 0);

  const StatCard = ({ icon: Icon, label, value, subtext }) => (
    <div className="bg-white rounded-lg shadow p-6 flex items-start gap-4">
      <div className="p-3 bg-blue-100 rounded-lg">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div className="flex-grow">
        <p className="text-gray-600 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform analytics and moderation</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.total_users}
            subtext="Active platform members"
          />
          <StatCard
            icon={FileText}
            label="Total Posts"
            value={stats.total_posts}
            subtext="Verified and flagged"
          />
          <StatCard
            icon={TrendingUp}
            label="Verified Posts"
            value={stats.verified_posts}
            subtext={`${Math.round((stats.verified_posts / stats.total_posts) * 100)}% of total`}
          />
          <StatCard
            icon={AlertTriangle}
            label="Flagged Posts"
            value={stats.flagged_posts}
            subtext="Requiring review"
          />
          <StatCard
            icon={FileText}
            label="Open Reports"
            value={stats.open_reports}
            subtext="Awaiting moderation"
          />
          <StatCard
            icon={Ban}
            label="Suspended Users"
            value={stats.suspended_users}
            subtext="Account restrictions"
          />
        </div>

        {/* Score Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Authenticity Score Distribution</h2>
          </div>

          <div className="space-y-6">
            {Object.entries(stats.score_distribution).map(([range, count]) => {
              const percentage = (count / totalScore) * 100;
              const colors = {
                '90-100': 'bg-green-500',
                '70-89': 'bg-blue-500',
                '40-69': 'bg-yellow-500',
                '0-39': 'bg-red-500',
              };

              return (
                <div key={range}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-700">{range} (Highly Reliable)</span>
                    <span className="text-sm text-gray-600">
                      {count} posts ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${colors[range]} transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reports Queue */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Reports Review Queue</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Report ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Reporter
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">#{report.id}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{report.reporter}</td>
                    <td className="px-6 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {report.target}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {report.reason.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.status === 'open'
                            ? 'bg-red-100 text-red-800'
                            : report.status === 'investigating'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Review
                      </button>
                      <button className="text-red-600 hover:text-red-800 font-medium">
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 text-center">
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              View All Reports ({stats.open_reports})
            </button>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">User Management</h2>
          </div>

          <div className="p-6">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Search users by username..."
                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Search
              </button>
            </div>

            <div className="space-y-2">
              {['user123', 'user456', 'user789'].map((username) => (
                <div
                  key={username}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">@{username}</p>
                    <p className="text-sm text-gray-600">Member since 2024</p>
                  </div>
                  <button className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-medium">
                    Suspend
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent AI Verification Audit Log</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {[
              { time: '10:45', verdict: 'Reliable', score: 87, content: 'Post about climate research' },
              { time: '10:30', verdict: 'Misleading', score: 35, content: 'Fake celebrity news' },
              { time: '10:15', verdict: 'Mostly Reliable', score: 72, content: 'News article' },
            ].map((log, idx) => (
              <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{log.content}</p>
                  <p className="text-xs text-gray-600">At {log.time}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-medium ${
                      log.score >= 70 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {log.verdict}
                  </p>
                  <p className="text-xs text-gray-600">{log.score}%</p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 text-center">
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              View Full Audit Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
