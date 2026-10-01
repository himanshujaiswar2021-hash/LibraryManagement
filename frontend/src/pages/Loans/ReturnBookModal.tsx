import React, { useState } from 'react';
import { Loan } from '../../types';
import { loanApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, AlertTriangle } from 'lucide-react';

interface ReturnBookModalProps {
  isOpen: boolean;
  loan: Loan | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReturnBookModal: React.FC<ReturnBookModalProps> = ({
  isOpen,
  loan,
  onClose,
  onSuccess,
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  if (!isOpen || !loan) return null;

  const isOverdue = loan.overdue;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await loanApi.return(loan.id, notes);
      if (res.data.fineAmount > 0) {
        success(`Book returned. An overdue fine of $${res.data.fineAmount.toFixed(2)} was applied.`);
      } else {
        success('Book successfully returned and restocked in catalog');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.response?.data?.error?.message || 'Failed to process return');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <h3 className="text-xl font-bold text-slate-900">Process Return</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm space-y-1">
            <p className="font-bold text-slate-900">{loan.book?.title}</p>
            <p className="text-xs text-slate-500">
              Borrower: <strong className="text-slate-700">{loan.member?.fullName}</strong> ({loan.member?.membershipNumber})
            </p>
            <p className="text-xs text-slate-500">
              Due Date: <strong className="text-slate-700">{new Date(loan.dueDate).toLocaleDateString()}</strong>
            </p>
          </div>

          {isOverdue && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Item is {loan.daysOverdue} days overdue!</p>
                <p className="mt-0.5">Late return fine will automatically be calculated and applied upon return confirmation.</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Condition & Return Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Good condition, spine intact..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-md shadow-emerald-600/20"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Confirm Return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
