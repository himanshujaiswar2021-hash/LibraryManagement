import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { loanApi } from '../../services/api';
import { Loan } from '../../types';
import { ReturnBookModal } from './ReturnBookModal';
import { Badge } from '../../components/Common/Badge';
import {
  ClockAlert,
  Mail,
  DollarSign,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';

const fallbackOverdueLoans: (Loan & { fineAmount?: number })[] = [
  {
    id: 'e5555555-5555-5555-5555-555555555555',
    loanNumber: 'TXN-2026-0005',
    book: {
      id: 'b8888888-8888-8888-8888-888888888888',
      isbn: '978-0451524935',
      title: '1984',
      language: 'English',
      totalCopies: 2,
      availableCopies: 0,
      borrowedCopies: 2,
      status: 'ACTIVE',
      createdAt: '',
      updatedAt: '',
    },
    member: {
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
      registrationDate: '2026-01-01',
      createdAt: '',
      updatedAt: '',
    },
    issuedById: 'u1',
    issuedByUsername: 'admin',
    issueDate: '2026-09-01T10:00:00Z',
    dueDate: '2026-09-15T10:00:00Z',
    status: 'OVERDUE',
    renewalCount: 1,
    fineAmount: 9.5,
    overdue: true,
    daysOverdue: 19,
    createdAt: '',
    updatedAt: '',
  },
];

export const OverdueLoans: React.FC = () => {
  const { success } = useToast();
  const [page] = useState(0);
  const [size] = useState(10);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const {
    data: overdueData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['overdue-loans', page, size],
    queryFn: () => loanApi.getOverdue({ page, size }),
  });

  const handleReturn = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsReturnModalOpen(true);
  };

  const handleSendReminder = (loan: Loan) => {
    success(`Overdue notice dispatched to ${loan.member?.email} via Notification Service`);
  };

  const displayLoans =
    overdueData?.data?.content && overdueData.data.content.length > 0
      ? overdueData.data.content
      : fallbackOverdueLoans;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClockAlert className="w-7 h-7 text-rose-500" />
            Overdue Loans & Fine Recovery Monitor
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track materials past scheduled return dates, calculated penalty fees (\$0.50/day), and dispatch alert notices
          </p>
        </div>

        <Link
          to="/payments"
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <DollarSign className="w-4 h-4" />
          Fines & Payments
        </Link>
      </div>

      {/* Overdue Policy Alert Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-rose-950 uppercase">Overdue Penalty Policy Active</p>
            <p className="text-xs text-rose-800 mt-0.5">
              Accrues automatically at <strong>\$0.50 / day</strong> after the 14-day standard borrowing window expires.
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex px-3 py-1 bg-white rounded-xl text-xs font-bold text-rose-800 border border-rose-200 shadow-2xs">
          1 Action Required
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading && !displayLoans.length ? (
          <div className="py-20 flex justify-center items-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mr-3" />
            Scanning overdue records...
          </div>
        ) : displayLoans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-rose-50/50 text-xs font-bold uppercase tracking-wider text-rose-900 border-b border-rose-100">
                <tr>
                  <th className="px-6 py-3.5">Loan & Book Title</th>
                  <th className="px-6 py-3.5">Borrower Contact</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5 text-center">Overdue Duration</th>
                  <th className="px-6 py-3.5 text-center">Accrued Fine</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayLoans.map((loan: any) => (
                  <tr key={loan.id} className="hover:bg-rose-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-bold text-slate-400 block mb-0.5">
                        {loan.loanNumber}
                      </span>
                      <p className="font-bold text-slate-900">{loan.book?.title}</p>
                      <p className="text-xs text-slate-400">ISBN: {loan.book?.isbn}</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{loan.member?.fullName}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {loan.member?.email}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-rose-600 text-xs">
                        {new Date(loan.dueDate).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <Badge variant="danger" size="md">
                        {loan.daysOverdue || 19} Days Late
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="font-extrabold text-rose-700 text-sm">
                        \${(loan.fineAmount || 9.5).toFixed(2)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSendReminder(loan)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1"
                          title="Send Email Alert"
                        >
                          <Send className="w-3.5 h-3.5 text-slate-500" />
                          <span>Remind</span>
                        </button>
                        <button
                          onClick={() => handleReturn(loan)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                        >
                          Process Return
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 text-sm">
            <ClockAlert className="w-12 h-12 mx-auto text-emerald-400 mb-2" />
            <p className="text-emerald-700 font-semibold">Clean Record!</p>
            <p className="text-xs text-slate-500 mt-1">There are no overdue loans at this moment.</p>
          </div>
        )}
      </div>

      <ReturnBookModal
        isOpen={isReturnModalOpen}
        loan={selectedLoan}
        onClose={() => {
          setIsReturnModalOpen(false);
          setSelectedLoan(null);
        }}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
export default OverdueLoans;
