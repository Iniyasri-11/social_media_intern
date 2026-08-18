import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';

const INITIAL_FOLLOWERS = [
  {
    username: 'al_vision_lab',
    name: 'Dr. Alistair Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'AI Safety & Neural Authenticity Researcher.',
    verified: true,
  },
  {
    username: 'maya_nature',
    name: 'Maya Chen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Foggy morning in the Redwood forests 🌲',
    verified: true,
  },
  {
    username: 'alex_tech',
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Optics and camera sensors enthusiast.',
    verified: true,
  },
  {
    username: 'james_wildlife',
    name: 'James Wilson',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Wildlife photography on Canon EOS R5 hardware.',
    verified: true,
  },
];

const INITIAL_FOLLOWING = [
  {
    username: 'natgeo',
    name: 'National Geographic',
    avatar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80',
    bio: 'Inspiring people to care about the planet. Verified authentic EXIF.',
    verified: true,
    status: 'following', // 'following' | 'requested'
  },
  {
    username: 'elena_lens',
    name: 'Elena Vance Lens',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Landscape & wildlife optics photographer. Zero composite art.',
    verified: true,
    status: 'following',
  },
  {
    username: 'reuters_world',
    name: 'Reuters World News',
    avatar: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=150&auto=format&fit=crop&q=80',
    bio: 'Fact-based global reporting from 2,500 journalists worldwide.',
    verified: true,
    status: 'requested',
  },
];

const INITIAL_HIGHLIGHTS = [
  {
    id: 'hl_1',
    title: 'Verified 🛡️',
    cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&auto=format&fit=crop&q=80',
    items: [
      {
        id: 'hl_item_1',
        type: 'photo',
        media: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
        caption: 'Yosemite sunset expedition with hardware sensor EXIF validation.',
        time: '2 days ago',
        verdict: 'Authentic 98%',
      },
      {
        id: 'hl_item_2',
        type: 'story',
        media: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=80',
        caption: 'Backstage gallery exhibition setup in San Francisco 📸',
        time: '3 days ago',
        verdict: 'Authentic 99%',
      },
    ],
  },
  {
    id: 'hl_2',
    title: 'Reels & Videos 🎬',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
    items: [
      {
        id: 'hl_item_3',
        type: 'reel',
        media: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        caption: 'Majestic waterfall cascade in Iceland filmed on Sony FX3 cinema line. 🌊',
        time: '1 week ago',
        verdict: 'Authentic Video 99%',
      },
    ],
  },
  {
    id: 'hl_3',
    title: 'Expeditions 🌲',
    cover: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&auto=format&fit=crop&q=80',
    items: [
      {
        id: 'hl_item_4',
        type: 'photo',
        media: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
        caption: 'Morning mist rolling through ancient redwood trees.',
        time: '2 weeks ago',
        verdict: 'Authentic 96%',
      },
    ],
  },
];

function getStorageKey(prefix, username) {
  const norm = (username || 'default').trim().toLowerCase();
  return `${prefix}_${norm}`;
}

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const activeUsername = user?.username || 'demo';

  // Helper to load profile for specific user
  const loadSavedProfile = (uname) => {
    const key = getStorageKey('trustgram_profile', uname);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (_) {}
    }

    // Check if there is a general saved profile
    const generalSaved = localStorage.getItem('trustgram_profile');
    if (generalSaved) {
      try {
        const parsed = JSON.parse(generalSaved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...parsed,
            username: uname,
            name: parsed.name || `@${uname}`,
          };
        }
      } catch (_) {}
    }

    return {
      name: uname === 'demo' ? 'Creative Explorer' : uname,
      username: uname,
      avatar: DEFAULT_AVATAR,
      bio: '📸 Digital storyteller & photographer. Dedicated to authentic, unaltered visual media. 🛡️ Trustgram Verified Creator.',
      website: 'https://trustgram.ai/' + uname,
      phone: '+1 (555) 0192',
      trustScore: 99.4,
      isVerified: true,
      followersCount: INITIAL_FOLLOWERS.length,
      followingCount: INITIAL_FOLLOWING.length,
      followingList: INITIAL_FOLLOWING,
      followersList: INITIAL_FOLLOWERS,
    };
  };

  const [profile, setProfile] = useState(() => loadSavedProfile(activeUsername));

  const [userPosts, setUserPosts] = useState(() => {
    const key = getStorageKey('trustgram_user_posts', activeUsername);
    const saved = localStorage.getItem(key);
    if (saved) {
      try { return JSON.parse(saved); } catch (_) {}
    }
    return [
      {
        id: 'user_post_1',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
        caption: 'Yosemite sunset expedition with Canon EOS R5 hardware sensor.',
        likes: 42,
        commentsCount: 3,
        verdict: 'Authentic',
        confidence_score: 0.98,
        createdAt: '2 days ago',
      },
      {
        id: 'user_post_2',
        image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
        caption: 'Morning mist rolling through ancient redwoods. #photography',
        likes: 89,
        commentsCount: 6,
        verdict: 'Authentic',
        confidence_score: 0.96,
        createdAt: '5 days ago',
      },
    ];
  });

  const [highlights, setHighlights] = useState(() => {
    const key = getStorageKey('trustgram_highlights', activeUsername);
    const saved = localStorage.getItem(key);
    if (saved) {
      try { return JSON.parse(saved); } catch (_) {}
    }
    return INITIAL_HIGHLIGHTS;
  });

  const [myStories, setMyStories] = useState(() => {
    const key = getStorageKey('trustgram_my_stories', activeUsername);
    const saved = localStorage.getItem(key);
    if (saved) {
      try { return JSON.parse(saved); } catch (_) {}
    }
    return [];
  });

  const [savedPosts, setSavedPosts] = useState([]);

  // When logged-in user changes, restore user-specific profile
  useEffect(() => {
    if (user?.username) {
      const uProfile = loadSavedProfile(user.username);
      setProfile(uProfile);

      const postsKey = getStorageKey('trustgram_user_posts', user.username);
      const savedP = localStorage.getItem(postsKey);
      if (savedP) {
        try { setUserPosts(JSON.parse(savedP)); } catch (_) {}
      }

      const hlKey = getStorageKey('trustgram_highlights', user.username);
      const savedHl = localStorage.getItem(hlKey);
      if (savedHl) {
        try { setHighlights(JSON.parse(savedHl)); } catch (_) {}
      }

      const stKey = getStorageKey('trustgram_my_stories', user.username);
      const savedSt = localStorage.getItem(stKey);
      if (savedSt) {
        try { setMyStories(JSON.parse(savedSt)); } catch (_) {}
      }
    }
  }, [user?.username]);

  // Persist profile to both user-keyed and global localStorage
  useEffect(() => {
    if (profile?.username) {
      const key = getStorageKey('trustgram_profile', profile.username);
      const serialized = JSON.stringify(profile);
      localStorage.setItem(key, serialized);
      localStorage.setItem('trustgram_profile', serialized);
      // Also cache active avatar
      if (profile.avatar) {
        localStorage.setItem(`trustgram_avatar_${profile.username}`, profile.avatar);
      }
    }
  }, [profile]);

  useEffect(() => {
    const key = getStorageKey('trustgram_user_posts', profile.username);
    localStorage.setItem(key, JSON.stringify(userPosts));
  }, [userPosts, profile.username]);

  useEffect(() => {
    const key = getStorageKey('trustgram_highlights', profile.username);
    localStorage.setItem(key, JSON.stringify(highlights));
  }, [highlights, profile.username]);

  useEffect(() => {
    const key = getStorageKey('trustgram_my_stories', profile.username);
    localStorage.setItem(key, JSON.stringify(myStories));
  }, [myStories, profile.username]);

  // ── Profile Updates ──
  const updateProfile = (updates) => {
    setProfile(prev => {
      const updated = { ...prev, ...updates };
      // Save immediately
      const key = getStorageKey('trustgram_profile', updated.username);
      localStorage.setItem(key, JSON.stringify(updated));
      localStorage.setItem('trustgram_profile', JSON.stringify(updated));
      return updated;
    });
  };

  // ── Follow / Request / Unfollow / Remove Follower & Friend Management ──

  const getFollowStatus = (targetUsername) => {
    if (!targetUsername || targetUsername === profile.username) return 'none';
    const match = profile.followingList?.find(u => u.username === targetUsername);
    if (!match) return 'none';
    return match.status || 'following';
  };

  const followUser = (targetUser, requestedStatus = 'requested') => {
    setProfile(prev => {
      const existing = prev.followingList?.find(u => u.username === targetUser.username);
      let updatedList;
      if (existing) {
        updatedList = prev.followingList.map(u =>
          u.username === targetUser.username ? { ...u, status: requestedStatus } : u
        );
      } else {
        const item = {
          username: targetUser.username,
          name: targetUser.name || targetUser.username,
          avatar: targetUser.avatar || DEFAULT_AVATAR,
          verified: Boolean(targetUser.verified),
          status: requestedStatus, // 'requested' | 'following'
        };
        updatedList = [...(prev.followingList || []), item];
      }
      return {
        ...prev,
        followingList: updatedList,
        followingCount: updatedList.length,
      };
    });
  };

  const unfollowUser = (targetUsername) => {
    setProfile(prev => {
      const updatedList = (prev.followingList || []).filter(u => u.username !== targetUsername);
      return {
        ...prev,
        followingList: updatedList,
        followingCount: updatedList.length,
      };
    });
  };

  const removeFriend = (targetUsername) => {
    unfollowUser(targetUsername);
  };

  const removeFollower = (targetUsername) => {
    setProfile(prev => {
      const updatedFollowers = (prev.followersList || []).filter(u => u.username !== targetUsername);
      return {
        ...prev,
        followersList: updatedFollowers,
        followersCount: updatedFollowers.length,
      };
    });
  };

  const toggleFollow = (targetUser) => {
    const currentStatus = getFollowStatus(targetUser.username);
    if (currentStatus === 'none') {
      followUser(targetUser, 'requested');
    } else {
      unfollowUser(targetUser.username);
    }
  };

  // ── Post & Highlight Operations ──

  const addUserPost = (post) => {
    const formattedPost = {
      id: post.id || 'user_post_' + Date.now(),
      image: post.image,
      caption: post.caption,
      likes: post.likes || 1,
      commentsCount: post.commentsList?.length || 0,
      verdict: post.verdict || 'Authentic',
      confidence_score: post.confidence_score || 0.95,
      createdAt: 'Just now',
    };
    setUserPosts(prev => [formattedPost, ...prev]);
  };

  const deleteUserPost = (postId) => {
    setUserPosts(prev => {
      const updated = prev.filter(p => p.id !== postId);
      try {
        const key = getStorageKey('trustgram_user_posts', profile.username);
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const addHighlight = (newHl) => {
    setHighlights(prev => {
      const updated = [...prev, newHl];
      try {
        const key = getStorageKey('trustgram_highlights', profile.username);
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const deleteHighlight = (hlId) => {
    setHighlights(prev => {
      const updated = prev.filter(h => h.id !== hlId);
      try {
        const key = getStorageKey('trustgram_highlights', profile.username);
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const addStoryToHighlight = (highlightId, item) => {
    setHighlights(prev => prev.map(hl => {
      if (hl.id === highlightId) {
        return {
          ...hl,
          items: [...(hl.items || []), item],
        };
      }
      return hl;
    }));
  };

  const addMyStory = (story) => {
    const s = {
      id: 'story_' + Date.now(),
      media: story.media,
      type: story.type || 'photo',
      caption: story.caption || 'Verified story moment 🛡️',
      time: 'Just now',
      verdict: story.verdict || 'Authentic',
    };
    setMyStories(prev => [s, ...prev]);
  };

  const deleteMyStory = (storyId) => {
    setMyStories(prev => prev.filter(s => s.id !== storyId));
  };

  const toggleSavePost = (post) => {
    setSavedPosts(prev => {
      const exists = prev.some(p => p.id === post.id);
      if (exists) return prev.filter(p => p.id !== post.id);
      return [...prev, post];
    });
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        userPosts,
        savedPosts,
        highlights,
        myStories,
        updateProfile,
        followUser,
        unfollowUser,
        removeFriend,
        removeFollower,
        toggleFollow,
        getFollowStatus,
        addUserPost,
        deleteUserPost,
        addHighlight,
        deleteHighlight,
        addStoryToHighlight,
        addMyStory,
        deleteMyStory,
        toggleSavePost,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
