import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { loanApi } from '../../services/api';
import { Loan, LoanStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Pagination } from '../../components/Common/Pagination';
import { Badge } from '../../components/Common/Badge';
import { IssueBookModal } from './IssueBookModal';
import { ReturnBookModal } from './ReturnBookModal';
import { ConfirmDialog } from '../../components/Common/ConfirmDialog';
import {
  ArrowRightLeft,
  Plus,
  RefreshCw,
  XCircle,
  HelpCircle,
} from 'lucide-react';

export const ActiveLoans: React.FC = () => {
  const { hasRole } = useAuth();
  const { success, error } = useToast();

  const [selectedStatus, setSelectedStatus] = useState<LoanStatus | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // Actions confirmation
  const [confirmAction, setConfirmAction] = useState<{
    type: 'renew' | 'lost' | 'cancel';
    loan: Loan;
  } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const {
    data: loansData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['loans', selectedStatus, page, size],
    queryFn: () =>
      loanApi.search({
        status: selectedStatus,
        page,
        size,
      }),
  });

  const handleReturn = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsReturnModalOpen(true);
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    setIsActionLoading(true);

    try {
      if (confirmAction.type === 'renew') {
        await loanApi.renew(confirmAction.loan.id);
        success('Loan successfully renewed (+14 days)');
      } else if (confirmAction.type === 'lost') {
        await loanApi.markLost(confirmAction.loan.id);
        success('Book marked as lost and inventory updated');
      } else if (confirmAction.type === 'cancel') {
        await loanApi.cancel(confirmAction.loan.id);
        success('Loan cancelled and copy returned to inventory');
      }
      refetch();
      setConfirmAction(null);
    } catch (err: any) {
      error(err.response?.data?.error?.message || 'Operation failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Loans & Circulation</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track book loans, process returns, handle renewals, and record status changes
          </p>
        </div>

        {hasRole(['ADMIN', 'LIBRARIAN']) && (
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Issue Book
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status:</span>
          <select
            value={selectedStatus || ''}
            onChange={(e) => {
              setSelectedStatus(e.target.value ? (e.target.value as LoanStatus) : undefined);
              setPage(0);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Loans (Active & History)</option>
            <option value="ISSUED">Currently Issued</option>
            <option value="OVERDUE">Overdue</option>
            <option value="RETURNED">Returned</option>
            <option value="LOST">Marked Lost</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center items-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mr-3" />
            Loading loan transactions...
          </div>
        ) : loansData?.data?.content && loansData.data.content.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Transaction #</th>
                  <th className="px-6 py-3.5">Book Title</th>
                  <th className="px-6 py-3.5">Borrower</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loansData.data.content.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                        {loan.loanNumber}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 line-clamp-1">{loan.book?.title}</p>
                      <p className="text-xs text-slate-400">ISBN: {loan.book?.isbn}</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{loan.member?.fullName}</p>
                      <p className="text-xs text-slate-400">{loan.member?.membershipNumber}</p>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-semibold text-xs ${loan.overdue ? 'text-rose-600' : 'text-slate-700'}`}>
                          {new Date(loan.dueDate).toLocaleDateString()}
                        </p>
                        {loan.overdue && (
                          <span className="text-[11px] font-bold text-rose-600">
                            ({loan.daysOverdue} days overdue)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          loan.status === 'ISSUED'
                            ? loan.overdue ? 'danger' : 'info'
                            : loan.status === 'RETURNED'
                            ? 'success'
                            : loan.status === 'OVERDUE'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {loan.status === 'ISSUED' && loan.overdue ? 'OVERDUE' : loan.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {hasRole(['ADMIN', 'LIBRARIAN']) && (loan.status === 'ISSUED' || loan.status === 'OVERDUE') && (
                          <>
                            <button
                              onClick={() => handleReturn(loan)}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-colors"
                              title="Process Return"
                            >
                              Return
                            </button>

                            <button
                              onClick={() => setConfirmAction({ type: 'renew', loan })}
                              className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                              title="Renew (+14 days)"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setConfirmAction({ type: 'lost', loan })}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Mark Lost"
                            >
                              <HelpCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {hasRole('ADMIN') && (loan.status === 'ISSUED' || loan.status === 'OVERDUE') && (
                          <button
                            onClick={() => setConfirmAction({ type: 'cancel', loan })}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Cancel Loan"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loansData?.data && (
              <Pagination
                currentPage={loansData.data.page}
                totalPages={loansData.data.totalPages}
                totalElements={loansData.data.totalElements}
                pageSize={loansData.data.size}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 text-sm">
            <ArrowRightLeft className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            No loan transactions recorded.
          </div>
        )}
      </div>

      {/* Modals */}
      <IssueBookModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <ReturnBookModal
        isOpen={isReturnModalOpen}
        loan={selectedLoan}
        onClose={() => {
          setIsReturnModalOpen(false);
          setSelectedLoan(null);
        }}
        onSuccess={() => refetch()}
      />

      {/* Action Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        title={
          confirmAction?.type === 'renew'
            ? 'Renew Book Loan'
            : confirmAction?.type === 'lost'
            ? 'Mark Book as Lost'
            : 'Cancel Loan Record'
        }
        message={
          confirmAction?.type === 'renew'
            ? `Extend loan due date for "${confirmAction?.loan.book?.title}" by an additional 14 days? (Renewals: ${confirmAction?.loan.renewalCount}/2)`
            : confirmAction?.type === 'lost'
            ? `Mark "${confirmAction?.loan.book?.title}" as lost? This will decrease total catalog inventory and apply a replacement fee.`
            : `Cancel this loan issued in error? The book copy will be returned immediately to inventory.`
        }
        isDangerous={confirmAction?.type === 'lost' || confirmAction?.type === 'cancel'}
        confirmLabel={
          confirmAction?.type === 'renew'
            ? 'Renew Loan'
            : confirmAction?.type === 'lost'
            ? 'Mark Lost'
            : 'Cancel Loan'
        }
        isLoading={isActionLoading}
        onConfirm={executeAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};
