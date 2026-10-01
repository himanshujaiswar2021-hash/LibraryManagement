import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { memberApi } from '../../services/api';
import { Member, MemberStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MemberFormModal } from './MemberFormModal';
import { Pagination } from '../../components/Common/Pagination';
import { Badge } from '../../components/Common/Badge';
import {
  Search,
  Plus,
  Users,
  Edit2,
  ShieldBan,
  Phone,
  Mail,
  ArrowRightLeft,
} from 'lucide-react';

export const MemberList: React.FC = () => {
  const { hasRole } = useAuth();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<MemberStatus | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const {
    data: membersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['members', searchTerm, selectedStatus, page, size],
    queryFn: () =>
      memberApi.search({
        search: searchTerm || undefined,
        status: selectedStatus,
        page,
        size,
      }),
  });

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleStatusToggle = async (member: Member) => {
    const nextStatus: MemberStatus = member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await memberApi.updateStatus(member.id, nextStatus, 'Status changed via portal');
      success(`Member status set to ${nextStatus}`);
      refetch();
    } catch (err: any) {
      error(err.response?.data?.error?.message || 'Failed to update member status');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Library Members</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage patrons, loan limits, and membership statuses
          </p>
        </div>

        {hasRole(['ADMIN', 'LIBRARIAN']) && (
          <button
            onClick={() => {
              setEditingMember(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Register Member
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            placeholder="Search by member name, ID, email, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={selectedStatus || ''}
          onChange={(e) => {
            setSelectedStatus(e.target.value ? (e.target.value as MemberStatus) : undefined);
            setPage(0);
          }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-auto"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center items-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mr-3" />
            Loading registered members...
          </div>
        ) : membersData?.data?.content && membersData.data.content.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Member</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5 text-center">Active Loans</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {membersData.data.content.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          to={`/members/${member.id}`}
                          className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors block"
                        >
                          {member.fullName}
                        </Link>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {member.membershipNumber}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-bold text-slate-900 text-sm">
                          {member.activeLoansCount} / {member.maxLoans}
                        </span>
                        <span className="text-[11px] text-slate-400">max allowed</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          member.status === 'ACTIVE'
                            ? 'success'
                            : member.status === 'SUSPENDED'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {member.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/members/${member.id}`}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View Profile & Loans"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </Link>

                        {hasRole(['ADMIN', 'LIBRARIAN']) && (
                          <>
                            <button
                              onClick={() => handleEdit(member)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit Profile"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusToggle(member)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title={member.status === 'ACTIVE' ? 'Suspend Member' : 'Activate Member'}
                            >
                              <ShieldBan className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {membersData?.data && (
              <Pagination
                currentPage={membersData.data.page}
                totalPages={membersData.data.totalPages}
                totalElements={membersData.data.totalElements}
                pageSize={membersData.data.size}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 text-sm">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            No members found matching criteria.
          </div>
        )}
      </div>

      {/* Member Form Modal */}
      <MemberFormModal
        isOpen={isModalOpen}
        memberToEdit={editingMember}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
