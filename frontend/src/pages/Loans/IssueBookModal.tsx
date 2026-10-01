import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Book } from '../../types';
import { bookApi, memberApi, loanApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, CheckCircle2 } from 'lucide-react';

interface IssueBookModalProps {
  isOpen: boolean;
  initialBook?: Book | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const IssueBookModal: React.FC<IssueBookModalProps> = ({
  isOpen,
  initialBook,
  onClose,
  onSuccess,
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [memberSearch, setMemberSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [dueDateDays, setDueDateDays] = useState<number>(14);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    if (initialBook) {
      setSelectedBookId(initialBook.id);
    }
  }, [initialBook, isOpen]);

  const { data: membersData } = useQuery({
    queryKey: ['members-search-issue', memberSearch],
    queryFn: () => memberApi.search({ search: memberSearch, status: 'ACTIVE', size: 10 }),
    enabled: isOpen,
  });

  const { data: booksData } = useQuery({
    queryKey: ['books-search-issue', bookSearch],
    queryFn: () => bookApi.search({ search: bookSearch, availableOnly: true, status: 'ACTIVE', size: 10 }),
    enabled: isOpen && !initialBook,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !selectedMemberId) {
      error('Please select both a book and a member');
      return;
    }

    setIsSubmitting(true);
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + dueDateDays);

      await loanApi.issue({
        bookId: selectedBookId,
        memberId: selectedMemberId,
        dueDate: dueDate.toISOString(),
        notes: notes || undefined,
      });

      success('Book successfully issued to member');
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.response?.data?.error?.message || 'Failed to issue book');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <h3 className="text-xl font-bold text-slate-900">Issue Book (Checkout)</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Book Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Select Book <span className="text-rose-500">*</span>
            </label>
            {initialBook ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-emerald-950 text-sm">{initialBook.title}</p>
                  <p className="text-xs text-emerald-700">ISBN: {initialBook.isbn} ({initialBook.availableCopies} available)</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Type book title or ISBN to filter..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <select
                  required
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">-- Choose a book copy --</option>
                  {booksData?.data?.content?.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.availableCopies} available) - ISBN {b.isbn}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Member Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Select Member Patron <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search member by name, number, or email..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <select
                required
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">-- Choose registered member --</option>
                {membersData?.data?.content?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.membershipNumber}) - {m.activeLoansCount}/{m.maxLoans} active loans
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loan Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Loan Duration
              </label>
              <select
                value={dueDateDays}
                onChange={(e) => setDueDateDays(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value={7}>7 Days (1 Week)</option>
                <option value={14}>14 Days (2 Weeks - Standard)</option>
                <option value={21}>21 Days (3 Weeks)</option>
                <option value={30}>30 Days (1 Month)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Good condition, barcode scanned..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
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
              disabled={isSubmitting || !selectedBookId || !selectedMemberId}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-md shadow-emerald-600/20"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Complete Checkout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
