import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import { useSidebar } from '../context/SidebarContext';

export default function MainLayout() {
  const { isOpen } = useSidebar();
  const { pathname } = useLocation();
  const isShorts = pathname === '/shorts';

  if (isShorts) {
    return (
      <div className="flex flex-col bg-black" style={{ height: '100dvh', overflow: 'hidden' }}>
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-zinc-950">
      <Navbar />
      <div className="flex flex-1 overflow-hidden pt-14">
        <Sidebar />
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            isOpen ? 'md:ml-60' : 'md:ml-16'
          }`}
        >
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
