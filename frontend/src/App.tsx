import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/Layout/AppLayout';

import { Dashboard } from './pages/Dashboard';
import { BookList } from './pages/Books/BookList';
import { BookDetail } from './pages/Books/BookDetail';
import { MemberList } from './pages/Members/MemberList';
import { MemberDetail } from './pages/Members/MemberDetail';
import { ActiveLoans } from './pages/Loans/ActiveLoans';
import { OverdueLoans } from './pages/Loans/OverdueLoans';
import { ReservationsList } from './pages/Reservations/ReservationsList';
import { PaymentsList } from './pages/Payments/PaymentsList';
import { UserManagement } from './pages/Users/UserManagement';
import { AuditLogs } from './pages/Audit/AuditLogs';
import { NotFound } from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Direct access to entire library management system */}
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />

                {/* Books Catalog */}
                <Route path="books" element={<BookList />} />
                <Route path="books/:id" element={<BookDetail />} />

                {/* Members */}
                <Route path="members" element={<MemberList />} />
                <Route path="members/:id" element={<MemberDetail />} />

                {/* Loans & Circulation */}
                <Route path="loans" element={<ActiveLoans />} />
                <Route path="loans/overdue" element={<OverdueLoans />} />

                {/* Microservices: Reservations & Financial Payments */}
                <Route path="reservations" element={<ReservationsList />} />
                <Route path="payments" element={<PaymentsList />} />

                {/* Staff & Audit Administration */}
                <Route path="users" element={<UserManagement />} />
                <Route path="audit" element={<AuditLogs />} />

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
