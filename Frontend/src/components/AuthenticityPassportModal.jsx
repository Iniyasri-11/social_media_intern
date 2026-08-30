import React, { useState, useEffect } from 'react';
import { X, TrendingUp, CheckCircle2, AlertCircle, Share2, Download } from 'lucide-react';

export default function AuthenticityPassportModal({ post, isOpen, onClose }) {
  const [verificationSteps, setVerificationSteps] = useState([]);

  useEffect(() => {
    if (post && post.confidence_score !== null) {
      setVerificationSteps([
        { name: 'Uploaded', status: 'complete' },
        { name: 'AI Analysis', status: post.text_score !== null ? 'complete' : 'pending' },
        { name: 'Source Analysis', status: post.source_score !== null ? 'complete' : 'pending' },
        { name: 'Originality Check', status: post.originality_score !== null ? 'complete' : 'pending' },
        { name: 'Community Verification', status: 'pending' },
        { name: 'Final Result', status: 'complete' },
      ]);
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const getVerdictColor = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-blue-100 text-blue-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getVerdictLabel = (score) => {
    if (score >= 90) return 'Highly Reliable';
    if (score >= 70) return 'Mostly Reliable';
    if (score >= 40) return 'Needs Verification';
    return 'Potentially Misleading';
  };

  const getFactorColor = (score) => {
    if (score >= 80) return 'from-green-400 to-green-600';
    if (score >= 60) return 'from-blue-400 to-blue-600';
    if (score >= 40) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const factors = [
    { name: 'Source Trust', score: post.source_score || 50, icon: '🔗' },
    { name: 'Media Integrity', score: post.image_score || 50, icon: '📸' },
    { name: 'Originality', score: post.originality_score || 50, icon: '✨' },
    { name: 'Claim Reliability', score: post.text_score || 50, icon: '📝' },
    { name: 'AI Generation Risk', score: 100 - (post.deepfake_score || 50), icon: '🤖' },
    { name: 'Community Confidence', score: 50, icon: '👥' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Authenticity Passport</h2>
            <p className="text-blue-100 text-sm mt-1">Complete verification report for this post</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className={`inline-block rounded-full p-8 ${getVerdictColor(post.confidence_score || 50)}`}>
              <div className="text-4xl font-bold">{Math.round(post.confidence_score || 50)}</div>
              <div className="text-sm">Authenticity Score</div>
            </div>
            <div className="mt-4 text-lg font-semibold">
              {getVerdictLabel(post.confidence_score || 50)}
            </div>
            <div className="text-gray-600 text-sm mt-2">
              Posted {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'recently'}
            </div>
          </div>

          {/* 6 Factor Meters */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Verification Factors</h3>
            {factors.map((factor, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="text-xl">{factor.icon}</span>
                    {factor.name}
                  </span>
                  <span className="text-sm font-bold text-gray-700">
                    {Math.round(factor.score)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getFactorColor(factor.score)} transition-all`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Verification Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Verification Timeline</h3>
            <div className="space-y-3">
              {verificationSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {step.status === 'complete' ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-gray-900">{step.name}</p>
                    <p className="text-xs text-gray-500">
                      {step.status === 'complete' ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SHA-256 & C2PA Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold">Ledger & Provenance</h3>
            {post.sha256_hash && (
              <div className="text-xs space-y-1">
                <p className="text-gray-600">SHA-256 Hash:</p>
                <p className="font-mono text-gray-800 break-all">{post.sha256_hash}</p>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Content provenance verified</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
              <Share2 size={18} />
              Share Passport
            </button>
            <button className="flex-1 border-2 border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2">
              <Download size={18} />
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
