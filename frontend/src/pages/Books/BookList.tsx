import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { bookApi, categoryApi } from '../../services/api';
import { Book, BookStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
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
  BookmarkCheck,
  CheckCircle2,
  Sparkles,
  Download,
} from 'lucide-react';

const fallbackBooks: Book[] = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    isbn: '978-0132350884',
    title: 'Clean Code',
    subtitle: 'A Handbook of Agile Software Craftsmanship',
    publisher: 'Prentice Hall',
    publicationYear: 2008,
    description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.',
    language: 'English',
    totalCopies: 5,
    availableCopies: 4,
    borrowedCopies: 1,
    shelfLocation: 'Shelf CS-01',
    coverImageUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd1?w=400',
    status: 'ACTIVE',
    authors: [{ id: 'a1', name: 'Robert C. Martin' }],
    categories: [{ id: 'c1', name: 'Software Engineering' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    isbn: '978-0134685991',
    title: 'Effective Java',
    subtitle: 'Best practices for the Java platform',
    publisher: 'Addison-Wesley',
    publicationYear: 2018,
    description: 'The definitive guide to best practices in modern Java programming.',
    language: 'English',
    totalCopies: 4,
    availableCopies: 4,
    borrowedCopies: 0,
    shelfLocation: 'Shelf CS-02',
    coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    status: 'ACTIVE',
    authors: [{ id: 'a3', name: 'Joshua Bloch' }],
    categories: [{ id: 'c1', name: 'Software Engineering' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b3333333-3333-3333-3333-333333333333',
    isbn: '978-0321125217',
    title: 'Domain-Driven Design',
    subtitle: 'Tackling Complexity in the Heart of Software',
    publisher: 'Addison-Wesley',
    publicationYear: 2003,
    description: 'A systematic approach to domain-driven design for complex systems.',
    language: 'English',
    totalCopies: 3,
    availableCopies: 1,
    borrowedCopies: 2,
    shelfLocation: 'Shelf CS-03',
    coverImageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400',
    status: 'ACTIVE',
    authors: [{ id: 'a4', name: 'Eric Evans' }],
    categories: [{ id: 'c1', name: 'Software Engineering' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b4444444-4444-4444-4444-444444444444',
    isbn: '978-1449373320',
    title: 'Designing Data-Intensive Applications',
    subtitle: 'The Big Ideas Behind Reliable, Scalable, and Maintainable Systems',
    publisher: "O'Reilly Media",
    publicationYear: 2017,
    description: 'The definitive guide to the architecture and internals of modern distributed data systems.',
    language: 'English',
    totalCopies: 5,
    availableCopies: 3,
    borrowedCopies: 2,
    shelfLocation: 'Shelf DS-01',
    coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
    status: 'ACTIVE',
    authors: [{ id: 'a6', name: 'Martin Kleppmann' }],
    categories: [{ id: 'c4', name: 'Distributed Systems & Cloud' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b5555555-5555-5555-5555-555555555555',
    isbn: '978-0135957059',
    title: 'The Pragmatic Programmer',
    subtitle: 'Your Journey to Mastery (20th Anniversary Edition)',
    publisher: 'Addison-Wesley',
    publicationYear: 2019,
    description: 'Timeless wisdom on software craftsmanship, career growth, and engineering discipline.',
    language: 'English',
    totalCopies: 4,
    availableCopies: 4,
    borrowedCopies: 0,
    shelfLocation: 'Shelf CS-04',
    coverImageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
    status: 'ACTIVE',
    authors: [{ id: 'a7', name: 'David Thomas & Andrew Hunt' }],
    categories: [{ id: 'c1', name: 'Software Engineering' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b6666666-6666-6666-6666-666666666666',
    isbn: '978-1492043454',
    title: 'Building Microservices',
    subtitle: 'Designing Fine-Grained Systems (2nd Edition)',
    publisher: "O'Reilly Media",
    publicationYear: 2021,
    description: 'Comprehensive advice on modeling, integrating, testing, and deploying distributed microservices.',
    language: 'English',
    totalCopies: 3,
    availableCopies: 0,
    borrowedCopies: 3,
    shelfLocation: 'Shelf MS-01',
    coverImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
    status: 'ACTIVE',
    authors: [{ id: 'a8', name: 'Sam Newman' }],
    categories: [{ id: 'c4', name: 'Distributed Systems & Cloud' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b7777777-7777-7777-7777-777777777777',
    isbn: '978-1736049112',
    title: 'System Design Interview',
    subtitle: "An Insider's Guide (Volume 1)",
    publisher: 'Independently published',
    publicationYear: 2020,
    description: 'Step-by-step blueprints for architecting high-scale distributed systems and web architectures.',
    language: 'English',
    totalCopies: 4,
    availableCopies: 2,
    borrowedCopies: 2,
    shelfLocation: 'Shelf SD-01',
    coverImageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
    status: 'ACTIVE',
    authors: [{ id: 'a9', name: 'Alex Xu' }],
    categories: [{ id: 'c5', name: 'System Design & Architecture' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b8888888-8888-8888-8888-888888888888',
    isbn: '978-0262046305',
    title: 'Introduction to Algorithms (CLRS)',
    subtitle: 'Fourth Edition',
    publisher: 'MIT Press',
    publicationYear: 2022,
    description: 'The standard comprehensive textbook on data structures, graph theory, and algorithmic complexity.',
    language: 'English',
    totalCopies: 6,
    availableCopies: 5,
    borrowedCopies: 1,
    shelfLocation: 'Shelf ALG-01',
    coverImageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
    status: 'ACTIVE',
    authors: [{ id: 'a10', name: 'Thomas H. Cormen' }],
    categories: [{ id: 'c2', name: 'Computer Science & Algorithms' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b9999999-9999-9999-9999-999999999999',
    isbn: '978-0743273565',
    title: 'The Great Gatsby',
    subtitle: 'A Novel of the Jazz Age',
    publisher: 'Scribner',
    publicationYear: 1925,
    description: 'The story of the fabulously wealthy Jay Gatsby and his new love for Daisy Buchanan.',
    language: 'English',
    totalCopies: 6,
    availableCopies: 5,
    borrowedCopies: 1,
    shelfLocation: 'Shelf LIT-01',
    coverImageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    status: 'ACTIVE',
    authors: [{ id: 'a5', name: 'F. Scott Fitzgerald' }],
    categories: [{ id: 'c3', name: 'Classic Literature' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    isbn: '978-0451524935',
    title: '1984',
    subtitle: 'A Dystopian Masterpiece',
    publisher: 'Signet Classics',
    publicationYear: 1949,
    description: 'A chilling prophecy about totalitarian surveillance, psychological control, and the manipulation of truth.',
    language: 'English',
    totalCopies: 2,
    availableCopies: 0,
    borrowedCopies: 2,
    shelfLocation: 'Shelf LIT-02',
    coverImageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
    status: 'ACTIVE',
    authors: [{ id: 'a11', name: 'George Orwell' }],
    categories: [{ id: 'c3', name: 'Classic Literature' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    isbn: '978-0061120084',
    title: 'To Kill a Mockingbird',
    subtitle: '50th Anniversary Edition',
    publisher: 'Harper Perennial',
    publicationYear: 1960,
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.',
    language: 'English',
    totalCopies: 4,
    availableCopies: 4,
    borrowedCopies: 0,
    shelfLocation: 'Shelf LIT-03',
    coverImageUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400',
    status: 'ACTIVE',
    authors: [{ id: 'a12', name: 'Harper Lee' }],
    categories: [{ id: 'c3', name: 'Classic Literature' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const BookList: React.FC = () => {
  const { hasRole } = useAuth();

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

  const displayBooks = booksData?.data?.content ?? fallbackBooks;

  const handleExportCSV = () => {
    const headers = 'ISBN,Title,Author,Category,Available Copies,Total Copies,Status\n';
    const rows = displayBooks
      .map(
        (b) =>
          `"${b.isbn}","${b.title.replace(/"/g, '""')}","${b.authors?.map((a) => a.name).join('; ') || ''}","${b.categories?.map((c) => c.name).join('; ') || ''}",${b.availableCopies},${b.totalCopies},"${b.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `library_catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Book Catalog & Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse books available for borrowing and track issued inventory in real-time
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-semibold text-xs shadow-2xs transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>

          {hasRole(['ADMIN', 'LIBRARIAN']) && (
            <button
              onClick={() => {
                setEditingBook(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add New Book
            </button>
          )}
        </div>
      </div>

      {/* Featured Book Spotlight Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-20 bg-white/10 rounded-2xl overflow-hidden shadow-md flex-shrink-0 flex items-center justify-center border border-white/20">
            <BookOpen className="w-8 h-8 text-emerald-300" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold mb-1 border border-emerald-500/30">
              <Sparkles className="w-3 h-3" />
              Featured Staff Recommendation
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-white">
              Designing Data-Intensive Applications
            </h3>
            <p className="text-xs text-emerald-100/70 line-clamp-1">
              By Martin Kleppmann &bull; Distributed Systems, Consensus, Stream Processing & Reliability
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 self-stretch sm:self-auto justify-end">
          <Link
            to="/books/b3333333-3333-3333-3333-333333333333"
            className="px-4 py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl font-bold text-xs shadow-sm transition"
          >
            View Book &rarr;
          </Link>
        </div>
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
            <option value="true">Available for Issue (In Stock)</option>
            <option value="false">Issued / Out of Stock</option>
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
        {isLoading && !displayBooks.length ? (
          <div className="py-20 flex justify-center items-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mr-3" />
            Loading catalog books...
          </div>
        ) : displayBooks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Book Details</th>
                  <th className="px-6 py-3.5">Authors & Category</th>
                  <th className="px-6 py-3.5 text-center">Availability & Stock</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayBooks.map((book) => {
                  const isAvailable = book.availableCopies > 0;
                  return (
                    <tr key={book.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Book Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={book.coverImageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200'}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded-lg shadow-sm border border-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              to={`/books/${book.id}`}
                              className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors line-clamp-1"
                            >
                              {book.title}
                            </Link>
                            {book.subtitle && (
                              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{book.subtitle}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                {book.isbn}
                              </span>
                              {book.shelfLocation && (
                                <span className="text-xs text-emerald-900 bg-emerald-50/90 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold">
                                  <Library className="w-3.5 h-3.5 text-emerald-600" />
                                  {book.shelfLocation}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Authors & Categories */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-xs text-slate-900 font-medium line-clamp-1">
                            {book.authors && book.authors.length > 0
                              ? book.authors.map((a) => a.name).join(', ')
                              : 'Unknown Author'}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {book.categories?.map((cat) => (
                              <span
                                key={cat.id}
                                className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-md"
                              >
                                {cat.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Availability & Stock */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          {isAvailable ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {book.availableCopies} of {book.totalCopies} Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
                              <Clock className="w-3.5 h-3.5" />
                              All {book.totalCopies} Issued
                            </span>
                          )}
                          <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                              style={{
                                width: `${(book.availableCopies / book.totalCopies) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
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

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isAvailable ? (
                            <Link
                              to="/loans"
                              className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                              title="Issue this book to a member"
                            >
                              <BookmarkCheck className="w-3.5 h-3.5" /> Issue
                            </Link>
                          ) : (
                            <Link
                              to="/reservations"
                              className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                              title="Place a reservation hold"
                            >
                              <Clock className="w-3.5 h-3.5" /> Reserve
                            </Link>
                          )}

                          <button
                            onClick={() => handleEdit(book)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Book"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900">No books found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria or add a new book to the inventory.
            </p>
          </div>
        )}

        {booksData?.data && (
          <Pagination
            currentPage={booksData.data.page}
            totalPages={booksData.data.totalPages}
            totalElements={booksData.data.totalElements}
            pageSize={size}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>

      {/* Book Add/Edit Modal */}
      {isModalOpen && (
        <BookFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBook(null);
          }}
          bookToEdit={editingBook}
          onSuccess={() => {
            refetch();
            setIsModalOpen(false);
            setEditingBook(null);
          }}
        />
      )}
    </div>
  );
};
export default BookList;
