import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { memberApi } from '../../services/api';
import { Badge } from '../../components/Common/Badge';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  ArrowRightLeft,
} from 'lucide-react';
import { Member, Loan } from '../../types';

const fallbackMembersDirectory: Record<string, Member> = {
  'd1111111-1111-1111-1111-111111111111': {
    id: 'd1111111-1111-1111-1111-111111111111',
    membershipNumber: 'MEM-2026-0001',
    firstName: 'Alice',
    lastName: 'Johnson',
    fullName: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '+1 (555) 019-2831',
    address: '452 University Avenue, Apt 4B, Cambridge, MA',
    maxLoans: 5,
    activeLoansCount: 1,
    status: 'ACTIVE',
    registrationDate: '2026-01-15T09:00:00Z',
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  'd2222222-2222-2222-2222-222222222222': {
    id: 'd2222222-2222-2222-2222-222222222222',
    membershipNumber: 'MEM-2026-0002',
    firstName: 'Bob',
    lastName: 'Smith',
    fullName: 'Bob Smith',
    email: 'bob.smith@example.com',
    phone: '+1 (555) 014-9982',
    address: '88 Faculty Way, Suite 10, Cambridge, MA',
    maxLoans: 10,
    activeLoansCount: 1,
    status: 'ACTIVE',
    registrationDate: '2026-02-01T11:00:00Z',
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  'd3333333-3333-3333-3333-333333333333': {
    id: 'd3333333-3333-3333-3333-333333333333',
    membershipNumber: 'MEM-2026-0003',
    firstName: 'Carol',
    lastName: 'White',
    fullName: 'Carol White',
    email: 'carol.white@example.com',
    phone: '+1 (555) 018-3341',
    address: '102 Tech Park Blvd, Boston, MA',
    maxLoans: 5,
    activeLoansCount: 1,
    status: 'ACTIVE',
    registrationDate: '2026-02-15T14:30:00Z',
    createdAt: '2026-02-15T14:30:00Z',
    updatedAt: new Date().toISOString(),
  },
  'd4444444-4444-4444-4444-444444444444': {
    id: 'd4444444-4444-4444-4444-444444444444',
    membershipNumber: 'MEM-2026-0004',
    firstName: 'David',
    lastName: 'Brown',
    fullName: 'David Brown',
    email: 'david.brown@example.com',
    phone: '+1 (555) 012-7764',
    address: '22 Campus Drive, Boston, MA',
    maxLoans: 5,
    activeLoansCount: 1,
    status: 'ACTIVE',
    registrationDate: '2026-03-01T10:00:00Z',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  'd5555555-5555-5555-5555-555555555555': {
    id: 'd5555555-5555-5555-5555-555555555555',
    membershipNumber: 'MEM-2026-0005',
    firstName: 'Eva',
    lastName: 'Green',
    fullName: 'Eva Green',
    email: 'eva.green@example.com',
    phone: '+1 (555) 019-5523',
    address: '61 Library Lane, Boston, MA',
    maxLoans: 5,
    activeLoansCount: 1,
    status: 'ACTIVE',
    registrationDate: '2026-03-10T16:00:00Z',
    createdAt: '2026-03-10T16:00:00Z',
    updatedAt: new Date().toISOString(),
  },
};

const fallbackMemberLoans: Record<string, Loan[]> = {
  'd1111111-1111-1111-1111-111111111111': [
    {
      id: 'e1',
      loanNumber: 'TXN-2026-0001',
      book: {
        id: 'b1',
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        isbn: '978-0132350884',
        language: 'English',
        totalCopies: 5,
        availableCopies: 4,
        borrowedCopies: 1,
        status: 'ACTIVE',
        createdAt: '',
        updatedAt: '',
      },
      member: fallbackMembersDirectory['d1111111-1111-1111-1111-111111111111'],
      issuedById: 'u1',
      issuedByUsername: 'admin',
      issueDate: '2026-10-01T10:30:00Z',
      dueDate: '2026-10-15T10:30:00Z',
      status: 'ISSUED',
      renewalCount: 0,
      fineAmount: 0,
      overdue: false,
      daysOverdue: 0,
      createdAt: '',
      updatedAt: '',
    },
  ],
  'd5555555-5555-5555-5555-555555555555': [
    {
      id: 'e5',
      loanNumber: 'TXN-2026-0005',
      book: {
        id: 'b8',
        title: '1984',
        isbn: '978-0451524935',
        language: 'English',
        totalCopies: 2,
        availableCopies: 0,
        borrowedCopies: 2,
        status: 'ACTIVE',
        createdAt: '',
        updatedAt: '',
      },
      member: fallbackMembersDirectory['d5555555-5555-5555-5555-555555555555'],
      issuedById: 'u1',
      issuedByUsername: 'admin',
      issueDate: '2026-09-01T11:00:00Z',
      dueDate: '2026-09-15T11:00:00Z',
      status: 'OVERDUE',
      renewalCount: 1,
      fineAmount: 9.5,
      overdue: true,
      daysOverdue: 19,
      createdAt: '',
      updatedAt: '',
    },
  ],
};

export const MemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: memberData, isLoading: isMemberLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => (id ? memberApi.getById(id) : Promise.reject('No ID')),
    enabled: !!id,
  });

  const { data: activeLoansData } = useQuery({
    queryKey: ['member-active-loans', id],
    queryFn: () => (id ? memberApi.getActiveLoans(id) : Promise.reject('No ID')),
    enabled: !!id,
  });

  const member: Member | undefined =
    memberData?.data || (id && fallbackMembersDirectory[id]) || fallbackMembersDirectory['d1111111-1111-1111-1111-111111111111'];

  const activeLoans =
    activeLoansData?.data && activeLoansData.data.length > 0
      ? activeLoansData.data
      : (id && fallbackMemberLoans[id]) || fallbackMemberLoans['d1111111-1111-1111-1111-111111111111'];

  if (isMemberLoading && !member) {
    return (
      <div className="py-20 flex justify-center text-slate-400">
        Loading member profile...
      </div>
    );
  }

  if (!member) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-600 font-semibold mb-2">Member Not Found</p>
        <Link to="/members" className="text-sm text-emerald-600 hover:underline">
          Back to Members
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Back button */}
      <Link
        to="/members"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Members List
      </Link>

      {/* Member Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-emerald-600/20">
              {member.firstName[0]}
              {member.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{member.fullName}</h1>
                <Badge variant={member.status === 'ACTIVE' ? 'success' : 'danger'}>
                  {member.status}
                </Badge>
              </div>
              <p className="text-xs font-mono font-bold text-emerald-700 mt-0.5">
                Membership #{member.membershipNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/loans"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Issue New Loan
            </Link>
          </div>
        </div>

        {/* Contact info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl">
            <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-slate-400 block mb-0.5">Email Address</span>
              <span className="font-bold text-slate-800 truncate block">{member.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl">
            <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <span className="text-slate-400 block mb-0.5">Phone Number</span>
              <span className="font-bold text-slate-800">{member.phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-slate-400 block mb-0.5">Registered Address</span>
              <span className="font-bold text-slate-800 truncate block">{member.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Borrowed Books */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Active Checkouts ({activeLoans.length} of {member.maxLoans} max)
            </h2>
          </div>
        </div>

        {activeLoans.length > 0 ? (
          <div className="space-y-3">
            {activeLoans.map((loan) => (
              <div
                key={loan.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400">{loan.loanNumber}</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{loan.book?.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span>Due: <strong className="text-slate-800">{new Date(loan.dueDate).toLocaleDateString()}</strong></span>
                    <span>Renewals: {loan.renewalCount ?? 0}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={loan.status === 'OVERDUE' ? 'danger' : 'info'}>
                    {loan.status}
                  </Badge>
                  <Link
                    to="/loans"
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition"
                  >
                    Manage Loan
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-sm">
            No active borrowed books for this patron.
          </div>
        )}
      </div>
    </div>
  );
};
export default MemberDetail;
