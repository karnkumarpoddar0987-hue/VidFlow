import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Zap, Users, User, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/shorts', icon: Zap, label: 'Shorts' },
  { to: '/subscriptions', icon: Users, label: 'Subs' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/profile', icon: User, label: 'You' },
];

export default function MobileNav() {
  const { user } = useAuth();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex z-50 pb-safe">
      {links.map(l => (
        <NavLink key={l.to} to={l.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 flex-1 py-2 text-xs transition-colors
             ${isActive ? 'text-blue-500' : 'text-zinc-500 dark:text-zinc-400'}`
          }>
          <l.icon size={22} />
          <span>{l.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
