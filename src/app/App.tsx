import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/modules/auth/LoginPage';
import { RegisterPage } from '@/modules/auth/RegisterPage';
import { ProtectedRoute } from '@/modules/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardPage } from '@/modules/dashboard/DashboardPage';
import { CalendarPage } from '@/modules/calendar/CalendarPage';
import { AccountsPage } from '@/modules/accounts/AccountsPage';
import { AccountWizard } from '@/modules/accounts/AccountWizard';
import { AccountDetail } from '@/modules/accounts/AccountDetail';
import { TransactionsPage } from '@/modules/transactions/TransactionsPage';
import { RecurringPage } from '@/modules/recurring/RecurringPage';
import { IncomePage } from '@/modules/income/IncomePage';
import { CategoriesPage } from '@/modules/categories/CategoriesPage';
import { BudgetsPage } from '@/modules/budgets/BudgetsPage';
import { AdminPage } from '@/modules/admin/AdminPage';
import { AIInsightsPage } from '@/modules/ai/AIInsightsPage';
import { useAuth } from '@/modules/auth/AuthContext';
import { useEffect, useRef, useState } from 'react';

function App() {
  const { currentUser } = useAuth();
  const [showOfflineBanner, setShowOfflineBanner] = useState(!navigator.onLine);
  const offlineTimerRef = useRef<number | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      // Ocultar banner inmediatamente y limpiar temporizador
      setShowOfflineBanner(false);
      if (offlineTimerRef.current) {
        window.clearTimeout(offlineTimerRef.current);
        offlineTimerRef.current = null;
      }
    };
    const handleOffline = () => {
      // Mostrar el banner sólo si se mantiene offline > 2s (evita parpadeos breves)
      if (offlineTimerRef.current) window.clearTimeout(offlineTimerRef.current);
      offlineTimerRef.current = window.setTimeout(() => setShowOfflineBanner(true), 2000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {showOfflineBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-3">
          <span>Sin conexión a internet. Los datos se sincronizarán cuando vuelvas a estar en línea.</span>
          <button
            onClick={() => window.location.reload()}
            className="ml-2 underline decoration-white/80 underline-offset-2 hover:text-white"
          >
            Reintentar
          </button>
        </div>
      )}
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={currentUser ? <Navigate to="/" replace /> : <RegisterPage />} />
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
                  <Route path="/accounts/:accountId" element={<AccountDetail />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/income" element={<IncomePage />} />
                  <Route path="/recurring" element={<RecurringPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/budgets" element={<BudgetsPage />} />
                  <Route path="/ai-insights" element={<AIInsightsPage />} />
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
