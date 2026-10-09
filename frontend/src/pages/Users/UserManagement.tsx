import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../services/api';
import { User, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/Common/Badge';
import {
  ShieldCheck,
  Plus,
  Search,
  UserCheck,
  UserX,
  Key,
  Shield,
  Lock,
} from 'lucide-react';

const fallbackUsers: User[] = [
  {
    id: 'u1',
    username: 'admin',
    email: 'admin@library.local',
    fullName: 'System Administrator',
    role: 'ADMIN',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'u2',
    username: 'librarian.john',
    email: 'john.librarian@library.local',
    fullName: 'John Miller',
    role: 'LIBRARIAN',
    active: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'u3',
    username: 'circulation.sarah',
    email: 'sarah.circulation@library.local',
    fullName: 'Sarah Jenkins',
    role: 'LIBRARIAN',
    active: true,
    createdAt: '2026-02-01T14:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  // User form modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('LIBRARIAN');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password reset modal
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');

  const {
    data: usersData,
    refetch,
  } = useQuery({
    queryKey: ['users', searchTerm, selectedRole, page, size],
    queryFn: () =>
      userApi.search({
        search: searchTerm || undefined,
        role: selectedRole,
        page,
        size,
      }),
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await userApi.create({
        username: newUsername,
        email: newEmail,
        password: 'ActiveUser123!',
        fullName: newFullName,
        role: newRole,
      });
      success('System user created successfully');
      setIsCreateOpen(false);
      setNewUsername('');
      setNewEmail('');
      setNewFullName('');
      refetch();
    } catch (err: any) {
      error(err.response?.data?.error?.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      error('You cannot deactivate your own administrative account');
      return;
    }
    try {
      await userApi.updateStatus(targetUser.id, !targetUser.active);
      success(`User account ${!targetUser.active ? 'activated' : 'deactivated'}`);
      refetch();
    } catch (err: any) {
      error(err.response?.data?.error?.message || 'Failed to update user status');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;
    try {
      await userApi.changePassword(passwordModalUser.id, { newPassword: resetPasswordVal });
      success(`Password reset for ${passwordModalUser.username}`);
      setPasswordModalUser(null);
      setResetPasswordVal('');
    } catch (err: any) {
      error(err.response?.data?.error?.message || 'Failed to reset password');
    }
  };

  const rawUsers =
    usersData?.data?.content && usersData.data.content.length > 0 ? usersData.data.content : fallbackUsers;

  const displayUsers = rawUsers.filter((u) => {
    const matchesSearch =
      !searchTerm ||
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            Staff & Role Access Administration
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System operator accounts, RBAC permission roles, and staff authorization
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Staff Account
        </button>
      </div>

      {/* RBAC Role Matrix Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-indigo-700" />
            <span className="font-bold text-xs text-indigo-950 uppercase">ADMIN Role</span>
          </div>
          <p className="text-xs text-indigo-900/80">
            Full system control, catalog mutation, staff provisioning, database seed, and financial waivers.
          </p>
        </div>

        <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-xs text-emerald-950 uppercase">LIBRARIAN Role</span>
          </div>
          <p className="text-xs text-emerald-900/80">
            Circulation management, book checkouts & returns, member registration, and fee collection.
          </p>
        </div>

        <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-slate-700" />
            <span className="font-bold text-xs text-slate-950 uppercase">MEMBER / PATRON Role</span>
          </div>
          <p className="text-xs text-slate-700/80">
            Catalog search, placing book holds, viewing active personal loans, and payment history.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            placeholder="Search users by name, username, or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedRole || ''}
          onChange={(e) => {
            setSelectedRole(e.target.value ? (e.target.value as UserRole) : undefined);
            setPage(0);
          }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="LIBRARIAN">LIBRARIAN</option>
          <option value="MEMBER">MEMBER</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Staff User</th>
                <th className="px-6 py-3.5">Assigned Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Account Created</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{user.fullName}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="font-mono text-indigo-700 font-semibold">@{user.username}</span>
                      <span>&bull;</span>
                      <span>{user.email}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : user.role === 'LIBRARIAN'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <Badge variant={user.active ? 'success' : 'danger'}>
                      {user.active ? 'Active' : 'Disabled'}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setPasswordModalUser(user)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
                        title="Change Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`p-1.5 rounded-xl transition ${
                          user.active
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={user.active ? 'Deactivate User' : 'Activate User'}
                      >
                        {user.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              Create Staff Account
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. Alex Morgan"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. alex.morgan"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. alex.morgan@library.local"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">System Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="LIBRARIAN">LIBRARIAN (Circulation & Catalog)</option>
                  <option value="ADMIN">ADMIN (Full Authority)</option>
                  <option value="MEMBER">MEMBER (Patron)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-600" />
              Reset Staff Password
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Set a new temporary password for <strong>{passwordModalUser.fullName}</strong> (@{passwordModalUser.username})
            </p>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 text-xs block mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={resetPasswordVal}
                  onChange={(e) => setResetPasswordVal(e.target.value)}
                  placeholder="Enter new strong password..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default UserManagement;
