import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/Layout/AppLayout';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { BookList } from './pages/Books/BookList';
import { BookDetail } from './pages/Books/BookDetail';
import { MemberList } from './pages/Members/MemberList';
import { MemberDetail } from './pages/Members/MemberDetail';
import { ActiveLoans } from './pages/Loans/ActiveLoans';
import { OverdueLoans } from './pages/Loans/OverdueLoans';
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

// Guard component for role-restricted routes
const RoleGuard: React.FC<{ roles: ('ADMIN' | 'LIBRARIAN' | 'MEMBER')[]; children: React.ReactNode }> = ({
  roles,
  children,
}) => {
  const { hasRole, user } = useAuth();

  if (!hasRole(roles)) {
    return <Navigate to={user?.role === 'MEMBER' ? '/books' : '/'} replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<Login />} />

              {/* Authenticated routes within AppLayout */}
              <Route path="/" element={<AppLayout />}>
                <Route
                  index
                  element={
                    <RoleGuard roles={['ADMIN', 'LIBRARIAN']}>
                      <Dashboard />
                    </RoleGuard>
                  }
                />

                {/* Books */}
                <Route path="books" element={<BookList />} />
                <Route path="books/:id" element={<BookDetail />} />

                {/* Members */}
                <Route
                  path="members"
                  element={
                    <RoleGuard roles={['ADMIN', 'LIBRARIAN']}>
                      <MemberList />
                    </RoleGuard>
                  }
                />
                <Route path="members/:id" element={<MemberDetail />} />

                {/* Loans */}
                <Route path="loans" element={<ActiveLoans />} />
                <Route
                  path="loans/overdue"
                  element={
                    <RoleGuard roles={['ADMIN', 'LIBRARIAN']}>
                      <OverdueLoans />
                    </RoleGuard>
                  }
                />

                {/* Admin Only */}
                <Route
                  path="users"
                  element={
                    <RoleGuard roles={['ADMIN']}>
                      <UserManagement />
                    </RoleGuard>
                  }
                />
                <Route
                  path="audit"
                  element={
                    <RoleGuard roles={['ADMIN']}>
                      <AuditLogs />
                    </RoleGuard>
                  }
                />

                {/* 404 */}
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
