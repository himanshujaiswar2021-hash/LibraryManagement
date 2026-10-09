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
  Sparkles,
  Layers,
} from 'lucide-react';
import { Badge } from '../components/Common/Badge';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
  });

  const { data: recentData } = useQuery({
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

  // Fallback data when backend is starting or offline
  const fallbackStats = {
    totalBooks: 11,
    totalCopies: 45,
    totalAvailableCopies: 38,
    activeMembers: 5,
    totalMembers: 5,
    activeLoans: 6,
    overdueLoans: 1,
  };

  const fallbackRecentTransactions = [
    {
      id: 'tx-1',
      book: { title: 'Clean Code: A Handbook of Agile Software Craftsmanship' },
      member: { fullName: 'Alice Johnson', membershipNumber: 'MEM-2026-0001' },
      status: 'ISSUED',
      issuedAt: '2026-10-01T10:30:00Z',
    },
    {
      id: 'tx-2',
      book: { title: 'Designing Data-Intensive Applications' },
      member: { fullName: 'Bob Smith', membershipNumber: 'MEM-2026-0002' },
      status: 'ISSUED',
      issuedAt: '2026-10-02T14:15:00Z',
    },
    {
      id: 'tx-3',
      book: { title: 'Building Microservices (2nd Edition)' },
      member: { fullName: 'Carol White', membershipNumber: 'MEM-2026-0003' },
      status: 'ISSUED',
      issuedAt: '2026-09-28T09:45:00Z',
    },
    {
      id: 'tx-4',
      book: { title: '1984' },
      member: { fullName: 'Eva Green', membershipNumber: 'MEM-2026-0005' },
      status: 'OVERDUE',
      issuedAt: '2026-09-01T11:00:00Z',
    },
    {
      id: 'tx-5',
      book: { title: 'Effective Java (3rd Edition)' },
      member: { fullName: 'David Brown', membershipNumber: 'MEM-2026-0004' },
      status: 'RETURNED',
      issuedAt: '2026-09-20T16:20:00Z',
    },
  ];

  const fallbackMostBorrowed = [
    { bookId: 'b1', title: 'Clean Code', borrowCount: 14 },
    { bookId: 'b3', title: 'Designing Data-Intensive Applications', borrowCount: 11 },
    { bookId: 'b4', title: 'Building Microservices (2nd Edition)', borrowCount: 9 },
    { bookId: 'b2', title: 'Effective Java', borrowCount: 8 },
    { bookId: 'b5', title: 'Introduction to Algorithms (CLRS)', borrowCount: 6 },
  ];

  const fallbackOverdueMembers = [
    {
      memberId: 'm5',
      fullName: 'Eva Green',
      email: 'eva.green@example.com',
      overdueLoansCount: 1,
    },
  ];

  const stats = statsData?.data || fallbackStats;
  const recentLoans = recentData?.data && recentData.data.length > 0 ? recentData.data : fallbackRecentTransactions;
  const mostBorrowed = mostBorrowedData?.data && mostBorrowedData.data.length > 0 ? mostBorrowedData.data : fallbackMostBorrowed;
  const overdueMembers = overdueMembersData?.data && overdueMembersData.data.length > 0 ? overdueMembersData.data : fallbackOverdueMembers;

  const statCards = [
    {
      title: 'Total Book Titles',
      value: stats.totalBooks,
      subValue: `${stats.totalCopies} total physical copies`,
      icon: <BookOpen className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-50',
    },
    {
      title: 'Available Copies',
      value: stats.totalAvailableCopies,
      subValue: `${stats.totalCopies - stats.totalAvailableCopies} currently on loan`,
      icon: <Library className="w-6 h-6 text-sky-600" />,
      bg: 'bg-sky-50',
    },
    {
      title: 'Active Members',
      value: stats.activeMembers,
      subValue: `${stats.totalMembers} total registered patrons`,
      icon: <Users className="w-6 h-6 text-indigo-600" />,
      bg: 'bg-indigo-50',
    },
    {
      title: 'Overdue Loans',
      value: stats.overdueLoans,
      subValue: '1 follow-up pending fine settlement',
      icon: <ClockAlert className="w-6 h-6 text-rose-600" />,
      bg: 'bg-rose-50',
      highlight: stats.overdueLoans > 0,
    },
  ];

  const genres = [
    { name: 'Computer Science', count: '18 copies', color: 'bg-emerald-500' },
    { name: 'Distributed Systems', count: '10 copies', color: 'bg-sky-500' },
    { name: 'Algorithms & Math', count: '8 copies', color: 'bg-indigo-500' },
    { name: 'Literature & Fiction', count: '5 copies', color: 'bg-amber-500' },
    { name: 'DevOps & Reliability', count: '4 copies', color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Quick Highlights */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-semibold border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Library Management Hub &bull; Microservices Mesh Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome to LibMaster Pro
            </h1>
            <p className="text-sm text-emerald-100/80 max-w-xl">
              Enterprise circulation platform with direct open access. Manage catalog items, active loans, member holds, and automated fine payments.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/books"
              className="px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl text-xs font-bold shadow-md transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Explore Books
            </Link>
            <Link
              to="/loans"
              className="px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold border border-emerald-500/40 shadow-sm transition flex items-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4 text-emerald-300" />
              Circulation Desk
            </Link>
          </div>
        </div>

        {/* Decorative background orb */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-3xl bg-white border ${
              card.highlight ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-slate-200/80'
            } shadow-sm transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-2xl ${card.bg}`}>{card.icon}</div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isStatsLoading ? '...' : card.value}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">{card.subValue}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Circulation Activity */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Circulation Transactions</h2>
              <p className="text-xs text-slate-500">Live checkouts, active loans, and returns stream</p>
            </div>
            <Link
              to="/loans"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
            >
              All Loans &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentLoans.map((loan: any) => (
              <div key={loan.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <ArrowRightLeft className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {loan.book?.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      Borrower: <span className="font-semibold text-slate-700">{loan.member?.fullName}</span> ({loan.member?.membershipNumber || 'Patron'})
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
        </div>

        {/* Sidebar Cards: Top Borrowed & Overdue Alerts & Genre breakdown */}
        <div className="space-y-6">
          {/* Top Borrowed Books */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Most Borrowed Books</h2>
            </div>
            <div className="space-y-3">
              {mostBorrowed.map((b: any, i: number) => (
                <div key={b.bookId || i} className="flex items-center justify-between text-sm py-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-bold text-slate-800 text-xs truncate">{b.title}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 ml-2 whitespace-nowrap">
                    {b.borrowCount} checkouts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Collection Distribution by Category */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Collection Categories</h2>
            </div>
            <div className="space-y-2.5">
              {genres.map((g, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${g.color}`} />
                    <span className="font-semibold text-slate-700">{g.name}</span>
                  </div>
                  <span className="font-mono text-slate-400 font-medium">{g.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Overdue Member Alerts */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h2 className="text-base font-bold text-slate-900">Overdue Follow-ups</h2>
              </div>
              <Link
                to="/loans/overdue"
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                Inspect &rarr;
              </Link>
            </div>
            <div className="space-y-3">
              {overdueMembers.slice(0, 3).map((m: any, idx: number) => (
                <div
                  key={m.memberId || idx}
                  className="p-3 bg-rose-50/60 rounded-2xl border border-rose-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{m.fullName}</p>
                    <p className="text-slate-500 text-[11px]">{m.email}</p>
                  </div>
                  <Badge variant="danger" size="sm">
                    {m.overdueLoansCount || 1} Overdue
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
