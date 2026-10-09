import {
  Book,
  Author,
  Category,
  Member,
  Loan,
  AuditEvent,
  Reservation,
  Fine,
  PaymentTransaction,
  User,
  DashboardStats,
  BookStatus,
  MemberStatus,
  UserRole,
} from '../types';

const STORAGE_KEYS = {
  BOOKS: 'libmaster_books_data',
  AUTHORS: 'libmaster_authors_data',
  CATEGORIES: 'libmaster_categories_data',
  MEMBERS: 'libmaster_members_data',
  LOANS: 'libmaster_loans_data',
  RESERVATIONS: 'libmaster_reservations_data',
  FINES: 'libmaster_fines_data',
  TRANSACTIONS: 'libmaster_txns_data',
  USERS: 'libmaster_users_data',
  AUDIT: 'libmaster_audit_data',
};

// Initial Seed Data
const initialAuthors: Author[] = [
  { id: 'a1', name: 'Robert C. Martin', bio: 'Author of Clean Code and agile software craftsman' },
  { id: 'a2', name: 'Joshua Bloch', bio: 'Former Chief Java Architect at Google and author of Effective Java' },
  { id: 'a3', name: 'Martin Kleppmann', bio: 'Researcher in distributed systems and author of DDIA' },
  { id: 'a4', name: 'Sam Newman', bio: 'Author of Building Microservices and Monolith to Microservices' },
  { id: 'a5', name: 'Eric Evans', bio: 'Domain-Driven Design pioneer' },
  { id: 'a6', name: 'Thomas H. Cormen', bio: 'Professor of Computer Science and co-author of CLRS' },
  { id: 'a7', name: 'Gayle Laakmann McDowell', bio: 'Software engineer and author of Cracking the Coding Interview' },
  { id: 'a8', name: 'George Orwell', bio: 'Novelist and author of 1984 and Animal Farm' },
  { id: 'a9', name: 'Andrew Hunt', bio: 'Co-author of The Pragmatic Programmer' },
  { id: 'a10', name: 'David Thomas', bio: 'Co-author of The Pragmatic Programmer' },
  { id: 'a11', name: 'Betsy Beyer', bio: 'Site Reliability Engineering editor at Google' },
  { id: 'a12', name: 'Martin Fowler', bio: 'Chief Scientist at Thoughtworks and author of Refactoring' },
];

const initialCategories: Category[] = [
  { id: 'c1', name: 'Software Engineering', description: 'Software design principles, clean architecture and best practices' },
  { id: 'c2', name: 'Distributed Systems', description: 'High-availability architecture, scalability and distributed consensus' },
  { id: 'c3', name: 'Algorithms & Data Structures', description: 'Theoretical computer science, algorithmic complexity and sorting' },
  { id: 'c4', name: 'Databases & Storage', description: 'Relational, NoSQL, graph databases and storage engines' },
  { id: 'c5', name: 'Cloud & DevOps', description: 'CI/CD, container orchestration, Docker, Kubernetes and SRE' },
  { id: 'c6', name: 'Literature & Fiction', description: 'Classic and modern literature novels and prose' },
];

const initialBooks: Book[] = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    isbn: '978-0132350884',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    subtitle: 'A Handbook of Agile Software Craftsmanship',
    publisher: 'Prentice Hall',
    publicationYear: 2008,
    description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.',
    language: 'English',
    totalCopies: 5,
    availableCopies: 4,
    borrowedCopies: 1,
    shelfLocation: 'Rack A-1 (Shelf CS-01)',
    coverImageUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd1?w=400',
    status: 'ACTIVE',
    authors: [{ id: 'a1', name: 'Robert C. Martin' }],
    categories: [{ id: 'c1', name: 'Software Engineering' }],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    isbn: '978-0134685991',
    title: 'Effective Java (3rd Edition)',
    subtitle: 'Best practices for the Java platform',
    publisher: 'Addison-Wesley',
    publicationYear: 2018,
    description: 'The definitive guide to best practices in modern Java programming.',
    language: 'English',
    totalCopies: 4,
    availableCopies: 3,
    borrowedCopies: 1,
    shelfLocation: 'Rack A-1 (Shelf CS-02)',
    coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    status: 'ACTIVE',
    authors: [{ id: 'a2', name: 'Joshua Bloch' }],
    categories: [{ id: 'c1', name: 'Software Engineering' }],
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b3333333-3333-3333-3333-333333333333',
    isbn: '978-1449373320',
    title: 'Designing Data-Intensive Applications',
    subtitle: 'The Big Ideas Behind Reliable, Scalable, and Maintainable Systems',
    publisher: 'O\'Reilly Media',
    publicationYear: 2017,
    description: 'Data is at the center of many challenges in system design today. Martin Kleppmann helps you navigate scalable architectures.',
    language: 'English',
    totalCopies: 6,
    availableCopies: 2,
    borrowedCopies: 4,
    shelfLocation: 'Rack B-2 (Shelf DS-01)',
    coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
    status: 'ACTIVE',
    authors: [{ id: 'a3', name: 'Martin Kleppmann' }],
    categories: [{ id: 'c2', name: 'Distributed Systems' }, { id: 'c4', name: 'Databases & Storage' }],
    createdAt: '2026-01-03T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b4444444-4444-4444-4444-444444444444',
    isbn: '978-1492034025',
    title: 'Building Microservices (2nd Edition)',
    subtitle: 'Designing Fine-Grained Systems',
    publisher: 'O\'Reilly Media',
    publicationYear: 2021,
    description: 'Technologies constantly change, but the fundamental challenges of microservices remain. All copies currently checked out.',
    language: 'English',
    totalCopies: 4,
    availableCopies: 0,
    borrowedCopies: 4,
    shelfLocation: 'Rack B-2 (Shelf DS-02)',
    coverImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    status: 'ACTIVE',
    authors: [{ id: 'a4', name: 'Sam Newman' }],
    categories: [{ id: 'c2', name: 'Distributed Systems' }, { id: 'c5', name: 'Cloud & DevOps' }],
    createdAt: '2026-01-04T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b5555555-5555-5555-5555-555555555555',
    isbn: '978-0262033848',
    title: 'Introduction to Algorithms (CLRS)',
    subtitle: 'Comprehensive textbook on algorithmic techniques and complexity',
    publisher: 'MIT Press',
    publicationYear: 2009,
    description: 'The golden standard algorithms textbook covering dynamic programming, graph theory, greedy algorithms and complexity.',
    language: 'English',
    totalCopies: 2,
    availableCopies: 1,
    borrowedCopies: 1,
    shelfLocation: 'Rack C-1 (Shelf AL-01)',
    coverImageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
    status: 'ACTIVE',
    authors: [{ id: 'a6', name: 'Thomas H. Cormen' }],
    categories: [{ id: 'c3', name: 'Algorithms & Data Structures' }],
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b6666666-6666-6666-6666-666666666666',
    isbn: '978-0201616224',
    title: 'The Pragmatic Programmer',
    subtitle: 'Your Journey to Mastery',
    publisher: 'Addison-Wesley',
    publicationYear: 2019,
    description: 'Straightforward practical advice for software developers to improve craft, testability, and problem solving.',
    language: 'English',
    totalCopies: 3,
    availableCopies: 3,
    borrowedCopies: 0,
    shelfLocation: 'Rack A-2 (Shelf CS-03)',
    coverImageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
    status: 'ACTIVE',
    authors: [{ id: 'a9', name: 'Andrew Hunt' }, { id: 'a10', name: 'David Thomas' }],
    categories: [{ id: 'c1', name: 'Software Engineering' }],
    createdAt: '2026-01-06T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b7777777-7777-7777-7777-777777777777',
    isbn: '978-0321125217',
    title: 'Domain-Driven Design',
    subtitle: 'Tackling Complexity in the Heart of Software',
    publisher: 'Addison-Wesley',
    publicationYear: 2003,
    description: 'A systematic approach to domain-driven design for complex enterprise software systems.',
    language: 'English',
    totalCopies: 3,
    availableCopies: 2,
    borrowedCopies: 1,
    shelfLocation: 'Rack A-2 (Shelf CS-04)',
    coverImageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    status: 'ACTIVE',
    authors: [{ id: 'a5', name: 'Eric Evans' }],
    categories: [{ id: 'c1', name: 'Software Engineering' }],
    createdAt: '2026-01-07T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b8888888-8888-8888-8888-888888888888',
    isbn: '978-0451524935',
    title: '1984',
    subtitle: 'A dystopian social science fiction novel',
    publisher: 'Signet Classic',
    publicationYear: 1950,
    description: 'George Orwell\'s terrifying vision of a totalitarian future where surveillance and government control are omnipresent.',
    language: 'English',
    totalCopies: 2,
    availableCopies: 0,
    borrowedCopies: 2,
    shelfLocation: 'Rack D-1 (Shelf LIT-01)',
    coverImageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
    status: 'ACTIVE',
    authors: [{ id: 'a8', name: 'George Orwell' }],
    categories: [{ id: 'c6', name: 'Literature & Fiction' }],
    createdAt: '2026-01-08T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

const initialMembers: Member[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    membershipNumber: 'MEM-2026-0001',
    firstName: 'Alice',
    lastName: 'Johnson',
    fullName: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '+1 (555) 019-2831',
    address: '452 University Avenue, Apt 4B, Cambridge, MA',
    maxLoans: 5,
    activeLoansCount: 1,
    status: 'ACTIVE',
    registrationDate: '2026-01-15T09:00:00Z',
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    membershipNumber: 'MEM-2026-0002',
    firstName: 'Bob',
    lastName: 'Smith',
    fullName: 'Bob Smith',
    email: 'bob.smith@example.com',
    phone: '+1 (555) 014-9982',
    address: '88 Faculty Way, Suite 10, Cambridge, MA',
    maxLoans: 10,
    activeLoansCount: 1,
    status: 'ACTIVE',
    registrationDate: '2026-02-01T11:00:00Z',
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    membershipNumber: 'MEM-2026-0003',
    firstName: 'Carol',
    lastName: 'White',
    fullName: 'Carol White',
    email: 'carol.white@example.com',
    phone: '+1 (555) 018-3341',
    address: '102 Tech Park Blvd, Boston, MA',
    maxLoans: 5,
    activeLoansCount: 1,
    status: 'ACTIVE',
    registrationDate: '2026-02-15T14:30:00Z',
    createdAt: '2026-02-15T14:30:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    membershipNumber: 'MEM-2026-0004',
    firstName: 'David',
    lastName: 'Brown',
    fullName: 'David Brown',
    email: 'david.brown@example.com',
    phone: '+1 (555) 012-7764',
    address: '22 Campus Drive, Boston, MA',
    maxLoans: 5,
    activeLoansCount: 1,
    status: 'ACTIVE',
    registrationDate: '2026-03-01T10:00:00Z',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd5555555-5555-5555-5555-555555555555',
    membershipNumber: 'MEM-2026-0005',
    firstName: 'Eva',
    lastName: 'Green',
    fullName: 'Eva Green',
    email: 'eva.green@example.com',
    phone: '+1 (555) 019-5523',
    address: '61 Library Lane, Boston, MA',
    maxLoans: 5,
    activeLoansCount: 1,
    status: 'ACTIVE',
    registrationDate: '2026-03-10T16:00:00Z',
    createdAt: '2026-03-10T16:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

const initialLoans: Loan[] = [
  {
    id: 'e1111111-1111-1111-1111-111111111111',
    loanNumber: 'TXN-2026-0001',
    book: initialBooks[0],
    member: initialMembers[0],
    issuedById: 'u1',
    issuedByUsername: 'admin',
    issueDate: '2026-10-01T10:30:00Z',
    dueDate: '2026-10-15T10:30:00Z',
    status: 'ISSUED',
    renewalCount: 0,
    fineAmount: 0,
    overdue: false,
    daysOverdue: 0,
    createdAt: '2026-10-01T10:30:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e2222222-2222-2222-2222-222222222222',
    loanNumber: 'TXN-2026-0002',
    book: initialBooks[2],
    member: initialMembers[1],
    issuedById: 'u1',
    issuedByUsername: 'admin',
    issueDate: '2026-10-02T14:15:00Z',
    dueDate: '2026-10-16T14:15:00Z',
    status: 'ISSUED',
    renewalCount: 0,
    fineAmount: 0,
    overdue: false,
    daysOverdue: 0,
    createdAt: '2026-10-02T14:15:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e3333333-3333-3333-3333-333333333333',
    loanNumber: 'TXN-2026-0003',
    book: initialBooks[3],
    member: initialMembers[2],
    issuedById: 'u1',
    issuedByUsername: 'admin',
    issueDate: '2026-09-28T09:45:00Z',
    dueDate: '2026-10-12T09:45:00Z',
    status: 'ISSUED',
    renewalCount: 0,
    fineAmount: 0,
    overdue: false,
    daysOverdue: 0,
    createdAt: '2026-09-28T09:45:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e5555555-5555-5555-5555-555555555555',
    loanNumber: 'TXN-2026-0005',
    book: initialBooks[7],
    member: initialMembers[4],
    issuedById: 'u1',
    issuedByUsername: 'admin',
    issueDate: '2026-09-01T10:00:00Z',
    dueDate: '2026-09-15T10:00:00Z',
    status: 'OVERDUE',
    renewalCount: 1,
    fineAmount: 9.5,
    overdue: true,
    daysOverdue: 19,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

const initialReservations: Reservation[] = [
  {
    id: 'res-1',
    bookId: 'b5555555-5555-5555-5555-555555555555',
    bookTitle: 'Introduction to Algorithms (CLRS)',
    bookIsbn: '978-0262033848',
    memberId: 'd3333333-3333-3333-3333-333333333333',
    memberName: 'Carol White',
    memberEmail: 'carol.white@example.com',
    status: 'PENDING',
    queuePosition: 1,
    createdAt: '2026-10-02T09:00:00Z',
  },
  {
    id: 'res-2',
    bookId: 'b4444444-4444-4444-4444-444444444444',
    bookTitle: 'Building Microservices (2nd Edition)',
    bookIsbn: '978-1492034025',
    memberId: 'd4444444-4444-4444-4444-444444444444',
    memberName: 'David Brown',
    memberEmail: 'david.brown@example.com',
    status: 'READY_FOR_PICKUP',
    queuePosition: 1,
    pickupDeadline: '2026-10-07T14:30:00Z',
    createdAt: '2026-10-01T14:30:00Z',
  },
];

const initialFines: Fine[] = [
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
];

const initialUsers: User[] = [
  {
    id: 'u1',
    username: 'admin',
    email: 'admin@library.local',
    fullName: 'System Administrator',
    role: 'ADMIN',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'u2',
    username: 'librarian.john',
    email: 'john.librarian@library.local',
    fullName: 'John Miller',
    role: 'LIBRARIAN',
    active: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

const initialAudit: AuditEvent[] = [
  {
    id: 'aud-1',
    username: 'admin',
    eventType: 'SYSTEM_BOOT',
    entityType: 'SYSTEM',
    details: 'Library Management microservices console initialized in open access mode',
    ipAddress: '127.0.0.1',
    timestamp: new Date().toISOString(),
  },
];

// Helper to get item from localStorage with seed fallback
function loadData<T>(key: string, initialValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    }
    return JSON.parse(raw);
  } catch {
    return initialValue;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Client Storage API
export const localStore = {
  // Books & Racks
  getBooks(): Book[] {
    return loadData<Book[]>(STORAGE_KEYS.BOOKS, initialBooks);
  },

  getBookById(id: string): Book | undefined {
    const books = this.getBooks();
    return books.find((b) => b.id === id);
  },

  saveBook(bookData: Partial<Book> & { authorIds?: string[]; categoryIds?: string[] }): Book {
    const books = this.getBooks();
    const authors = this.getAuthors();
    const categories = this.getCategories();

    const assignedAuthors = (bookData.authorIds || [])
      .map((aid) => authors.find((a) => a.id === aid))
      .filter((a): a is Author => Boolean(a));

    const assignedCategories = (bookData.categoryIds || [])
      .map((cid) => categories.find((c) => c.id === cid))
      .filter((c): c is Category => Boolean(c));

    const totalCopies = Number(bookData.totalCopies) || 1;
    const rackLocation = bookData.shelfLocation || `Rack ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}-${Math.floor(Math.random() * 4) + 1} (Shelf CS-0${Math.floor(Math.random() * 9) + 1})`;

    if (bookData.id) {
      const idx = books.findIndex((b) => b.id === bookData.id);
      if (idx !== -1) {
        const existing = books[idx];
        const updatedBook: Book = {
          ...existing,
          ...bookData,
          isbn: bookData.isbn ? bookData.isbn.trim() : existing.isbn,
          title: bookData.title ? bookData.title.trim() : existing.title,
          totalCopies,
          availableCopies: Math.max(0, totalCopies - (existing.borrowedCopies || 0)),
          shelfLocation: rackLocation,
          authors: assignedAuthors.length > 0 ? assignedAuthors : existing.authors,
          categories: assignedCategories.length > 0 ? assignedCategories : existing.categories,
          updatedAt: new Date().toISOString(),
        } as Book;

        books[idx] = updatedBook;
        saveData(STORAGE_KEYS.BOOKS, books);
        this.recordAudit('BOOK_UPDATED', 'BOOK', updatedBook.id, `Updated book details for "${updatedBook.title}" in ${rackLocation}`);
        return updatedBook;
      }
    }

    // New Book Creation
    const newBook: Book = {
      id: generateUUID(),
      isbn: (bookData.isbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`).trim(),
      title: (bookData.title || 'Untitled Book').trim(),
      subtitle: bookData.subtitle,
      publisher: bookData.publisher || 'LibMaster Publishing',
      publicationYear: bookData.publicationYear || new Date().getFullYear(),
      description: bookData.description || 'Published and cataloged in the library inventory management rack.',
      language: bookData.language || 'English',
      totalCopies,
      availableCopies: totalCopies,
      borrowedCopies: 0,
      shelfLocation: rackLocation,
      coverImageUrl:
        bookData.coverImageUrl ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      status: (bookData.status as BookStatus) || 'ACTIVE',
      authors: assignedAuthors.length > 0 ? assignedAuthors : [{ id: 'a1', name: 'Robert C. Martin' }],
      categories: assignedCategories.length > 0 ? assignedCategories : [{ id: 'c1', name: 'Software Engineering' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    books.unshift(newBook);
    saveData(STORAGE_KEYS.BOOKS, books);
    this.recordAudit('BOOK_CREATED', 'BOOK', newBook.id, `Created and placed book "${newBook.title}" (ISBN: ${newBook.isbn}) in ${newBook.shelfLocation}`);
    return newBook;
  },

  updateBookStatus(id: string, status: BookStatus): Book {
    const books = this.getBooks();
    const idx = books.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Book not found');
    books[idx].status = status;
    books[idx].updatedAt = new Date().toISOString();
    saveData(STORAGE_KEYS.BOOKS, books);
    this.recordAudit('BOOK_STATUS_CHANGED', 'BOOK', id, `Changed book status to ${status}`);
    return books[idx];
  },

  // Authors & Categories
  getAuthors(): Author[] {
    return loadData<Author[]>(STORAGE_KEYS.AUTHORS, initialAuthors);
  },

  getCategories(): Category[] {
    return loadData<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  },

  // Members
  getMembers(): Member[] {
    return loadData<Member[]>(STORAGE_KEYS.MEMBERS, initialMembers);
  },

  getMemberById(id: string): Member | undefined {
    return this.getMembers().find((m) => m.id === id);
  },

  saveMember(memberData: Partial<Member>): Member {
    const members = this.getMembers();
    if (memberData.id) {
      const idx = members.findIndex((m) => m.id === memberData.id);
      if (idx !== -1) {
        members[idx] = {
          ...members[idx],
          ...memberData,
          fullName: `${memberData.firstName || members[idx].firstName} ${memberData.lastName || members[idx].lastName}`,
          updatedAt: new Date().toISOString(),
        } as Member;
        saveData(STORAGE_KEYS.MEMBERS, members);
        this.recordAudit('MEMBER_UPDATED', 'MEMBER', members[idx].id, `Updated patron profile for ${members[idx].fullName}`);
        return members[idx];
      }
    }

    const newMember: Member = {
      id: generateUUID(),
      membershipNumber: `MEM-${new Date().getFullYear()}-000${members.length + 1}`,
      firstName: memberData.firstName || 'Patron',
      lastName: memberData.lastName || 'Member',
      fullName: `${memberData.firstName || 'Patron'} ${memberData.lastName || 'Member'}`,
      email: memberData.email || `patron${members.length + 1}@example.com`,
      phone: memberData.phone || '+1 (555) 010-0000',
      address: memberData.address || 'Campus Library Stacks',
      maxLoans: memberData.maxLoans || 5,
      activeLoansCount: 0,
      status: (memberData.status as MemberStatus) || 'ACTIVE',
      registrationDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    members.unshift(newMember);
    saveData(STORAGE_KEYS.MEMBERS, members);
    this.recordAudit('MEMBER_REGISTERED', 'MEMBER', newMember.id, `Registered new patron: ${newMember.fullName} (#${newMember.membershipNumber})`);
    return newMember;
  },

  updateMemberStatus(id: string, status: MemberStatus): Member {
    const members = this.getMembers();
    const idx = members.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error('Member not found');
    members[idx].status = status;
    members[idx].updatedAt = new Date().toISOString();
    saveData(STORAGE_KEYS.MEMBERS, members);
    this.recordAudit('MEMBER_STATUS_CHANGED', 'MEMBER', id, `Set status to ${status}`);
    return members[idx];
  },

  // Loans & Circulation
  getLoans(): Loan[] {
    return loadData<Loan[]>(STORAGE_KEYS.LOANS, initialLoans);
  },

  issueLoan(data: { bookId: string; memberId: string; dueDate?: string; notes?: string }): Loan {
    const books = this.getBooks();
    const members = this.getMembers();
    const loans = this.getLoans();

    const bookIdx = books.findIndex((b) => b.id === data.bookId);
    if (bookIdx === -1) throw new Error('Book record not found in inventory');

    const memberIdx = members.findIndex((m) => m.id === data.memberId);
    if (memberIdx === -1) throw new Error('Member not found');

    if (books[bookIdx].availableCopies <= 0) {
      throw new Error('No physical copies currently available on the rack for issue.');
    }

    // Decrement physical copy from rack
    books[bookIdx].availableCopies -= 1;
    books[bookIdx].borrowedCopies = (books[bookIdx].borrowedCopies || 0) + 1;
    saveData(STORAGE_KEYS.BOOKS, books);

    // Increment member loan count
    members[memberIdx].activeLoansCount = (members[memberIdx].activeLoansCount || 0) + 1;
    saveData(STORAGE_KEYS.MEMBERS, members);

    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 14);

    const newLoan: Loan = {
      id: generateUUID(),
      loanNumber: `TXN-${new Date().getFullYear()}-000${loans.length + 1}`,
      book: books[bookIdx],
      member: members[memberIdx],
      issuedById: 'u1',
      issuedByUsername: 'admin',
      issueDate: new Date().toISOString(),
      dueDate: data.dueDate || defaultDue.toISOString(),
      status: 'ISSUED',
      renewalCount: 0,
      fineAmount: 0,
      notes: data.notes,
      overdue: false,
      daysOverdue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    loans.unshift(newLoan);
    saveData(STORAGE_KEYS.LOANS, loans);
    this.recordAudit('LOAN_ISSUED', 'LOAN', newLoan.id, `Checked out "${books[bookIdx].title}" to ${members[memberIdx].fullName}`);
    return newLoan;
  },

  returnLoan(loanId: string, notes?: string): Loan {
    const loans = this.getLoans();
    const books = this.getBooks();
    const members = this.getMembers();

    const loanIdx = loans.findIndex((l) => l.id === loanId);
    if (loanIdx === -1) throw new Error('Loan record not found');

    const loan = loans[loanIdx];
    loan.status = 'RETURNED';
    loan.returnDate = new Date().toISOString();
    loan.returnedById = 'u1';
    loan.returnedByUsername = 'admin';
    if (notes) loan.notes = notes;
    loan.updatedAt = new Date().toISOString();

    // Restock copy in book rack
    const bookIdx = books.findIndex((b) => b.id === loan.book?.id);
    if (bookIdx !== -1) {
      books[bookIdx].availableCopies = Math.min(books[bookIdx].totalCopies, books[bookIdx].availableCopies + 1);
      books[bookIdx].borrowedCopies = Math.max(0, (books[bookIdx].borrowedCopies || 1) - 1);
      saveData(STORAGE_KEYS.BOOKS, books);
    }

    // Decrement member loan count
    const memberIdx = members.findIndex((m) => m.id === loan.member?.id);
    if (memberIdx !== -1) {
      members[memberIdx].activeLoansCount = Math.max(0, (members[memberIdx].activeLoansCount || 1) - 1);
      saveData(STORAGE_KEYS.MEMBERS, members);
    }

    saveData(STORAGE_KEYS.LOANS, loans);
    this.recordAudit('LOAN_RETURNED', 'LOAN', loan.id, `Returned "${loan.book?.title}" from ${loan.member?.fullName}`);
    return loan;
  },

  renewLoan(loanId: string): Loan {
    const loans = this.getLoans();
    const loanIdx = loans.findIndex((l) => l.id === loanId);
    if (loanIdx === -1) throw new Error('Loan not found');

    const loan = loans[loanIdx];
    const newDueDate = new Date(loan.dueDate || new Date());
    newDueDate.setDate(newDueDate.getDate() + 14);

    loan.dueDate = newDueDate.toISOString();
    loan.renewalCount = (loan.renewalCount || 0) + 1;
    loan.status = 'ISSUED';
    loan.overdue = false;
    loan.updatedAt = new Date().toISOString();

    saveData(STORAGE_KEYS.LOANS, loans);
    this.recordAudit('LOAN_RENEWED', 'LOAN', loan.id, `Renewed loan for "${loan.book?.title}" until ${newDueDate.toLocaleDateString()}`);
    return loan;
  },

  cancelLoan(loanId: string): Loan {
    const loans = this.getLoans();
    const books = this.getBooks();
    const members = this.getMembers();

    const loanIdx = loans.findIndex((l) => l.id === loanId);
    if (loanIdx === -1) throw new Error('Loan record not found');

    const loan = loans[loanIdx];
    loan.status = 'CANCELLED';
    loan.updatedAt = new Date().toISOString();

    // Restock book
    const bookIdx = books.findIndex((b) => b.id === loan.book?.id);
    if (bookIdx !== -1) {
      books[bookIdx].availableCopies = Math.min(books[bookIdx].totalCopies, books[bookIdx].availableCopies + 1);
      books[bookIdx].borrowedCopies = Math.max(0, (books[bookIdx].borrowedCopies || 1) - 1);
      saveData(STORAGE_KEYS.BOOKS, books);
    }

    // Decrement member loans count
    const memberIdx = members.findIndex((m) => m.id === loan.member?.id);
    if (memberIdx !== -1) {
      members[memberIdx].activeLoansCount = Math.max(0, (members[memberIdx].activeLoansCount || 1) - 1);
      saveData(STORAGE_KEYS.MEMBERS, members);
    }

    saveData(STORAGE_KEYS.LOANS, loans);
    this.recordAudit('LOAN_CANCELLED', 'LOAN', loan.id, `Cancelled checkout for "${loan.book?.title}"`);
    return loan;
  },

  // Reservations Microservice
  getReservations(): Reservation[] {
    return loadData<Reservation[]>(STORAGE_KEYS.RESERVATIONS, initialReservations);
  },

  createReservation(data: Partial<Reservation>): Reservation {
    const resList = this.getReservations();
    const newRes: Reservation = {
      id: generateUUID(),
      bookId: data.bookId || generateUUID(),
      bookTitle: data.bookTitle || 'Reserved Book',
      bookIsbn: data.bookIsbn || '978-1492034025',
      memberId: data.memberId || generateUUID(),
      memberName: data.memberName || 'Patron',
      memberEmail: data.memberEmail || 'patron@example.com',
      status: 'PENDING',
      queuePosition: resList.filter((r) => r.bookTitle === data.bookTitle && r.status === 'PENDING').length + 1,
      createdAt: new Date().toISOString(),
    };
    resList.unshift(newRes);
    saveData(STORAGE_KEYS.RESERVATIONS, resList);
    this.recordAudit('RESERVATION_CREATED', 'RESERVATION', newRes.id, `Hold placed for "${newRes.bookTitle}" by ${newRes.memberName}`);
    return newRes;
  },

  updateReservationStatus(id: string, status: Reservation['status']): Reservation {
    const resList = this.getReservations();
    const idx = resList.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Reservation not found');
    resList[idx].status = status;
    saveData(STORAGE_KEYS.RESERVATIONS, resList);
    this.recordAudit('RESERVATION_UPDATED', 'RESERVATION', id, `Updated hold status to ${status}`);
    return resList[idx];
  },

  // Fines & Payments Microservice
  getFines(): Fine[] {
    return loadData<Fine[]>(STORAGE_KEYS.FINES, initialFines);
  },

  getTransactions(): PaymentTransaction[] {
    return loadData<PaymentTransaction[]>(STORAGE_KEYS.TRANSACTIONS, [
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
    ]);
  },

  payFine(fineId: string, data: { amount: number; method: any }): PaymentTransaction {
    const fines = this.getFines();
    const txns = this.getTransactions();

    const idx = fines.findIndex((f) => f.id === fineId);
    if (idx === -1) throw new Error('Fine not found');

    const fine = fines[idx];
    fine.paidAmount = (fine.paidAmount || 0) + data.amount;
    fine.remainingAmount = Math.max(0, fine.amount - fine.paidAmount);
    fine.status = fine.remainingAmount === 0 ? 'PAID' : 'UNPAID';
    fine.paidAt = new Date().toISOString();
    saveData(STORAGE_KEYS.FINES, fines);

    const newTxn: PaymentTransaction = {
      id: generateUUID(),
      fineId,
      memberId: fine.memberId,
      amount: data.amount,
      method: data.method || 'UPI',
      transactionReference: `TXN-PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      receiptNumber: `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      processedBy: 'admin',
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };

    txns.unshift(newTxn);
    saveData(STORAGE_KEYS.TRANSACTIONS, txns);
    this.recordAudit('PAYMENT_PROCESSED', 'PAYMENT', newTxn.id, `Settled fine of $${data.amount} for loan ${fine.loanNumber} via ${data.method}`);
    return newTxn;
  },

  waiveFine(fineId: string, reason?: string): Fine {
    const fines = this.getFines();
    const idx = fines.findIndex((f) => f.id === fineId);
    if (idx === -1) throw new Error('Fine not found');
    fines[idx].status = 'WAIVED';
    fines[idx].waivedAt = new Date().toISOString();
    fines[idx].waivedBy = 'admin';
    fines[idx].notes = reason || 'Administrative fee waiver approved';
    saveData(STORAGE_KEYS.FINES, fines);
    this.recordAudit('FINE_WAIVED', 'PAYMENT', fineId, `Waived fine of $${fines[idx].amount} for ${fines[idx].memberName}`);
    return fines[idx];
  },

  // Users & Staff
  getUsers(): User[] {
    return loadData<User[]>(STORAGE_KEYS.USERS, initialUsers);
  },

  saveUser(userData: Partial<User>): User {
    const users = this.getUsers();
    const newUser: User = {
      id: generateUUID(),
      username: (userData.username || `user_${Date.now()}`).trim(),
      email: (userData.email || 'staff@library.local').trim(),
      fullName: (userData.fullName || 'Staff Operator').trim(),
      role: (userData.role as UserRole) || 'LIBRARIAN',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.unshift(newUser);
    saveData(STORAGE_KEYS.USERS, users);
    this.recordAudit('USER_CREATED', 'USER', newUser.id, `Created staff account for @${newUser.username} (${newUser.role})`);
    return newUser;
  },

  updateUserStatus(id: string, active: boolean): User {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');
    users[idx].active = active;
    users[idx].updatedAt = new Date().toISOString();
    saveData(STORAGE_KEYS.USERS, users);
    this.recordAudit('USER_STATUS_CHANGED', 'USER', id, `Updated account active status to ${active}`);
    return users[idx];
  },

  // Audit
  getAuditLogs(): AuditEvent[] {
    return loadData<AuditEvent[]>(STORAGE_KEYS.AUDIT, initialAudit);
  },

  recordAudit(eventType: string, entityType: string, entityId: string, details: string): void {
    const auditLogs = this.getAuditLogs();
    const event: AuditEvent = {
      id: generateUUID(),
      username: 'admin',
      eventType,
      entityType,
      entityId,
      details,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    auditLogs.unshift(event);
    saveData(STORAGE_KEYS.AUDIT, auditLogs);
  },

  // Dashboard KPI
  getDashboardStats(): DashboardStats {
    const books = this.getBooks();
    const members = this.getMembers();
    const loans = this.getLoans();

    const totalBooks = books.length;
    const totalCopies = books.reduce((acc, b) => acc + (b.totalCopies || 1), 0);
    const totalAvailableCopies = books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
    const currentlyIssuedBooks = totalCopies - totalAvailableCopies;
    const overdueLoans = loans.filter((l) => l.status === 'OVERDUE').length;
    const totalMembers = members.length;
    const activeMembers = members.filter((m) => m.status === 'ACTIVE').length;

    return {
      totalBooks,
      totalCopies,
      totalAvailableCopies,
      currentlyIssuedBooks,
      overdueLoans,
      totalMembers,
      activeMembers,
    };
  },
};
