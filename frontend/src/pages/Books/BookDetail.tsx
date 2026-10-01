import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bookApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/Common/Badge';
import { IssueBookModal } from '../Loans/IssueBookModal';
import { ArrowLeft, BookOpen } from 'lucide-react';

export const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  const { data: bookData, isLoading, refetch } = useQuery({
    queryKey: ['book', id],
    queryFn: () => (id ? bookApi.getById(id) : Promise.reject('No ID')),
    enabled: !!id,
  });

  const book = bookData?.data;

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center text-slate-400">
        Loading book details...
      </div>
    );
  }

  if (!book) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-600 font-semibold mb-2">Book Not Found</p>
        <Link to="/books" className="text-sm text-emerald-600 hover:underline">
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Back button */}
      <Link
        to="/books"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Book Catalog
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover image */}
          <div className="w-full md:w-56 h-80 bg-slate-100 rounded-2xl overflow-hidden shadow-md flex-shrink-0 flex items-center justify-center border border-slate-200">
            {book.coverImageUrl ? (
              <img
                src={book.coverImageUrl}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="w-16 h-16 text-slate-300" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge
                variant={
                  book.status === 'ACTIVE'
                    ? 'success'
                    : book.status === 'MAINTENANCE'
                    ? 'warning'
                    : 'danger'
                }
              >
                {book.status}
              </Badge>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>ISBN: <strong className="text-slate-800">{book.isbn}</strong></span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="text-base text-slate-500 mt-1 font-medium">{book.subtitle}</p>
              )}
            </div>

            {/* Author and categories */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                By {book.authors?.map((a) => a.name).join(', ') || 'Unknown Author'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {book.categories?.map((cat) => (
                  <Badge key={cat.id} variant="neutral" size="sm">
                    {cat.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Inventory Status Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Physical Inventory
                </p>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {book.availableCopies} available{' '}
                  <span className="text-xs font-normal text-slate-500">
                    of {book.totalCopies} total copies
                  </span>
                </p>
              </div>

              {hasRole(['ADMIN', 'LIBRARIAN']) && book.availableCopies > 0 && book.status === 'ACTIVE' && (
                <button
                  onClick={() => setIsIssueModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
                >
                  Issue to Member
                </button>
              )}
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {book.publisher && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs">
                  <span className="text-slate-400 block mb-0.5">Publisher</span>
                  <span className="font-semibold text-slate-800">{book.publisher}</span>
                </div>
              )}

              {book.publicationYear && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs">
                  <span className="text-slate-400 block mb-0.5">Year</span>
                  <span className="font-semibold text-slate-800">{book.publicationYear}</span>
                </div>
              )}

              {book.shelfLocation && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs">
                  <span className="text-slate-400 block mb-0.5">Shelf Location</span>
                  <span className="font-semibold text-slate-800">{book.shelfLocation}</span>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl text-xs">
                <span className="text-slate-400 block mb-0.5">Language</span>
                <span className="font-semibold text-slate-800">{book.language}</span>
              </div>
            </div>

            {/* Description */}
            {book.description && (
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  About This Book
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Issue Modal */}
      {book && (
        <IssueBookModal
          isOpen={isIssueModalOpen}
          initialBook={book}
          onClose={() => setIsIssueModalOpen(false)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
};
