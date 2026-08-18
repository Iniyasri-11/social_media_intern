import { useState } from 'react';
import { X, Search, ShieldCheck, UserCheck, UserPlus, Users, UserX, Clock, Check } from 'lucide-react';
import { useProfile } from '../ProfileContext';

const SUGGESTED_CREATORS_POOL = [
  {
    username: 'natgeo',
    name: 'National Geographic',
    avatar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80',
    bio: 'Inspiring people to care about the planet. Verified authentic EXIF.',
    verified: true,
  },
  {
    username: 'elena_lens',
    name: 'Elena Vance Lens',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Landscape & wildlife optics photographer. Zero composite art.',
    verified: true,
  },
  {
    username: 'reuters_world',
    name: 'Reuters World News',
    avatar: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=150&auto=format&fit=crop&q=80',
    bio: 'Fact-based global reporting from 2,500 journalists worldwide.',
    verified: true,
  },
  {
    username: 'james_wildlife',
    name: 'James Wilson',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Wildlife photography on Canon EOS R5 hardware.',
    verified: true,
  },
  {
    username: 'al_vision_lab',
    name: 'Dr. Alistair Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'AI Safety & Neural Authenticity Researcher.',
    verified: true,
  },
];

export default function FollowersModal({ initialTab = 'followers', onClose }) {
  const {
    profile,
    followUser,
    unfollowUser,
    removeFollower,
    removeFriend,
    getFollowStatus,
  } = useProfile();

  const [tab, setTab] = useState(initialTab); // 'followers' | 'following' | 'suggested'
  const [search, setSearch] = useState('');
  const [removedAlert, setRemovedAlert] = useState('');

  const listToDisplay = tab === 'following'
    ? (profile.followingList || [])
    : tab === 'followers'
    ? (profile.followersList || [])
    : SUGGESTED_CREATORS_POOL;

  const filteredList = listToDisplay.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.username.toLowerCase().includes(q);
  });

  const handleRemoveFollower = (username, name) => {
    removeFollower(username);
    setRemovedAlert(`Removed ${name || username} from followers & friends`);
    setTimeout(() => setRemovedAlert(''), 3000);
  };

  const handleToggleFollowing = (creator) => {
    const status = getFollowStatus(creator.username);
    if (status === 'none') {
      followUser(creator, 'requested');
    } else {
      unfollowUser(creator.username);
      setRemovedAlert(`Removed ${creator.name || creator.username} from following`);
      setTimeout(() => setRemovedAlert(''), 3000);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content followers-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="followers-tabs-header">
            <button
              className={`tab-btn-header ${tab === 'followers' ? 'tab-active' : ''}`}
              onClick={() => setTab('followers')}
            >
              Followers ({profile.followersCount ?? (profile.followersList?.length || 0)})
            </button>
            <button
              className={`tab-btn-header ${tab === 'following' ? 'tab-active' : ''}`}
              onClick={() => setTab('following')}
            >
              Following ({profile.followingCount ?? (profile.followingList?.length || 0)})
            </button>
            <button
              className={`tab-btn-header ${tab === 'suggested' ? 'tab-active' : ''}`}
              onClick={() => setTab('suggested')}
            >
              Suggested
            </button>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Temporary action alert */}
        {removedAlert && (
          <div className="followers-toast-notice">
            <Check size={14} className="text-green" /> {removedAlert}
          </div>
        )}

        {/* Search */}
        <div className="followers-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search connections..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="feed-search-input"
          />
        </div>

        {/* List Content */}
        <div className="modal-body followers-list-body">
          {filteredList.length > 0 ? (
            <div className="user-follow-list">
              {filteredList.map(creator => {
                const followStatus = getFollowStatus(creator.username);

                return (
                  <div key={creator.username} className="user-follow-row">
                    <img src={creator.avatar} alt={creator.name} className="user-follow-avatar" />
                    <div className="user-follow-info">
                      <div className="user-follow-name-row">
                        <span className="user-follow-name">{creator.name}</span>
                        {creator.verified && <ShieldCheck size={14} className="text-green" />}
                      </div>
                      <span className="user-follow-handle">@{creator.username}</span>
                    </div>

                    {/* Tab-specific actions */}
                    {tab === 'followers' ? (
                      <button
                        className="btn-remove-follower-action"
                        onClick={() => handleRemoveFollower(creator.username, creator.name)}
                        title="Remove as follower and friend"
                      >
                        <UserX size={14} /> Remove as follower
                      </button>
                    ) : tab === 'following' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {creator.status === 'requested' ? (
                          <button
                            className="btn-requested-pill"
                            onClick={() => handleToggleFollowing(creator)}
                            title="Follow Request Sent — Click to cancel request"
                          >
                            <Clock size={13} /> Requested
                          </button>
                        ) : (
                          <button
                            className="btn-follow-toggle btn-is-following"
                            onClick={() => handleToggleFollowing(creator)}
                            title="Click to unfollow / remove friend"
                          >
                            Following
                          </button>
                        )}
                        <button
                          className="btn-remove-friend-subtle"
                          onClick={() => handleToggleFollowing(creator)}
                          title="Remove Friend / Unfollow"
                        >
                          <UserX size={14} />
                        </button>
                      </div>
                    ) : (
                      /* Suggested tab */
                      <button
                        className={`btn-follow-toggle ${
                          followStatus === 'requested'
                            ? 'btn-requested-pill'
                            : followStatus === 'following'
                            ? 'btn-is-following'
                            : 'btn-follow-action'
                        }`}
                        onClick={() => handleToggleFollowing(creator)}
                      >
                        {followStatus === 'requested' ? (
                          <><Clock size={13} /> Requested</>
                        ) : followStatus === 'following' ? (
                          'Following'
                        ) : (
                          'Follow'
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-followers-view">
              <Users size={40} className="text-muted" />
              <h4>
                {tab === 'followers'
                  ? 'No followers yet'
                  : tab === 'following'
                  ? "You aren't following anyone yet"
                  : 'No creators found'}
              </h4>
              <p>
                {tab === 'followers'
                  ? 'When creators connect with your authentic profile, they will appear here.'
                  : 'Start following authentic creators to populate your feed with verified photography and journalism!'}
              </p>
              {tab !== 'suggested' && (
                <button
                  className="btn-primary"
                  style={{ marginTop: '0.75rem' }}
                  onClick={() => setTab('suggested')}
                >
                  <UserPlus size={16} /> Discover Verified Creators
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
