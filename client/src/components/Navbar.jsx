import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu, Search, Mic, Bell, User, LogOut, Settings,
  Video, ChevronDown, X, Sun, Moon, Laptop
} from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getSuggestions } from '../services/videoService';
import NotificationDropdown from './NotificationDropdown';
import useDebounce from '../hooks/useDebounce';

export default function Navbar() {
  const { toggle } = useSidebar();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const debouncedQ = useDebounce(query, 300);
  const searchRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    if (debouncedQ.trim().length > 1) {
      getSuggestions(debouncedQ).then(r => {
        setSuggestions(r.suggestions || []);
        setShowSuggestions(true);
      }).catch(() => {});
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQ]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (q) => {
    const term = (q || query).trim();
    if (!term) return;
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const themeOptions = [
    { label: 'Light', value: 'light', icon: Sun },
    { label: 'Dark', value: 'dark', icon: Moon },
    { label: 'System', value: 'system', icon: Laptop }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 gap-4 z-50">
      {/* Left */}
      <div className="flex items-center gap-4 shrink-0">
        <button onClick={toggle} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <Menu size={20} />
        </button>
        <Link to="/" className="flex items-center gap-1.5 select-none">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Video size={16} className="text-white" />
          </div>
          <span className="text-xl font-bold hidden sm:block">
            Vid<span className="text-blue-500">Flow</span>
          </span>
        </Link>
      </div>

      {/* Search */}
      <div ref={searchRef} className="flex-1 max-w-2xl mx-auto relative hidden md:flex items-center">
        <div className="flex w-full rounded-full border border-zinc-300 dark:border-zinc-700 overflow-hidden bg-zinc-50 dark:bg-zinc-900 focus-within:border-blue-500">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search videos..."
            className="flex-1 px-4 py-2 bg-transparent text-sm outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(''); setSuggestions([]); }} className="px-2 text-zinc-400 hover:text-zinc-600">
              <X size={16} />
            </button>
          )}
          <button onClick={() => handleSearch()} className="px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-l border-zinc-300 dark:border-zinc-700 transition-colors">
            <Search size={18} />
          </button>
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden">
            {suggestions.map((s, i) => (
              <button key={i} onMouseDown={() => handleSearch(s)}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left">
                <Search size={14} className="text-zinc-400 shrink-0" />
                <span>{s}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        <button onClick={() => navigate('/search')} className="md:hidden p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <Search size={20} />
        </button>

        {user ? (
          <>
            <div className="relative">
              <button onClick={() => { setShowNotifications(p => !p); setShowUserMenu(false); }}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 relative">
                <Bell size={20} />
              </button>
              {showNotifications && <NotificationDropdown onClose={() => setShowNotifications(false)} />}
            </div>
            <div ref={userRef} className="relative">
              <button onClick={() => { setShowUserMenu(p => !p); setShowNotifications(false); }}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                {user.avatar
                  ? <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                  : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-semibold">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                }
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                    <p className="font-semibold text-sm">{user.username}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                  <div className="py-1">
                    {themeOptions.map(t => (
                      <button key={t.value} onClick={() => setTheme(t.value)}
                        className={`flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 ${theme === t.value ? 'text-blue-500' : ''}`}>
                        <t.icon size={16} /> {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-zinc-200 dark:border-zinc-700 py-1">
                    <Link to="/profile" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <User size={16} /> Your Profile
                    </Link>
                    <Link to="/settings" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <Settings size={16} /> Settings
                    </Link>
                    <button onClick={() => { logout(); setShowUserMenu(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 text-red-500">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login"
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500 text-blue-500 text-sm hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors font-medium">
            <User size={16} /> Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
