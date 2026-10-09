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
  RotateCcw,
} from 'lucide-react';

const fallbackLoans: Loan[] = [
  {
    id: 'e1111111-1111-1111-1111-111111111111',
    loanNumber: 'TXN-2026-0001',
    book: {
      id: 'b1111111-1111-1111-1111-111111111111',
      isbn: '978-0132350884',
      title: 'Clean Code',
      language: 'English',
      totalCopies: 5,
      availableCopies: 4,
      borrowedCopies: 1,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    member: {
      id: 'd1111111-1111-1111-1111-111111111111',
      membershipNumber: 'MEM-2026-0001',
      firstName: 'Alice',
      lastName: 'Reader',
      fullName: 'Alice Reader',
      email: 'alice.reader@example.com',
      status: 'ACTIVE',
      maxLoans: 5,
      activeLoansCount: 2,
      registrationDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    issuedById: 'u1',
    issuedByUsername: 'librarian',
    issueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ISSUED',
    renewalCount: 0,
    fineAmount: 0,
    notes: 'Standard 14-day loan',
    overdue: false,
    daysOverdue: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e2222222-2222-2222-2222-222222222222',
    loanNumber: 'TXN-2026-0002',
    book: {
      id: 'b3333333-3333-3333-3333-333333333333',
      isbn: '978-0321125217',
      title: 'Domain-Driven Design',
      language: 'English',
      totalCopies: 3,
      availableCopies: 1,
      borrowedCopies: 2,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    member: {
      id: 'd2222222-2222-2222-2222-222222222222',
      membershipNumber: 'MEM-2026-0002',
      firstName: 'Bob',
      lastName: 'Smith',
      fullName: 'Bob Smith',
      email: 'bob.smith@example.com',
      status: 'ACTIVE',
      maxLoans: 5,
      activeLoansCount: 1,
      registrationDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    issuedById: 'u1',
    issuedByUsername: 'librarian',
    issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ISSUED',
    renewalCount: 0,
    fineAmount: 0,
    notes: 'Architectural research loan',
    overdue: false,
    daysOverdue: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e3333333-3333-3333-3333-333333333333',
    loanNumber: 'TXN-2026-0003',
    book: {
      id: 'b4444444-4444-4444-4444-444444444444',
      isbn: '978-1449373320',
      title: 'Designing Data-Intensive Applications',
      language: 'English',
      totalCopies: 5,
      availableCopies: 3,
      borrowedCopies: 2,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    member: {
      id: 'd4444444-4444-4444-4444-444444444444',
      membershipNumber: 'MEM-2026-0004',
      firstName: 'Diana',
      lastName: 'Prince',
      fullName: 'Diana Prince',
      email: 'diana.prince@example.com',
      status: 'ACTIVE',
      maxLoans: 5,
      activeLoansCount: 1,
      registrationDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    issuedById: 'u1',
    issuedByUsername: 'librarian',
    issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ISSUED',
    renewalCount: 1,
    fineAmount: 0,
    notes: 'Extended renewal granted',
    overdue: false,
    daysOverdue: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e4444444-4444-4444-4444-444444444444',
    loanNumber: 'TXN-2026-0004',
    book: {
      id: 'b6666666-6666-6666-6666-666666666666',
      isbn: '978-1492043454',
      title: 'Building Microservices',
      language: 'English',
      totalCopies: 3,
      availableCopies: 0,
      borrowedCopies: 3,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    member: {
      id: 'd5555555-5555-5555-5555-555555555555',
      membershipNumber: 'MEM-2026-0005',
      firstName: 'Evan',
      lastName: 'Wright',
      fullName: 'Evan Wright',
      email: 'evan.wright@example.com',
      status: 'ACTIVE',
      maxLoans: 5,
      activeLoansCount: 1,
      registrationDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    issuedById: 'u1',
    issuedByUsername: 'librarian',
    issueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ISSUED',
    renewalCount: 0,
    fineAmount: 0,
    notes: 'Microservices study group',
    overdue: false,
    daysOverdue: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e5555555-5555-5555-5555-555555555555',
    loanNumber: 'TXN-2026-0005',
    book: {
      id: 'b0000000-0000-0000-0000-000000000001',
      isbn: '978-0451524935',
      title: '1984',
      language: 'English',
      totalCopies: 2,
      availableCopies: 0,
      borrowedCopies: 2,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    member: {
      id: 'd3333333-3333-3333-3333-333333333333',
      membershipNumber: 'MEM-2026-0003',
      firstName: 'Charlie',
      lastName: 'Brown',
      fullName: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      status: 'SUSPENDED',
      maxLoans: 3,
      activeLoansCount: 1,
      registrationDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    issuedById: 'u1',
    issuedByUsername: 'librarian',
    issueDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'OVERDUE',
    renewalCount: 0,
    fineAmount: 3.0,
    notes: '3 days overdue, fine accruing',
    overdue: true,
    daysOverdue: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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

  const displayLoans = (loansData?.data?.content ?? fallbackLoans).filter((l) => !selectedStatus || l.status === selectedStatus);

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
        {isLoading && !displayLoans.length ? (
          <div className="py-20 flex justify-center items-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mr-3" />
            Loading loan transactions...
          </div>
        ) : displayLoans.length > 0 ? (
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
                {displayLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                        {loan.loanNumber}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 line-clamp-1">{loan.book?.title}</p>
                      <p className="text-xs text-slate-400 font-mono">ISBN: {loan.book?.isbn}</p>
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
                            ? 'info'
                            : loan.status === 'OVERDUE'
                            ? 'danger'
                            : loan.status === 'RETURNED'
                            ? 'success'
                            : 'neutral'
                        }
                      >
                        {loan.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {(loan.status === 'ISSUED' || loan.status === 'OVERDUE') && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleReturn(loan)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Return Book
                          </button>

                          <button
                            onClick={() => setConfirmAction({ type: 'renew', loan })}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-1"
                            title="Renew loan (+14 days)"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Renew
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <ArrowRightLeft className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900">No active loans</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              There are currently no active book checkouts matching your filter.
            </p>
          </div>
        )}

        {loansData?.data && (
          <Pagination
            currentPage={loansData.data.page}
            totalPages={loansData.data.totalPages}
            totalElements={loansData.data.totalElements}
            pageSize={size}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>

      {/* Modal Dialogs */}
      {isIssueModalOpen && (
        <IssueBookModal
          isOpen={isIssueModalOpen}
          onClose={() => setIsIssueModalOpen(false)}
          onSuccess={() => {
            refetch();
            setIsIssueModalOpen(false);
          }}
        />
      )}

      {isReturnModalOpen && selectedLoan && (
        <ReturnBookModal
          isOpen={isReturnModalOpen}
          onClose={() => {
            setIsReturnModalOpen(false);
            setSelectedLoan(null);
          }}
          loan={selectedLoan}
          onSuccess={() => {
            refetch();
            setIsReturnModalOpen(false);
            setSelectedLoan(null);
          }}
        />
      )}

      {confirmAction && (
        <ConfirmDialog
          isOpen={!!confirmAction}
          onCancel={() => setConfirmAction(null)}
          onConfirm={executeAction}
          isLoading={isActionLoading}
          title={
            confirmAction.type === 'renew'
              ? 'Renew Book Loan'
              : confirmAction.type === 'lost'
              ? 'Mark Book as Lost'
              : 'Cancel Loan'
          }
          message={`Are you sure you want to ${confirmAction.type} loan ${confirmAction.loan.loanNumber} for "${confirmAction.loan.book?.title}"?`}
          isDangerous={confirmAction.type !== 'renew'}
        />
      )}
    </div>
  );
};
export default ActiveLoans;
