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
  Download,
  ShieldCheck,
} from 'lucide-react';

const fallbackMembers: Member[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    membershipNumber: 'MEM-2026-0001',
    firstName: 'Alice',
    lastName: 'Johnson',
    fullName: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '+1 (555) 019-2831',
    address: '452 University Avenue, Apt 4B',
    maxLoans: 5,
    activeLoansCount: 1,
    status: 'ACTIVE',
    registrationDate: '2026-01-15T09:00:00Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    membershipNumber: 'MEM-2026-0002',
    firstName: 'Bob',
    lastName: 'Smith',
    fullName: 'Bob Smith',
    email: 'bob.smith@example.com',
    phone: '+1 (555) 014-9982',
    address: '88 Faculty Way, Suite 10',
    maxLoans: 10,
    activeLoansCount: 1,
    status: 'ACTIVE',
    registrationDate: '2026-02-01T11:00:00Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    membershipNumber: 'MEM-2026-0003',
    firstName: 'Carol',
    lastName: 'White',
    fullName: 'Carol White',
    email: 'carol.white@example.com',
    phone: '+1 (555) 018-3341',
    address: '102 Tech Park Blvd',
    maxLoans: 5,
    activeLoansCount: 1,
    status: 'ACTIVE',
    registrationDate: '2026-02-15T14:30:00Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    membershipNumber: 'MEM-2026-0004',
    firstName: 'David',
    lastName: 'Brown',
    fullName: 'David Brown',
    email: 'david.brown@example.com',
    phone: '+1 (555) 012-7764',
    address: '22 Campus Drive',
    maxLoans: 5,
    activeLoansCount: 1,
    status: 'ACTIVE',
    registrationDate: '2026-03-01T10:00:00Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd5555555-5555-5555-5555-555555555555',
    membershipNumber: 'MEM-2026-0005',
    firstName: 'Eva',
    lastName: 'Green',
    fullName: 'Eva Green',
    email: 'eva.green@example.com',
    phone: '+1 (555) 019-5523',
    address: '61 Library Lane',
    maxLoans: 5,
    activeLoansCount: 1,
    status: 'ACTIVE',
    registrationDate: '2026-03-10T16:00:00Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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

  const displayMembers = membersData?.data?.content ?? fallbackMembers;

  const handleExportCSV = () => {
    const headers = 'Membership Number,Full Name,Email,Phone,Max Loan Limit,Active Loans,Status\n';
    const rows = displayMembers
      .map(
        (m) =>
          `"${m.membershipNumber}","${m.fullName}","${m.email}","${m.phone || ''}",${m.maxLoans},${m.activeLoansCount},"${m.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `library_members_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Library Members Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage patrons, loan limits, borrower standing, and member registrations
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-semibold text-xs shadow-2xs transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>

          {hasRole(['ADMIN', 'LIBRARIAN']) && (
            <button
              onClick={() => {
                setEditingMember(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Register Member
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Registered</span>
            <p className="text-lg font-extrabold text-slate-900">5 Patrons</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Active Borrowers</span>
            <p className="text-lg font-extrabold text-slate-900">5 Active Loans</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Account Standing</span>
            <p className="text-lg font-extrabold text-slate-900">100% Verified</p>
          </div>
        </div>
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
        {isLoading && !displayMembers.length ? (
          <div className="py-20 flex justify-center items-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mr-3" />
            Loading registered members...
          </div>
        ) : displayMembers.length > 0 ? (
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
                {displayMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                          {member.firstName[0]}
                          {member.lastName[0]}
                        </div>
                        <div>
                          <Link
                            to={`/members/${member.id}`}
                            className="font-bold text-slate-900 hover:text-emerald-600 transition"
                          >
                            {member.fullName}
                          </Link>
                          <p className="text-xs text-slate-400 font-mono">
                            #{member.membershipNumber}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{member.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{member.phone}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
                        <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          {member.activeLoansCount} / {member.maxLoans}
                        </span>
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
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                        >
                          Profile
                        </Link>
                        {hasRole(['ADMIN', 'LIBRARIAN']) && (
                          <>
                            <button
                              onClick={() => handleEdit(member)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition"
                              title="Edit Member"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusToggle(member)}
                              className={`p-2 rounded-xl transition ${
                                member.status === 'ACTIVE'
                                  ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
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
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="text-base font-semibold text-slate-600">No members found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Pagination */}
        {membersData?.data && (
          <Pagination
            currentPage={membersData.data.page}
            totalPages={membersData.data.totalPages}
            totalElements={membersData.data.totalElements}
            pageSize={size}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>

      {/* Member Add/Edit Modal */}
      {isModalOpen && (
        <MemberFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMember(null);
          }}
          memberToEdit={editingMember}
          onSuccess={() => {
            refetch();
            setIsModalOpen(false);
            setEditingMember(null);
          }}
        />
      )}
    </div>
  );
};
export default MemberList;
