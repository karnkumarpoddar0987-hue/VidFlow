import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check } from 'lucide-react';
import api from '../services/api';
import { format } from 'timeago.js';

export default function NotificationDropdown({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(r => {
      setNotifications(r.data.notifications || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const markAllRead = () => {
    api.put('/notifications/read-all').then(() => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    });
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
        <h3 className="font-semibold text-sm">Notifications</h3>
        <button onClick={markAllRead} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
          <Check size={12} /> Mark all read
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-sm text-zinc-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={32} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm text-zinc-500">No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n._id}
              className={`px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors
                ${!n.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}>
              <p className="text-sm leading-snug">{n.message}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{format(n.createdAt)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
