import React, { useState } from 'react';
import { X, Flag } from 'lucide-react';

export default function ReportModal({ targetType, targetId, isOpen, onClose, onSubmit }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    {
      id: 'misinformation',
      label: 'Misinformation',
      description: 'Contains false or misleading information',
    },
    {
      id: 'manipulated_media',
      label: 'Manipulated Media',
      description: 'Image/video has been altered or deepfaked',
    },
    {
      id: 'spam',
      label: 'Spam',
      description: 'Repetitive or promotional content',
    },
    {
      id: 'harassment',
      label: 'Harassment',
      description: 'Contains threatening or abusive language',
    },
    {
      id: 'fake_account',
      label: 'Fake Account',
      description: 'This account appears to be impersonating someone',
    },
    {
      id: 'other',
      label: 'Other',
      description: 'Something else not listed above',
    },
  ];

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedReason) {
      alert('Please select a reason for reporting');
      return;
    }

    setSubmitted(true);

    if (onSubmit) {
      onSubmit({
        targetType,
        targetId,
        reason: selectedReason,
        details,
      });
    }

    setTimeout(() => {
      setSelectedReason('');
      setDetails('');
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Flag className="w-5 h-5" />
            <h2 className="text-xl font-bold">Report Content</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-500 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!submitted ? (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Help us keep our community safe by reporting inappropriate content.
              </p>

              {/* Reason Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Why are you reporting this?
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {reasons.map((reason) => (
                    <label
                      key={reason.id}
                      className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition ${
                        selectedReason === reason.id
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={reason.id}
                        checked={selectedReason === reason.id}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="mt-1 w-4 h-4 text-red-600 cursor-pointer"
                      />
                      <div className="ml-3 flex-grow">
                        <p className="font-medium text-gray-900">{reason.label}</p>
                        <p className="text-xs text-gray-600">{reason.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide any additional context that would help us understand the issue..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  rows={3}
                />
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
                  onClick={handleSubmit}
                  disabled={!selectedReason}
                  className={`flex-1 text-white py-2 rounded-lg transition font-medium flex items-center justify-center gap-2 ${
                    selectedReason
                      ? 'bg-red-600 hover:bg-red-700 cursor-pointer'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  Submit Report
                </button>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Report Submitted
              </h3>
              <p className="text-gray-600 text-sm">
                Thank you for helping keep our community safe. We'll review this
                content and take appropriate action.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
