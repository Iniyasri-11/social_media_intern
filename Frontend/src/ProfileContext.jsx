import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';

const INITIAL_HIGHLIGHTS = [
  { id: 'hl_1', title: 'Verified 🛡️', cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150&auto=format&fit=crop&q=80' },
  { id: 'hl_2', title: 'Raw Optics 📷', cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80' },
  { id: 'hl_3', title: 'Expeditions 🌲', cover: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=150&auto=format&fit=crop&q=80' },
  { id: 'hl_4', title: 'Neural Lab 🧪', cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
];

export function ProfileProvider({ children }) {
  const { user } = useAuth();

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('trustgram_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (_) {}
    }
    return {
      name: 'Creative Explorer',
      username: user?.username || 'demo',
      avatar: DEFAULT_AVATAR,
      bio: '📸 Digital storyteller & photographer. Dedicated to authentic, unaltered visual media. 🛡️ Trustgram Verified Creator.',
      website: 'https://trustgram.ai/demo',
      phone: '+1 (555) 0192',
      trustScore: 99.4,
      isVerified: true,
      followersCount: 0,
      followingCount: 0,
      followingList: [],
      followersList: [],
    };
  });

  const [userPosts, setUserPosts] = useState(() => {
    const saved = localStorage.getItem('trustgram_user_posts');
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
    const saved = localStorage.getItem('trustgram_highlights');
    if (saved) {
      try { return JSON.parse(saved); } catch (_) {}
    }
    return INITIAL_HIGHLIGHTS;
  });

  const [myStories, setMyStories] = useState(() => {
    const saved = localStorage.getItem('trustgram_my_stories');
    if (saved) {
      try { return JSON.parse(saved); } catch (_) {}
    }
    return [];
  });

  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    if (user?.username && profile.username !== user.username && profile.username === 'demo') {
      setProfile(prev => ({ ...prev, username: user.username, name: `@${user.username}` }));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('trustgram_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('trustgram_user_posts', JSON.stringify(userPosts));
  }, [userPosts]);

  useEffect(() => {
    localStorage.setItem('trustgram_highlights', JSON.stringify(highlights));
  }, [highlights]);

  useEffect(() => {
    localStorage.setItem('trustgram_my_stories', JSON.stringify(myStories));
  }, [myStories]);

  const updateProfile = (updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const followUser = (targetUser) => {
    setProfile(prev => {
      const alreadyFollowing = prev.followingList.some(u => u.username === targetUser.username);
      if (alreadyFollowing) return prev;
      const updatedList = [...prev.followingList, targetUser];
      return {
        ...prev,
        followingList: updatedList,
        followingCount: updatedList.length,
      };
    });
  };

  const unfollowUser = (targetUsername) => {
    setProfile(prev => {
      const updatedList = prev.followingList.filter(u => u.username !== targetUsername);
      return {
        ...prev,
        followingList: updatedList,
        followingCount: updatedList.length,
      };
    });
  };

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
    setUserPosts(prev => prev.filter(p => p.id !== postId));
  };

  const addHighlight = (newHl) => {
    setHighlights(prev => [...prev, newHl]);
  };

  const deleteHighlight = (hlId) => {
    setHighlights(prev => prev.filter(h => h.id !== hlId));
  };

  const addMyStory = (story) => {
    const s = {
      id: 'story_' + Date.now(),
      media: story.media,
      caption: story.caption || 'Verified story moment 🛡️',
      time: 'Just now',
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
        addUserPost,
        deleteUserPost,
        addHighlight,
        deleteHighlight,
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
