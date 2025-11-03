import { useState, useEffect } from 'react';
import { User, Moon, Sun, Bell, Mail, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

export default function Settings() {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
  });

  const [settingsData, setSettingsData] = useState({
    notifications_enabled: true,
    email_notifications: true,
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name,
        email: profile.email,
      });
      loadSettings();
    }
  }, [profile]);

  const loadSettings = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettingsData({
          notifications_enabled: data.notifications_enabled,
          email_notifications: data.email_notifications,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      await supabase
        .from('profiles')
        .update({ full_name: profileData.full_name })
        .eq('id', profile.id);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (existingSettings) {
        await supabase
          .from('user_settings')
          .update(settingsData)
          .eq('user_id', profile.id);
      } else {
        await supabase
          .from('user_settings')
          .insert([{ user_id: profile.id, ...settingsData, theme }]);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Profile Settings</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                disabled
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Profile'}
            </button>

            {saved && (
              <p className="text-sm text-green-600 dark:text-green-400 text-center">
                Changes saved successfully!
              </p>
            )}
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                {theme === 'light' ? <Sun size={24} className="text-white" /> : <Moon size={24} className="text-white" />}
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Theme</h3>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose your preferred theme for the application
              </p>

              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="flex items-center gap-3">
                  {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                  <span className="font-medium text-gray-800 dark:text-white">
                    {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </span>
                <div className="relative w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors">
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      theme === 'dark' ? 'transform translate-x-6' : ''
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Bell size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Notifications</h3>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Push Notifications</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Receive notifications in the app
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settingsData.notifications_enabled}
                  onChange={(e) => setSettingsData({ ...settingsData, notifications_enabled: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Email Notifications</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Receive notifications via email
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settingsData.email_notifications}
                  onChange={(e) => setSettingsData({ ...settingsData, email_notifications: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>

              {saved && (
                <p className="text-sm text-green-600 dark:text-green-400 text-center">
                  Preferences saved successfully!
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
