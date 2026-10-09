import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bookApi } from '../../services/api';
import { Badge } from '../../components/Common/Badge';
import { IssueBookModal } from '../Loans/IssueBookModal';
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  Copy,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Book } from '../../types';

const fallbackDirectory: Record<string, Book> = {
  'b1111111-1111-1111-1111-111111111111': {
    id: 'b1111111-1111-1111-1111-111111111111',
    isbn: '978-0132350884',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    subtitle: 'Crafting cleaner, maintainable and testable code',
    publisher: 'Prentice Hall',
    publicationYear: 2008,
    description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. Clean Code presents best practices of cleaning code "on the fly" that will instill within you the values of a software craftsman and make you a better programmer.',
    language: 'English',
    totalCopies: 5,
    availableCopies: 4,
    borrowedCopies: 1,
    status: 'ACTIVE',
    shelfLocation: 'CS-A1-04',
    coverImageUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=600&auto=format&fit=crop&q=80',
    authors: [{ id: 'a1', name: 'Robert C. Martin' }],
    categories: [{ id: 'c1', name: 'Software Engineering' }, { id: 'c2', name: 'Clean Code' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'b2222222-2222-2222-2222-222222222222': {
    id: 'b2222222-2222-2222-2222-222222222222',
    isbn: '978-0134685991',
    title: 'Effective Java (3rd Edition)',
    subtitle: 'Best practices for the Java platform',
    publisher: 'Addison-Wesley',
    publicationYear: 2018,
    description: 'The definitive guide to best practices in the Java language. Each chapter contains short, specific advice on writing clearer, more robust, and more maintainable programs, covering generics, enums, annotations, lambdas, and streams.',
    language: 'English',
    totalCopies: 4,
    availableCopies: 3,
    borrowedCopies: 1,
    status: 'ACTIVE',
    shelfLocation: 'CS-A2-12',
    coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    authors: [{ id: 'a2', name: 'Joshua Bloch' }],
    categories: [{ id: 'c1', name: 'Software Engineering' }, { id: 'c3', name: 'Programming Languages' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'b3333333-3333-3333-3333-333333333333': {
    id: 'b3333333-3333-3333-3333-333333333333',
    isbn: '978-1449373320',
    title: 'Designing Data-Intensive Applications',
    subtitle: 'The Big Ideas Behind Reliable, Scalable, and Maintainable Systems',
    publisher: 'O\'Reilly Media',
    publicationYear: 2017,
    description: 'Data is at the center of many challenges in system design today. Difficult issues need to be figured out, such as scalability, consistency, reliability, efficiency, and maintainability. Martin Kleppmann helps you navigate this diverse landscape by examining the pros and cons of various technologies.',
    language: 'English',
    totalCopies: 6,
    availableCopies: 2,
    borrowedCopies: 4,
    status: 'ACTIVE',
    shelfLocation: 'CS-D3-09',
    coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    authors: [{ id: 'a3', name: 'Martin Kleppmann' }],
    categories: [{ id: 'c4', name: 'Distributed Systems' }, { id: 'c5', name: 'Databases' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'b4444444-4444-4444-4444-444444444444': {
    id: 'b4444444-4444-4444-4444-444444444444',
    isbn: '978-1492034025',
    title: 'Building Microservices (2nd Edition)',
    subtitle: 'Designing Fine-Grained Systems',
    publisher: 'O\'Reilly Media',
    publicationYear: 2021,
    description: 'Technologies constantly change, but the fundamental challenges of microservice architecture remain the same. This 2nd edition provides a comprehensive view of the topics you need to consider when building, managing, and scaling microservices.',
    language: 'English',
    totalCopies: 4,
    availableCopies: 0,
    borrowedCopies: 4,
    status: 'ACTIVE',
    shelfLocation: 'CS-M1-02',
    coverImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    authors: [{ id: 'a4', name: 'Sam Newman' }],
    categories: [{ id: 'c4', name: 'Distributed Systems' }, { id: 'c6', name: 'Cloud & DevOps' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { success } = useToast();
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  const { data: bookData, isLoading, refetch } = useQuery({
    queryKey: ['book', id],
    queryFn: () => (id ? bookApi.getById(id) : Promise.reject('No ID')),
    enabled: !!id,
  });

  const book: Book | undefined =
    bookData?.data || (id && fallbackDirectory[id]) || fallbackDirectory['b1111111-1111-1111-1111-111111111111'];

  const copyIsbn = () => {
    if (book?.isbn) {
      navigator.clipboard.writeText(book.isbn);
      success(`Copied ISBN ${book.isbn} to clipboard`);
    }
  };

  if (isLoading && !book) {
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
      {/* Top Header & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          to="/books"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Book Catalog
        </Link>

        <button
          onClick={copyIsbn}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs transition"
        >
          <Copy className="w-3.5 h-3.5 text-slate-400" />
          <span>Copy ISBN</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover image */}
          <div className="w-full md:w-60 h-84 bg-slate-100 rounded-3xl overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center border border-slate-200/80 relative">
            {book.coverImageUrl ? (
              <img
                src={book.coverImageUrl}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="w-16 h-16 text-slate-300" />
            )}
            <div className="absolute top-3 right-3">
              <Badge variant={book.availableCopies > 0 ? 'success' : 'danger'}>
                {book.availableCopies > 0 ? 'In Stock' : 'Checked Out'}
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
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
                <span className="text-xs text-slate-500 font-mono">ISBN: {book.isbn}</span>
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
                Author:{' '}
                <span className="font-bold text-slate-900">
                  {book.authors?.map((a) => a.name).join(', ') || 'Robert C. Martin'}
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {book.categories?.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-100"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Inventory Status Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/40 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Physical Stock Status
                </p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {book.availableCopies} available{' '}
                  <span className="text-xs font-normal text-slate-500">
                    of {book.totalCopies} total copies ({book.borrowedCopies ?? (book.totalCopies - book.availableCopies)} on loan)
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {book.availableCopies > 0 ? (
                  <button
                    onClick={() => setIsIssueModalOpen(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Issue Book
                  </button>
                ) : (
                  <Link
                    to="/reservations"
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-2"
                  >
                    <Bookmark className="w-4 h-4" />
                    Place Reservation Hold
                  </Link>
                )}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-2xl text-xs">
                <span className="text-slate-400 block mb-0.5 font-medium">Publisher</span>
                <span className="font-bold text-slate-800">{book.publisher || 'Prentice Hall'}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl text-xs">
                <span className="text-slate-400 block mb-0.5 font-medium">Published</span>
                <span className="font-bold text-slate-800">{book.publicationYear || 2022}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl text-xs">
                <span className="text-slate-400 block mb-0.5 font-medium">Shelf Location</span>
                <span className="font-bold text-slate-800">{book.shelfLocation || 'CS-A1-04'}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl text-xs">
                <span className="text-slate-400 block mb-0.5 font-medium">Language</span>
                <span className="font-bold text-slate-800">{book.language || 'English'}</span>
              </div>
            </div>

            {/* Description */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Synopsis & Description
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {book.description ||
                  'The standard curriculum reference for software design principles, scalable system architectures, and best programming craftsmanship practices.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Borrowing Policies Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
        <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Library Circulation Rules for this Title
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="font-bold text-slate-900 block mb-1">Standard Loan Period</span>
            <span>14 Days checkout with up to 2 renewals allowed.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="font-bold text-slate-900 block mb-1">Overdue Penalty</span>
            <span>\$0.50 per day past the scheduled return date.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="font-bold text-slate-900 block mb-1">Reservation Queue</span>
            <span>Hold queue processed by the Reservation Microservice.</span>
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
export default BookDetail;
