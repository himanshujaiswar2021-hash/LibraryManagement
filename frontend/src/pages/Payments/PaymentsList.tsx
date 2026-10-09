import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentApi } from '../../services/api';
import { Fine, PaymentTransaction, PaymentStats } from '../../types';
import {
  DollarSign,
  AlertTriangle,
  ShieldCheck,
  Search,
  Receipt,
  Printer,
  X,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/Common/Badge';

const fallbackFines: Fine[] = [
  {
    id: 'f1',
    loanId: 'e5555555-5555-5555-5555-555555555555',
    loanNumber: 'TXN-2026-0005',
    bookId: 'b8888888-8888-8888-8888-888888888888',
    bookTitle: '1984',
    memberId: 'd5555555-5555-5555-5555-555555555555',
    memberName: 'Eva Green',
    overdueDays: 19,
    amount: 9.5,
    paidAmount: 0.0,
    remainingAmount: 9.5,
    status: 'UNPAID',
    notes: 'Overdue daily penalty (19 days @ $0.50/day)',
    createdAt: '2026-09-16T10:00:00Z',
  },
  {
    id: 'f2',
    loanId: 'e1111111-1111-1111-1111-111111111111',
    loanNumber: 'TXN-2026-0001',
    bookId: 'b1111111-1111-1111-1111-111111111111',
    bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    memberId: 'd1111111-1111-1111-1111-111111111111',
    memberName: 'Alice Johnson',
    overdueDays: 4,
    amount: 2.0,
    paidAmount: 2.0,
    remainingAmount: 0.0,
    status: 'PAID',
    notes: 'Late return renewal fee (settled)',
    createdAt: '2026-09-20T14:00:00Z',
    paidAt: '2026-09-20T14:05:00Z',
  },
  {
    id: 'f3',
    loanId: 'e4444444-4444-4444-4444-444444444444',
    loanNumber: 'TXN-2026-0004',
    bookId: 'b4444444-4444-4444-4444-444444444444',
    bookTitle: 'Building Microservices (2nd Edition)',
    memberId: 'd4444444-4444-4444-4444-444444444444',
    memberName: 'David Brown',
    overdueDays: 3,
    amount: 1.5,
    paidAmount: 0.0,
    remainingAmount: 0.0,
    status: 'WAIVED',
    notes: 'First-time patron educational grace waiver',
    createdAt: '2026-09-10T11:00:00Z',
  },
];

const fallbackTransactions: PaymentTransaction[] = [
  {
    id: 't1',
    fineId: 'f2',
    memberId: 'd1111111-1111-1111-1111-111111111111',
    amount: 2.0,
    method: 'UPI',
    transactionReference: 'TXN-PAY-2026-9921',
    receiptNumber: 'RCP-2026-0081',
    processedBy: 'admin',
    status: 'SUCCESS',
    createdAt: '2026-09-20T14:05:00Z',
  },
];

const fallbackStats: PaymentStats = {
  totalRevenueCollected: 2.0,
  totalOutstandingFines: 9.5,
  unpaidFinesCount: 1,
  paidFinesCount: 1,
  waivedFinesCount: 1,
};

export const PaymentsList: React.FC = () => {
  const queryClient = useQueryClient();
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState<'fines' | 'transactions'>('fines');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [receiptFine, setReceiptFine] = useState<Fine | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'CASH'>('UPI');
  const [paymentAmount, setPaymentAmount] = useState('');

  const { data: finesData } = useQuery({
    queryKey: ['fines'],
    queryFn: () => paymentApi.getAllFines({ size: 50 }),
  });

  const { data: txnsData } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => paymentApi.getTransactions({ size: 50 }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['paymentStats'],
    queryFn: () => paymentApi.getStats(),
  });

  const payMutation = useMutation({
    mutationFn: (data: { fineId: string; memberId: string; amount: number; method: string }) =>
      paymentApi.processPayment(data.fineId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fines'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['paymentStats'] });
      setShowPayModal(false);
      setSelectedFine(null);
      success('Payment processed successfully. Digital receipt generated.');
    },
  });

  const waiveMutation = useMutation({
    mutationFn: (fineId: string) =>
      paymentApi.waiveFine(fineId, { reason: 'Administrative waiver approved', waivedBy: 'Admin' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fines'] });
      queryClient.invalidateQueries({ queryKey: ['paymentStats'] });
      success('Fine waived successfully.');
    },
  });

  const fines: Fine[] =
    finesData?.data?.content && finesData.data.content.length > 0 ? finesData.data.content : fallbackFines;
  const transactions: PaymentTransaction[] =
    txnsData?.data?.content && txnsData.data.content.length > 0
      ? txnsData.data.content
      : fallbackTransactions;
  const stats: PaymentStats = statsData?.data || fallbackStats;

  const filteredFines = fines.filter(
    (f) =>
      f.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.bookTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.loanNumber?.includes(searchTerm)
  );

  const filteredTxns = transactions.filter(
    (t) =>
      t.transactionReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Fines & Financial Transactions Ledger
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Microservice :8084
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Overdue penalty assessments, instant online settlements (UPI/Card), and printable receipts
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Collected Revenue</p>
            <p className="text-2xl font-extrabold text-emerald-600">
              ${Number(stats.totalRevenueCollected || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Outstanding Dues</p>
            <p className="text-2xl font-extrabold text-rose-600">
              ${Number(stats.totalOutstandingFines || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Unpaid Invoices</p>
            <p className="text-2xl font-extrabold text-amber-600">{stats.unpaidFinesCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Settled Invoices</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.paidFinesCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('fines')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'fines'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Fines & Penalties ({fines.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'transactions'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Settled Transactions ({transactions.length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patron, loan #, or receipt..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Fines Table Tab */}
      {activeTab === 'fines' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Loan / Book</th>
                  <th className="px-6 py-3.5">Patron</th>
                  <th className="px-6 py-3.5">Fine Reason</th>
                  <th className="px-6 py-3.5 text-center">Amount Due</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-bold text-slate-400 block">{fine.loanNumber}</span>
                      <p className="font-bold text-slate-900">{fine.bookTitle}</p>
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-900">{fine.memberName}</td>

                    <td className="px-6 py-4 text-xs text-slate-500">{fine.notes}</td>

                    <td className="px-6 py-4 text-center">
                      <span className="font-extrabold text-slate-900 text-sm">
                        ${Number(fine.amount).toFixed(2)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          fine.status === 'PAID'
                            ? 'success'
                            : fine.status === 'UNPAID'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {fine.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {fine.status === 'UNPAID' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedFine(fine);
                                setPaymentAmount(String(fine.amount));
                                setShowPayModal(true);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-2xs"
                            >
                              Collect Fine
                            </button>
                            <button
                              onClick={() => waiveMutation.mutate(fine.id)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition"
                            >
                              Waive
                            </button>
                          </>
                        )}
                        {fine.status === 'PAID' && (
                          <button
                            onClick={() => setReceiptFine(fine)}
                            className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl text-xs font-bold transition flex items-center gap-1"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            Receipt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions Table Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Receipt #</th>
                  <th className="px-6 py-3.5">Transaction Ref</th>
                  <th className="px-6 py-3.5 text-center">Amount Paid</th>
                  <th className="px-6 py-3.5">Payment Method</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTxns.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-emerald-700">{txn.receiptNumber}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{txn.transactionReference}</td>
                    <td className="px-6 py-4 text-center font-extrabold text-slate-900">
                      ${Number(txn.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                        {txn.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(txn.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant="success">SUCCESS</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Collect Fine Modal */}
      {showPayModal && selectedFine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Settle Overdue Fine
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Collecting payment for loan <strong>{selectedFine.loanNumber}</strong> ({selectedFine.memberName})
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Amount to Collect ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="UPI">Instant UPI Transfer</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="CASH">Cash Counter Payment</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowPayModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  payMutation.mutate({
                    fineId: selectedFine.id,
                    memberId: selectedFine.memberId,
                    amount: parseFloat(paymentAmount) || selectedFine.amount,
                    method: paymentMethod,
                  });
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {receiptFine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">LibMaster Official Receipt</h3>
                <p className="text-xs text-slate-500">Fine Payment Confirmation</p>
              </div>
              <button
                onClick={() => setReceiptFine(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-6 space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-mono font-bold text-slate-900">RCP-2026-0081</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patron:</span>
                <span className="font-bold text-slate-900">{receiptFine.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Book:</span>
                <span className="font-bold text-slate-900">{receiptFine.bookTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reason:</span>
                <span className="text-slate-700">{receiptFine.notes}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900 text-sm">Total Paid:</span>
                <span className="font-extrabold text-emerald-600 text-base">
                  ${Number(receiptFine.paidAmount || receiptFine.amount).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PaymentsList;
