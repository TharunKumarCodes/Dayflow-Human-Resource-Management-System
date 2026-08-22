import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Notification } from '../types';
import { 
  Bell, 
  Search, 
  LogOut, 
  ShieldCheck, 
  Megaphone, 
  CheckCheck,
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle
} from 'lucide-react';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState<boolean>(false);

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annSuccess, setAnnSuccess] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/notifications/announcement', {
        title: annTitle,
        message: annMessage,
      });
      setAnnSuccess('Announcement broadcasted to all employees successfully!');
      setAnnTitle('');
      setAnnMessage('');
      setTimeout(() => {
        setAnnSuccess('');
        setShowAnnouncementModal(false);
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send announcement');
    }
  };

  const isHr = user?.role === 'HR_ADMIN';

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'URGENT': return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default: return <Info className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <header className="h-16 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Search Input */}
      <div className="relative w-72">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search employee, record, date..."
          onChange={(e) => onSearch && onSearch(e.target.value)}
          className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* HR Broadcast Announcement Trigger */}
        {isHr && (
          <button
            onClick={() => setShowAnnouncementModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600/20 to-brand-600/20 border border-violet-500/30 text-violet-300 hover:text-white text-xs font-semibold hover:border-violet-500/60 transition-all"
          >
            <Megaphone className="w-3.5 h-3.5 text-violet-400" />
            <span>Broadcast Notice</span>
          </button>
        )}

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm text-slate-100">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => handleMarkAsRead('ALL')}
                    className="text-[11px] text-brand-400 hover:underline font-medium flex items-center space-x-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                      className={`p-3.5 hover:bg-slate-800/50 cursor-pointer transition-colors flex items-start space-x-3 ${!n.isRead ? 'bg-indigo-950/20' : ''}`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {getNotifIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-200 truncate">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-500">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-brand-500 mt-1 flex-shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-800" />

        {/* User Pill & Logout */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">
              {user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user?.email}
            </p>
            <span className="text-[10px] text-brand-400 font-mono bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">
              {user?.role}
            </span>
          </div>

          <button
            onClick={logout}
            title="Logout of session"
            className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-rose-500/20 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Broadcast Notice Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center space-x-2 text-violet-400">
                <Megaphone className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-100">Broadcast HR Announcement</h3>
              </div>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {annSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4" />
                <span>{annSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSendAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Upcoming Townhall & Holiday Schedule Update"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Message Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type official company announcement message..."
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-violet-600/20 hover:brightness-110"
                >
                  Send Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
