import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowRightLeft,
  ClockAlert,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { hasRole } = useAuth();

  const navItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: <LayoutDashboard className="w-5 h-5" />,
      show: hasRole(['ADMIN', 'LIBRARIAN']),
    },
    {
      label: 'Book Catalog',
      path: '/books',
      icon: <BookOpen className="w-5 h-5" />,
      show: true,
    },
    {
      label: 'Members',
      path: '/members',
      icon: <Users className="w-5 h-5" />,
      show: hasRole(['ADMIN', 'LIBRARIAN']),
    },
    {
      label: 'Active Loans',
      path: '/loans',
      icon: <ArrowRightLeft className="w-5 h-5" />,
      show: true,
    },
    {
      label: 'Reservations',
      path: '/reservations',
      icon: <ClockAlert className="w-5 h-5 text-indigo-500" />,
      show: true,
    },
    {
      label: 'Fines & Payments',
      path: '/payments',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      show: hasRole(['ADMIN', 'LIBRARIAN']),
    },
    {
      label: 'Overdue Loans',
      path: '/loans/overdue',
      icon: <ClockAlert className="w-5 h-5 text-amber-500" />,
      show: hasRole(['ADMIN', 'LIBRARIAN']),
    },
    {
      label: 'User Management',
      path: '/users',
      icon: <ShieldCheck className="w-5 h-5 text-indigo-500" />,
      show: hasRole('ADMIN'),
    },
    {
      label: 'Audit Trail',
      path: '/audit',
      icon: <FileSpreadsheet className="w-5 h-5 text-slate-500" />,
      show: hasRole('ADMIN'),
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <nav className="space-y-1.5">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems
          .filter((item) => item.show)
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
      </nav>

      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
        <p className="text-xs font-semibold text-slate-700">LibMaster Cloud</p>
        <p className="text-xs text-slate-500 mt-0.5">v1.0.0 Production</p>
      </div>
    </aside>
  );
};
