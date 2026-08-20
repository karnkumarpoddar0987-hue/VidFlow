import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider } from './context/SidebarContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import Watch from './pages/Watch';
import Shorts from './pages/Shorts';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import History from './pages/History';
import WatchLater from './pages/WatchLater';
import LikedVideos from './pages/LikedVideos';
import Subscriptions from './pages/Subscriptions';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Channel from './pages/Channel';
import Settings from './pages/Settings';
import Trending from './pages/Trending';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SidebarProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-zinc-800 dark:text-white',
              duration: 3000
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/watch/:videoId" element={<Watch />} />
              <Route path="/shorts" element={<Shorts />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/history" element={<History />} />
              <Route path="/watch-later" element={<WatchLater />} />
              <Route path="/liked" element={<LikedVideos />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/playlist/:id" element={<PlaylistDetail />} />
              <Route path="/channel/:channelId" element={<Channel />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
