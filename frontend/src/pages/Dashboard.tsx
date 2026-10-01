import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/api';
import {
  BookOpen,
  Users,
  ArrowRightLeft,
  ClockAlert,
  TrendingUp,
  AlertTriangle,
  Library,
} from 'lucide-react';
import { Badge } from '../components/Common/Badge';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
  });

  const { data: recentData, isLoading: isRecentLoading } = useQuery({
    queryKey: ['dashboard-recent'],
    queryFn: dashboardApi.getRecentActivity,
  });

  const { data: mostBorrowedData } = useQuery({
    queryKey: ['dashboard-most-borrowed'],
    queryFn: dashboardApi.getMostBorrowed,
  });

  const { data: overdueMembersData } = useQuery({
    queryKey: ['dashboard-overdue-members'],
    queryFn: dashboardApi.getOverdueMembers,
  });

  const stats = statsData?.data;

  const statCards = [
    {
      title: 'Total Book Titles',
      value: stats?.totalBooks ?? 0,
      subValue: `${stats?.totalCopies ?? 0} total physical copies`,
      icon: <BookOpen className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-50',
    },
    {
      title: 'Available Copies',
      value: stats?.totalAvailableCopies ?? 0,
      subValue: `${(stats?.totalCopies ?? 0) - (stats?.totalAvailableCopies ?? 0)} currently on loan`,
      icon: <Library className="w-6 h-6 text-sky-600" />,
      bg: 'bg-sky-50',
    },
    {
      title: 'Active Members',
      value: stats?.activeMembers ?? 0,
      subValue: `${stats?.totalMembers ?? 0} total registered`,
      icon: <Users className="w-6 h-6 text-indigo-600" />,
      bg: 'bg-indigo-50',
    },
    {
      title: 'Overdue Loans',
      value: stats?.overdueLoans ?? 0,
      subValue: 'Requires immediate follow-up',
      icon: <ClockAlert className="w-6 h-6 text-rose-600" />,
      bg: 'bg-rose-50',
      highlight: (stats?.overdueLoans ?? 0) > 0,
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time catalog metrics, circulation statistics, and loan activity
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl bg-white border ${
              card.highlight ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-slate-200/80'
            } shadow-sm transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl ${card.bg}`}>{card.icon}</div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isStatsLoading ? '...' : card.value}
            </div>
            <p className="text-xs text-slate-500 mt-1">{card.subValue}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Circulation Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Transactions</h2>
              <p className="text-xs text-slate-500">Latest checkouts and returns</p>
            </div>
            <Link
              to="/loans"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              View All Loans &rarr;
            </Link>
          </div>

          {isRecentLoading ? (
            <div className="py-12 flex justify-center text-slate-400 text-sm">
              Loading recent transactions...
            </div>
          ) : recentData?.data && recentData.data.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentData.data.map((loan) => (
                <div key={loan.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                      <ArrowRightLeft className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {loan.book?.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        Issued to <span className="font-medium text-slate-700">{loan.member?.fullName}</span> ({loan.member?.membershipNumber})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge
                      variant={
                        loan.status === 'ISSUED'
                          ? 'info'
                          : loan.status === 'RETURNED'
                          ? 'success'
                          : loan.status === 'OVERDUE'
                          ? 'danger'
                          : 'neutral'
                      }
                    >
                      {loan.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm">
              No recent loan transactions found.
            </div>
          )}
        </div>

        {/* Top Borrowed & Overdue Alerts */}
        <div className="space-y-6">
          {/* Top Borrowed */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Most Borrowed Books</h2>
            </div>
            <div className="space-y-3">
              {mostBorrowedData?.data && mostBorrowedData.data.length > 0 ? (
                mostBorrowedData.data.map((b, i) => (
                  <div key={b.bookId} className="flex items-center justify-between text-sm py-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-medium text-slate-800 truncate">{b.title}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 ml-2">
                      {b.borrowCount} loans
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No borrowing data yet</p>
              )}
            </div>
          </div>

          {/* Overdue Member Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h2 className="text-base font-bold text-slate-900">Overdue Follow-ups</h2>
              </div>
              <Link
                to="/loans/overdue"
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                View
              </Link>
            </div>
            <div className="space-y-3">
              {overdueMembersData?.data && overdueMembersData.data.length > 0 ? (
                overdueMembersData.data.slice(0, 4).map((m) => (
                  <div
                    key={m.memberId}
                    className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{m.fullName}</p>
                      <p className="text-slate-500">{m.email}</p>
                    </div>
                    <Badge variant="danger" size="sm">
                      {m.overdueLoansCount} Overdue
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-emerald-600 py-4 text-center">
                  All loans are currently within due dates.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
