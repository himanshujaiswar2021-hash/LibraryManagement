import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, UserCircle, Library } from 'lucide-react';
import { Badge } from '../Common/Badge';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <Library className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-base leading-tight">LibMaster Pro</h1>
          <p className="text-xs text-slate-500">Enterprise Library Management</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-900">{user?.fullName}</span>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <Badge variant={user?.role === 'ADMIN' ? 'danger' : user?.role === 'LIBRARIAN' ? 'info' : 'success'} size="sm">
                {user?.role}
              </Badge>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
            <UserCircle className="w-6 h-6" />
          </div>
        </div>

        <button
          onClick={() => logout()}
          title="Sign Out"
          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
