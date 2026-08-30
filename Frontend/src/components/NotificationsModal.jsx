import React, { useState } from 'react';
import { X, Heart, MessageSquare, Users, Bell } from 'lucide-react';

export default function NotificationsModal({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'like',
      user: 'alice_verified',
      message: 'liked your post',
      time: '5 minutes ago',
      read: false,
    },
    {
      id: 2,
      type: 'comment',
      user: 'bob_explorer',
      message: 'commented on your post',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 3,
      type: 'follow',
      user: 'carol_admin',
      message: 'started following you',
      time: '2 hours ago',
      read: true,
    },
  ]);

  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return Heart;
      case 'comment':
        return MessageSquare;
      case 'follow':
        return Users;
      default:
        return Bell;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'like':
        return 'text-red-600';
      case 'comment':
        return 'text-blue-600';
      case 'follow':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex justify-end">
      <div className="bg-white w-96 max-w-full shadow-lg h-screen overflow-y-auto animate-in slide-in-from-right">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          <div className="flex gap-2">
            <button
              onClick={markAllRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-gray-100">
          {notifications.length > 0 ? (
            notifications.map((notif) => {
              const Icon = getIcon(notif.type);
              return (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-gray-50 transition cursor-pointer ${
                    !notif.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`p-2 bg-gray-100 rounded-full flex-shrink-0 ${getColor(notif.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm">
                        <span className="font-semibold text-gray-900">@{notif.user}</span>
                        <span className="text-gray-600"> {notif.message}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
