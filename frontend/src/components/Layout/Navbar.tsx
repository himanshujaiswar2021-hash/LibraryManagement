import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Library, Bell, CheckCheck, Inbox, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../../services/api';
import { NotificationItem } from '../../types';

interface NavbarProps {
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showDropdown, setShowDropdown] = useState(false);

  const recipientId = user?.id || '';

  const { data: unreadData } = useQuery({
    queryKey: ['notificationsUnread', recipientId],
    queryFn: () => notificationApi.getUnread(recipientId),
    enabled: Boolean(user?.id),
    refetchInterval: 15000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsUnread'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(recipientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsUnread'] });
    },
  });

  const notifications: NotificationItem[] = unreadData?.data || [];
  const unreadCount = notifications.length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 shadow-xs">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <Library className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-slate-900 text-base leading-tight">LibMaster Pro</h1>
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Microservices Online
            </span>
          </div>
          <p className="text-xs text-slate-500">Enterprise Library Management DevOps Platform</p>
        </div>
      </div>

      {/* Center Search Bar Trigger */}
      {onOpenSearch && (
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/80 rounded-2xl text-xs text-slate-500 transition shadow-2xs group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
          <span>Quick search books, members, loans...</span>
          <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-400 group-hover:text-slate-600">
            Ctrl + K
          </kbd>
        </button>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Mobile Search button */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        )}

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 py-3 z-50 animate-scaleIn">
              <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">Notifications & Alerts</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllMutation.mutate()}
                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 px-2 py-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-medium">All caught up! No unread notifications.</p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div key={item.id} className="p-3 hover:bg-slate-50 rounded-xl transition flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{item.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-semibold">
                          {item.type}
                        </span>
                        <button
                          onClick={() => markReadMutation.mutate(item.id)}
                          className="text-[10px] text-slate-400 hover:text-indigo-600 font-semibold"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info / Active Session */}
        <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="flex flex-col text-right">
            <span className="text-sm font-bold text-slate-900">{user?.fullName || 'Administrator'}</span>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Open Access</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 border border-emerald-200/60 font-bold text-sm">
            AD
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
