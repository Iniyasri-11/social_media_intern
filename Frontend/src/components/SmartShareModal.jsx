import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function SmartShareModal({ post, isOpen, onClose, onShareAnyway }) {
  if (!isOpen || !post) return null;

  const confidenceScore = post.confidence_score || 50;
  const shouldWarn = confidenceScore < 70;

  if (!shouldWarn) {
    // If score is good, allow direct sharing
    if (onShareAnyway) onShareAnyway();
    return null;
  }

  const getRiskReasons = () => {
    const reasons = [];
    if ((post.text_score || 50) < 60) {
      reasons.push('Unverified claims or untrustworthy language detected');
    }
    if ((post.image_score || 50) < 60) {
      reasons.push('Image may have been edited or manipulated');
    }
    if ((post.deepfake_score || 50) > 40) {
      reasons.push('Possible AI-generated or synthetic content');
    }
    if ((post.source_score || 50) < 60) {
      reasons.push('Source domain is not well-established');
    }
    if ((post.originality_score || 50) < 60) {
      reasons.push('Similar content found elsewhere (possible repost)');
    }
    return reasons.length > 0 ? reasons : ['Low authenticity score'];
  };

  const risks = getRiskReasons();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        {/* Header with warning icon */}
        <div className="bg-red-50 p-6 flex items-start gap-4 border-b border-red-200">
          <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold text-red-900">Share Warning</h2>
            <p className="text-red-700 text-sm mt-1">
              This post has a low authenticity score
            </p>
          </div>
          <button onClick={onClose} className="ml-auto p-1 hover:bg-red-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Score Display */}
          <div className="text-center mb-4">
            <div className="inline-block bg-red-100 text-red-800 rounded-full px-4 py-2 font-bold text-lg">
              {Math.round(confidenceScore)}% Reliable
            </div>
            <p className="text-sm text-gray-600 mt-2">Potentially Misleading</p>
          </div>

          {/* Risk Reasons */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Key Risk Factors:</h3>
            <ul className="space-y-2">
              {risks.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-red-600 font-bold mt-1">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            <p className="font-semibold mb-1">Before you share:</p>
            <p>
              Consider verifying this content with trusted sources or viewing the
              full Authenticity Passport for detailed analysis.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onShareAnyway}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium"
            >
              Share Anyway
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
