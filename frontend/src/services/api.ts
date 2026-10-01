import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  ApiResponse,
  PagedResponse,
  User,
  Book,
  Author,
  Category,
  Member,
  Loan,
  AuditEvent,
  DashboardStats,
  MostBorrowedBook,
  OverdueMemberSummary,
  BookStatus,
  MemberStatus,
  LoanStatus,
  UserRole
} from '../types';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh token interceptor
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post<ApiResponse<{ accessToken: string; expiresIn: number }>>('/api/v1/auth/refresh', {}, { withCredentials: true });
        const newAccessToken = refreshResponse.data.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: async (username: string, password: string) => {
    const res = await apiClient.post<ApiResponse<{ accessToken: string; user: User }>>('/auth/login', { username, password });
    return res.data;
  },
  refresh: async () => {
    const res = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },
};

// Books & Catalog endpoints
export const bookApi = {
  search: async (params?: {
    search?: string;
    categoryId?: string;
    authorId?: string;
    availableOnly?: boolean;
    status?: BookStatus;
    page?: number;
    size?: number;
    sort?: string;
  }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Book>>>('/books', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Book>>(`/books/${id}`);
    return res.data;
  },
  create: async (data: Partial<Book> & { authorIds?: string[]; categoryIds?: string[] }) => {
    const res = await apiClient.post<ApiResponse<Book>>('/books', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Book> & { authorIds?: string[]; categoryIds?: string[] }) => {
    const res = await apiClient.put<ApiResponse<Book>>(`/books/${id}`, data);
    return res.data;
  },
  updateStatus: async (id: string, status: BookStatus) => {
    const res = await apiClient.patch<ApiResponse<Book>>(`/books/${id}/status`, { status });
    return res.data;
  },
};

// Authors endpoints
export const authorApi = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<Author[]>>('/authors');
    return res.data;
  },
  create: async (data: { name: string; bio?: string }) => {
    const res = await apiClient.post<ApiResponse<Author>>('/authors', data);
    return res.data;
  },
};

// Categories endpoints
export const categoryApi = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return res.data;
  },
  create: async (data: { name: string; description?: string }) => {
    const res = await apiClient.post<ApiResponse<Category>>('/categories', data);
    return res.data;
  },
};

// Members endpoints
export const memberApi = {
  search: async (params?: { search?: string; status?: MemberStatus; page?: number; size?: number }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Member>>>('/members', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Member>>(`/members/${id}`);
    return res.data;
  },
  create: async (data: Partial<Member>) => {
    const res = await apiClient.post<ApiResponse<Member>>('/members', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Member>) => {
    const res = await apiClient.put<ApiResponse<Member>>(`/members/${id}`, data);
    return res.data;
  },
  updateStatus: async (id: string, status: MemberStatus, reason?: string) => {
    const res = await apiClient.patch<ApiResponse<Member>>(`/members/${id}/status`, { status, reason });
    return res.data;
  },
  getActiveLoans: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Loan[]>>(`/members/${id}/loans`);
    return res.data;
  },
  getLoanHistory: async (id: string, params?: { page?: number; size?: number }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Loan>>>(`/members/${id}/loans/history`, { params });
    return res.data;
  },
};

// Loans endpoints
export const loanApi = {
  search: async (params?: { status?: LoanStatus; memberId?: string; bookId?: string; overdueOnly?: boolean; page?: number; size?: number }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Loan>>>('/loans', { params });
    return res.data;
  },
  getOverdue: async (params?: { page?: number; size?: number }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Loan>>>('/loans/overdue', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Loan>>(`/loans/${id}`);
    return res.data;
  },
  issue: async (data: { bookId: string; memberId: string; dueDate?: string; notes?: string }) => {
    const res = await apiClient.post<ApiResponse<Loan>>('/loans/issue', data);
    return res.data;
  },
  return: async (id: string, notes?: string) => {
    const res = await apiClient.post<ApiResponse<Loan>>(`/loans/${id}/return`, { notes });
    return res.data;
  },
  renew: async (id: string) => {
    const res = await apiClient.post<ApiResponse<Loan>>(`/loans/${id}/renew`);
    return res.data;
  },
  markLost: async (id: string) => {
    const res = await apiClient.post<ApiResponse<Loan>>(`/loans/${id}/lost`);
    return res.data;
  },
  cancel: async (id: string) => {
    const res = await apiClient.post<ApiResponse<Loan>>(`/loans/${id}/cancel`);
    return res.data;
  },
};

// Dashboard endpoints
export const dashboardApi = {
  getStats: async () => {
    const res = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return res.data;
  },
  getRecentActivity: async () => {
    const res = await apiClient.get<ApiResponse<Loan[]>>('/dashboard/recent-activity');
    return res.data;
  },
  getMostBorrowed: async () => {
    const res = await apiClient.get<ApiResponse<MostBorrowedBook[]>>('/dashboard/most-borrowed');
    return res.data;
  },
  getOverdueMembers: async () => {
    const res = await apiClient.get<ApiResponse<OverdueMemberSummary[]>>('/dashboard/overdue-members');
    return res.data;
  },
};

// Users endpoints
export const userApi = {
  search: async (params?: { role?: UserRole; active?: boolean; search?: string; page?: number; size?: number }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<User>>>('/users', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return res.data;
  },
  create: async (data: { username: string; email: string; password: string; fullName: string; role: UserRole }) => {
    const res = await apiClient.post<ApiResponse<User>>('/users', data);
    return res.data;
  },
  update: async (id: string, data: { email: string; fullName: string; role: UserRole }) => {
    const res = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
    return res.data;
  },
  updateStatus: async (id: string, active: boolean) => {
    const res = await apiClient.patch<ApiResponse<User>>(`/users/${id}/status`, { active });
    return res.data;
  },
  changePassword: async (id: string, data: { oldPassword?: string; newPassword: string }) => {
    const res = await apiClient.put<ApiResponse<void>>(`/users/${id}/password`, data);
    return res.data;
  },
};

// Audit logs endpoints
export const auditApi = {
  search: async (params?: { eventType?: string; entityType?: string; entityId?: string; username?: string; fromDate?: string; toDate?: string; page?: number; size?: number }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<AuditEvent>>>('/audit', { params });
    return res.data;
  },
};
