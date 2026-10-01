import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { loanApi } from '../../services/api';
import { Loan } from '../../types';
import { ReturnBookModal } from './ReturnBookModal';
import { Pagination } from '../../components/Common/Pagination';
import { Badge } from '../../components/Common/Badge';
import { ClockAlert, Mail, Phone } from 'lucide-react';

export const OverdueLoans: React.FC = () => {
  const [page, setPage] = useState(0);
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

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ClockAlert className="w-7 h-7 text-rose-500" />
          Overdue Loans Monitor
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review overdue materials, calculate accrued penalty fines, and initiate returns
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center items-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mr-3" />
            Scanning overdue records...
          </div>
        ) : overdueData?.data?.content && overdueData.data.content.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-rose-50/50 text-xs font-semibold uppercase tracking-wider text-rose-900 border-b border-rose-100">
                <tr>
                  <th className="px-6 py-3.5">Book Title</th>
                  <th className="px-6 py-3.5">Borrower Contact</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5 text-center">Overdue Duration</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdueData.data.content.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{loan.book?.title}</p>
                      <p className="text-xs text-slate-400">ISBN: {loan.book?.isbn}</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{loan.member?.fullName}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {loan.member?.email}
                        </span>
                        {loan.member?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {loan.member?.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-rose-600 text-xs">
                        {new Date(loan.dueDate).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <Badge variant="danger" size="md">
                        {loan.daysOverdue} Days Late
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleReturn(loan)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                      >
                        Process Return
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {overdueData?.data && (
              <Pagination
                currentPage={overdueData.data.page}
                totalPages={overdueData.data.totalPages}
                totalElements={overdueData.data.totalElements}
                pageSize={overdueData.data.size}
                onPageChange={(p) => setPage(p)}
              />
            )}
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
