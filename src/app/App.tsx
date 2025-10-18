import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/modules/auth/LoginPage';
import { ProtectedRoute } from '@/modules/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardPage } from '@/modules/dashboard/DashboardPage';
import { CalendarPage } from '@/modules/calendar/CalendarPage';
import { AccountsPage } from '@/modules/accounts/AccountsPage';
import { AccountWizard } from '@/modules/accounts/AccountWizard';
import { TransactionsPage } from '@/modules/transactions/TransactionsPage';
import { RecurringPage } from '@/modules/recurring/RecurringPage';
import { AdminPage } from '@/modules/admin/AdminPage';
import { useAuth } from '@/modules/auth/AuthContext';
import { useEffect, useState } from 'react';

function App() {
  const { currentUser } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium">
          Sin conexión a internet. Los datos se sincronizarán cuando vuelvas a estar en línea.
        </div>
      )}
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/accounts" element={<AccountsPage />} />
                  <Route path="/accounts/new" element={<AccountWizard />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/recurring" element={<RecurringPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
