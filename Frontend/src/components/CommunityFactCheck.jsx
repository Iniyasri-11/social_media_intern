import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, AlertCircle, HelpCircle } from 'lucide-react';

export default function CommunityFactCheck({ postId, onVoteSubmit }) {
  const [selectedVote, setSelectedVote] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votes, setVotes] = useState({
    true: 24,
    false: 8,
    misleading: 5,
    cannot_verify: 3,
  });

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  const voteOptions = [
    {
      id: 'true',
      label: 'Looks True',
      icon: ThumbsUp,
      color: 'bg-green-100 text-green-700 hover:bg-green-200',
      description: 'This appears to be authentic',
    },
    {
      id: 'false',
      label: 'Looks False',
      icon: ThumbsDown,
      color: 'bg-red-100 text-red-700 hover:bg-red-200',
      description: 'This appears to be false',
    },
    {
      id: 'misleading',
      label: 'Misleading',
      icon: AlertCircle,
      color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
      description: 'True but presented misleadingly',
    },
    {
      id: 'cannot_verify',
      label: 'Cannot Verify',
      icon: HelpCircle,
      color: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      description: 'Insufficient information',
    },
  ];

  const handleVote = async (voteType) => {
    setSelectedVote(voteType);
    setHasVoted(true);

    // Update vote count
    setVotes({
      ...votes,
      [voteType]: votes[voteType] + 1,
    });

    // Call API or parent callback
    if (onVoteSubmit) {
      onVoteSubmit(postId, voteType);
    }

    // Reset after 3 seconds
    setTimeout(() => setSelectedVote(null), 3000);
  };

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-blue-600" />
        <h4 className="font-semibold text-blue-900">Verify This Post</h4>
      </div>

      {!hasVoted ? (
        <div>
          <p className="text-sm text-blue-800 mb-4">
            Help the community by voting on the authenticity of this post.
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {voteOptions.map((option) => {
              const Icon = option.icon;
              const percentage =
                totalVotes > 0 ? Math.round((votes[option.id] / totalVotes) * 100) : 0;

              return (
                <button
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  className={`p-3 rounded-lg transition ${option.color}`}
                  title={option.description}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1" />
                  <p className="text-xs font-semibold">{option.label}</p>
                  <p className="text-xs opacity-75">{votes[option.id]}</p>
                </button>
              );
            })}
          </div>

          {/* Vote Distribution Bar */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-24 text-right font-semibold text-green-700">
                Looks True
              </span>
              <div className="flex-grow bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-full"
                  style={{
                    width: `${totalVotes > 0 ? (votes.true / totalVotes) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="w-12 text-left">
                {totalVotes > 0 ? Math.round((votes.true / totalVotes) * 100) : 0}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-24 text-right font-semibold text-red-700">
                Looks False
              </span>
              <div className="flex-grow bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-500 h-full"
                  style={{
                    width: `${totalVotes > 0 ? (votes.false / totalVotes) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="w-12 text-left">
                {totalVotes > 0 ? Math.round((votes.false / totalVotes) * 100) : 0}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-24 text-right font-semibold text-yellow-700">
                Misleading
              </span>
              <div className="flex-grow bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-yellow-500 h-full"
                  style={{
                    width: `${totalVotes > 0 ? (votes.misleading / totalVotes) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="w-12 text-left">
                {totalVotes > 0 ? Math.round((votes.misleading / totalVotes) * 100) : 0}%
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-3">
            <strong>{totalVotes}</strong> people have voted
          </p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-800 font-semibold">✓ Thank you for voting!</p>
          <p className="text-sm text-green-700 mt-1">
            Your vote has been recorded and helps improve community trust.
          </p>
        </div>
      )}
    </div>
  );
}
