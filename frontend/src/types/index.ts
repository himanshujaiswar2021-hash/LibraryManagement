export type UserRole = 'ADMIN' | 'LIBRARIAN' | 'MEMBER';

export type BookStatus = 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';

export type MemberStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export type LoanStatus = 'ISSUED' | 'RETURNED' | 'OVERDUE' | 'LOST' | 'CANCELLED';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  subtitle?: string;
  publisher?: string;
  publicationYear?: number;
  description?: string;
  language: string;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
  shelfLocation?: string;
  coverImageUrl?: string;
  status: BookStatus;
  authors?: Author[];
  categories?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  membershipNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  status: MemberStatus;
  maxLoans: number;
  activeLoansCount: number;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: string;
  loanNumber: string;
  book: Book;
  member: Member;
  issuedById: string;
  issuedByUsername: string;
  returnedById?: string;
  returnedByUsername?: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: LoanStatus;
  renewalCount: number;
  fineAmount: number;
  notes?: string;
  overdue: boolean;
  daysOverdue: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId?: string;
  username?: string;
  eventType: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  details?: string;
}

export interface DashboardStats {
  totalBooks: number;
  totalCopies: number;
  totalAvailableCopies: number;
  currentlyIssuedBooks: number;
  overdueLoans: number;
  totalMembers: number;
  activeMembers: number;
}

export interface MostBorrowedBook {
  bookId: string;
  title: string;
  isbn: string;
  borrowCount: number;
}

export interface OverdueMemberSummary {
  memberId: string;
  membershipNumber: string;
  fullName: string;
  email: string;
  overdueLoansCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    fieldErrors?: { field: string; message: string }[];
  };
  requestId?: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Microservice 1: Notification Types
export type NotificationType =
  | 'LOAN_ISSUED'
  | 'LOAN_RETURNED'
  | 'LOAN_DUE_SOON'
  | 'OVERDUE_ALERT'
  | 'RESERVATION_READY'
  | 'RESERVATION_CANCELLED'
  | 'PAYMENT_CONFIRMATION'
  | 'FINE_INVOICE'
  | 'GENERAL_ANNOUNCEMENT';

export type DeliveryChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';
export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';

export interface NotificationItem {
  id: string;
  recipientId: string;
  recipientEmail: string;
  recipientPhone?: string;
  type: NotificationType;
  channel: DeliveryChannel;
  title: string;
  message: string;
  status: NotificationStatus;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// Microservice 2: Reservation Types
export type ReservationStatus = 'PENDING' | 'READY_FOR_PICKUP' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';

export interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  bookIsbn: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  status: ReservationStatus;
  queuePosition: number;
  readyAt?: string;
  pickupDeadline?: string;
  fulfilledAt?: string;
  cancelledAt?: string;
  createdAt: string;
}

export interface ReservationStats {
  totalReservations: number;
  pendingReservations: number;
  readyForPickup: number;
  fulfilledReservations: number;
  cancelledReservations: number;
}

// Microservice 3: Payment & Fine Types
export type FineStatus = 'UNPAID' | 'PAID' | 'WAIVED';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'CASH' | 'WAIVER';
export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

export interface Fine {
  id: string;
  loanId: string;
  loanNumber: string;
  memberId: string;
  memberName: string;
  bookId: string;
  bookTitle: string;
  overdueDays: number;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: FineStatus;
  notes?: string;
  paidAt?: string;
  waivedAt?: string;
  waivedBy?: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  transactionReference: string;
  fineId: string;
  memberId: string;
  amount: number;
  method: PaymentMethod;
  status: TransactionStatus;
  receiptNumber: string;
  processedBy: string;
  createdAt: string;
}

export interface PaymentStats {
  totalRevenueCollected: number;
  totalOutstandingFines: number;
  unpaidFinesCount: number;
  paidFinesCount: number;
  waivedFinesCount: number;
}

