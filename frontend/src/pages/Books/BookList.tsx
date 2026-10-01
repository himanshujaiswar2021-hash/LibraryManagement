import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { bookApi, categoryApi } from '../../services/api';
import { Book, BookStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { BookFormModal } from './BookFormModal';
import { Pagination } from '../../components/Common/Pagination';
import { Badge } from '../../components/Common/Badge';
import {
  Search,
  Plus,
  BookOpen,
  Edit2,
  Clock,
  Library,
} from 'lucide-react';

export const BookList: React.FC = () => {
  const { hasRole } = useAuth();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [availableOnly, setAvailableOnly] = useState<boolean | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<BookStatus | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
  });

  const {
    data: booksData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['books', searchTerm, selectedCategory, availableOnly, selectedStatus, page, size],
    queryFn: () =>
      bookApi.search({
        search: searchTerm || undefined,
        categoryId: selectedCategory || undefined,
        availableOnly,
        status: selectedStatus,
        page,
        size,
        sort: 'title,asc',
      }),
  });

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  const handleStatusToggle = async (book: Book) => {
    const nextStatus: BookStatus = book.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
    try {
      await bookApi.updateStatus(book.id, nextStatus);
      success(`Book status set to ${nextStatus}`);
      refetch();
    } catch (err: any) {
      error(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Book Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, search, and manage books in the library inventory
          </p>
        </div>

        {hasRole(['ADMIN', 'LIBRARIAN']) && (
          <button
            onClick={() => {
              setEditingBook(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Book
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            placeholder="Search by title, ISBN, author, publisher..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Categories</option>
            {categoriesData?.data?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={availableOnly === undefined ? '' : String(availableOnly)}
            onChange={(e) => {
              const val = e.target.value;
              setAvailableOnly(val === '' ? undefined : val === 'true');
              setPage(0);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Availability</option>
            <option value="true">Available Now</option>
            <option value="false">Fully Borrowed</option>
          </select>

          <select
            value={selectedStatus || ''}
            onChange={(e) => {
              setSelectedStatus(e.target.value ? (e.target.value as BookStatus) : undefined);
              setPage(0);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>
      </div>

      {/* Book Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center items-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mr-3" />
            Loading catalog books...
          </div>
        ) : booksData?.data?.content && booksData.data.content.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Book Details</th>
                  <th className="px-6 py-3.5">Authors & Category</th>
                  <th className="px-6 py-3.5 text-center">Availability</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {booksData.data.content.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200">
                          {book.coverImageUrl ? (
                            <img
                              src={book.coverImageUrl}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <Link
                            to={`/books/${book.id}`}
                            className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors line-clamp-1"
                          >
                            {book.title}
                          </Link>
                          <p className="text-xs text-slate-400">ISBN: {book.isbn}</p>
                          {book.shelfLocation && (
                            <span className="inline-block text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5">
                              {book.shelfLocation}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-700">
                          {book.authors?.map((a) => a.name).join(', ') || 'Unknown Author'}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {book.categories?.map((cat) => (
                            <Badge key={cat.id} variant="neutral" size="sm">
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-bold text-slate-900 text-sm">
                          {book.availableCopies} / {book.totalCopies}
                        </span>
                        <span className="text-[11px] text-slate-400">copies available</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
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
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/books/${book.id}`}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Library className="w-4 h-4" />
                        </Link>

                        {hasRole(['ADMIN', 'LIBRARIAN']) && (
                          <>
                            <button
                              onClick={() => handleEdit(book)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit Book"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusToggle(book)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title={book.status === 'ACTIVE' ? 'Set Maintenance' : 'Activate'}
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {booksData?.data && (
              <Pagination
                currentPage={booksData.data.page}
                totalPages={booksData.data.totalPages}
                totalElements={booksData.data.totalElements}
                pageSize={booksData.data.size}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 text-sm">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            No books found matching criteria.
          </div>
        )}
      </div>

      {/* Book Form Modal */}
      <BookFormModal
        isOpen={isModalOpen}
        bookToEdit={editingBook}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
