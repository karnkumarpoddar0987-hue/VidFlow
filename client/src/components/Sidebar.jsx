import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, Zap, Users, History, ListVideo, Clock, ThumbsUp,
  TrendingUp, Music, Gamepad2, Newspaper, Trophy, GraduationCap,
  Settings, HelpCircle, MessageSquare, User, Video, ChevronRight
} from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon: Icon, label, collapsed }) => (
  <NavLink to={to}
    className={({ isActive }) =>
      `flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
       ${isActive
         ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
         : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
       }`
    }
    title={collapsed ? label : undefined}
  >
    <Icon size={20} className="shrink-0" />
    {!collapsed && <span className="truncate">{label}</span>}
  </NavLink>
);

export default function Sidebar() {
  const { isOpen } = useSidebar();
  const { user } = useAuth();

  const mainLinks = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/shorts', icon: Zap, label: 'Shorts' },
    { to: '/subscriptions', icon: Users, label: 'Subscriptions' },
  ];

  const libraryLinks = [
    { to: '/history', icon: History, label: 'History' },
    { to: '/playlists', icon: ListVideo, label: 'Playlists' },
    { to: '/watch-later', icon: Clock, label: 'Watch Later' },
    { to: '/liked', icon: ThumbsUp, label: 'Liked Videos' },
  ];

  const exploreLinks = [
    { to: '/trending', icon: TrendingUp, label: 'Trending' },
    { to: '/search?q=music', icon: Music, label: 'Music' },
    { to: '/search?q=gaming', icon: Gamepad2, label: 'Gaming' },
    { to: '/search?q=news', icon: Newspaper, label: 'News' },
    { to: '/search?q=sports', icon: Trophy, label: 'Sports' },
    { to: '/search?q=education', icon: GraduationCap, label: 'Education' },
  ];

  return (
    <aside
      className={`fixed left-0 top-14 bottom-0 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800
        z-40 overflow-y-auto overflow-x-hidden transition-all duration-300 hidden md:block
        ${isOpen ? 'w-60' : 'w-16'}`}
    >
      <nav className="p-2 flex flex-col gap-0.5">
        {mainLinks.map(l => <NavItem key={l.to} {...l} collapsed={!isOpen} />)}

        {isOpen && <div className="border-t border-zinc-200 dark:border-zinc-800 my-2" />}
        {!isOpen && <div className="my-1" />}

        {user ? (
          <>
            {isOpen && <p className="px-3 py-1 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Library</p>}
            {libraryLinks.map(l => <NavItem key={l.to} {...l} collapsed={!isOpen} />)}
          </>
        ) : (
          isOpen && (
            <div className="mx-2 my-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <p className="text-xs text-zinc-500 mb-2">Sign in to access your library</p>
              <NavLink to="/login" className="flex items-center gap-2 text-sm text-blue-500 font-medium hover:underline">
                <User size={14} /> Sign in
              </NavLink>
            </div>
          )
        )}

        {isOpen && <div className="border-t border-zinc-200 dark:border-zinc-800 my-2" />}
        {!isOpen && <div className="my-1" />}

        {isOpen && <p className="px-3 py-1 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Explore</p>}
        {exploreLinks.map(l => <NavItem key={l.to} {...l} collapsed={!isOpen} />)}

        {isOpen && <div className="border-t border-zinc-200 dark:border-zinc-800 my-2" />}
        {!isOpen && <div className="my-1" />}

        <NavItem to="/settings" icon={Settings} label="Settings" collapsed={!isOpen} />
        <NavItem to="/search?q=help" icon={HelpCircle} label="Help" collapsed={!isOpen} />
      </nav>
    </aside>
  );
}
