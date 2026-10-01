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
} from 'lucide-react';

export const MemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: memberData, isLoading: isMemberLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => (id ? memberApi.getById(id) : Promise.reject('No ID')),
    enabled: !!id,
  });

  const { data: activeLoansData, isLoading: isLoansLoading } = useQuery({
    queryKey: ['member-active-loans', id],
    queryFn: () => (id ? memberApi.getActiveLoans(id) : Promise.reject('No ID')),
    enabled: !!id,
  });

  const { data: loanHistoryData } = useQuery({
    queryKey: ['member-loan-history', id],
    queryFn: () => (id ? memberApi.getLoanHistory(id) : Promise.reject('No ID')),
    enabled: !!id,
  });

  const member = memberData?.data;
  const activeLoans = activeLoansData?.data || [];
  const loanHistory = loanHistoryData?.data?.content || [];

  if (isMemberLoading) {
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
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      <Link
        to="/members"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Members List
      </Link>

      {/* Member Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
              {member.firstName[0]}
              {member.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{member.fullName}</h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Membership #{member.membershipNumber}
              </p>
            </div>
          </div>

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
        </div>

        {/* Contact info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <Mail className="w-4 h-4 text-slate-400" />
            <span>{member.email}</span>
          </div>

          {member.phone && (
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{member.phone}</span>
            </div>
          )}

          {member.address && (
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{member.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Active Loans Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Current Borrowed Books</h2>
            <p className="text-xs text-slate-500">
              {activeLoans.length} of {member.maxLoans} max allowed books currently active
            </p>
          </div>
        </div>

        {isLoansLoading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Loading active loans...</div>
        ) : activeLoans.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {activeLoans.map((loan) => (
              <div key={loan.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{loan.book?.title}</p>
                    <p className="text-xs text-slate-400">Due: {new Date(loan.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <Badge variant={loan.overdue ? 'danger' : 'info'}>
                  {loan.overdue ? `${loan.daysOverdue}d Overdue` : 'Active Loan'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-sm">
            No active loans currently checked out.
          </div>
        )}
      </div>

      {/* Loan History Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Borrowing History</h2>
        {loanHistory.length > 0 ? (
          <div className="divide-y divide-slate-100 text-sm">
            {loanHistory.map((l) => (
              <div key={l.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{l.book?.title}</p>
                  <p className="text-xs text-slate-400">
                    Issued: {new Date(l.issueDate).toLocaleDateString()} &bull;{' '}
                    {l.returnDate ? `Returned: ${new Date(l.returnDate).toLocaleDateString()}` : 'Not returned'}
                  </p>
                </div>
                <Badge variant={l.status === 'RETURNED' ? 'success' : l.status === 'ISSUED' ? 'info' : 'danger'}>
                  {l.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 py-6 text-center">No past loan transactions recorded.</p>
        )}
      </div>
    </div>
  );
};
