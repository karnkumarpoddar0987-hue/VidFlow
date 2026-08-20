import React, { useState } from 'react';
import { Sun, Moon, Laptop, Shield, Bell, User, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setPwLoading(true);
    try {
      await api.put('/users/me/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const themes = [
    { value: 'light', label: 'Light', icon: Sun, desc: 'Clean white interface' },
    { value: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
    { value: 'system', label: 'System', icon: Laptop, desc: 'Follows your device setting' },
  ];

  const Section = ({ icon: Icon, title, children }) => (
    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-4">
      <h2 className="flex items-center gap-2 font-semibold mb-5 text-sm uppercase tracking-wide text-zinc-500">
        <Icon size={16} /> {title}
      </h2>
      {children}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Section icon={Palette} title="Appearance">
        <div className="grid grid-cols-3 gap-3">
          {themes.map(t => (
            <button key={t.value} onClick={() => setTheme(t.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors
                ${theme === t.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-500'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}`}>
              <t.icon size={22} />
              <div>
                <div className="text-sm font-medium">{t.label}</div>
                <div className="text-xs text-zinc-400">{t.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {user && (
        <>
          <Section icon={User} title="Account">
            <div className="text-sm space-y-1">
              <div className="flex justify-between py-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Username</span>
                <span className="font-medium">{user.username}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-500">Email</span>
                <span className="font-medium">{user.email}</span>
              </div>
            </div>
          </Section>

          <Section icon={Shield} title="Security">
            <form onSubmit={changePassword} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input type="password" required value={pwForm.currentPassword}
                  onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input type="password" required value={pwForm.newPassword}
                  onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <input type="password" required value={pwForm.confirm}
                  onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <button type="submit" disabled={pwLoading}
                className="px-5 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50">
                {pwLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </Section>
        </>
      )}

      <Section icon={Bell} title="Notifications">
        {[
          { label: 'Push notifications', desc: 'Notify me about new content from subscribed channels' },
          { label: 'Email notifications', desc: 'Send me email updates' },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b last:border-0 border-zinc-200 dark:border-zinc-800">
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-10 h-5 bg-zinc-200 dark:bg-zinc-700 rounded-full peer peer-checked:bg-blue-500 transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
            </label>
          </div>
        ))}
      </Section>
    </div>
  );
}
