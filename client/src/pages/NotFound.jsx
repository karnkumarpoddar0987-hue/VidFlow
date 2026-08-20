import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-8xl font-bold text-zinc-200 dark:text-zinc-800 mb-4">404</div>
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-zinc-500 mb-8 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
      <div className="flex gap-3">
        <Link to="/" className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors">
          <Home size={16} /> Go Home
        </Link>
        <Link to="/search" className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
          <Search size={16} /> Search Videos
        </Link>
      </div>
    </div>
  );
}
