import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/AuthContext';
import { getDocuments } from '@/firebase/firestore';
import type { Transaction, Account, Statement } from '@/types/models';
import { detectRecurringExpenses } from '@/services/ai';

export interface FinancialContext {
  // Datos básicos
  userId: string;
  lastUpdated: Date;

  // Datos de cuentas
  accounts: Account[];
  totalBalance: number;
  totalBalanceDOP: number;
  totalBalanceUSD: number;

  // Datos de transacciones
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  monthlyIncome: number;
  monthlyExpenses: number;

  // Datos de estados de cuenta
  statements: Statement[];
  latestStatementDate?: Date;

  // Datos de gastos recurrentes
  recurringExpenses: Array<{
    description: string;
    amount: number;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
    confidence: number;
    lastSeen: string;
  }>;

  // Análisis agregado
  categories: Record<string, number>;
  topCategories: Array<{ name: string; amount: number }>;
  savingsRate: number;
  spendingRate: number;

  // Información contexto
  financialHealth: 'excellent' | 'good' | 'fair' | 'poor';
  summary: string;
}

/**
 * Hook que carga TODA la información financiera del usuario desde Firestore
 * Esto proporciona contexto completo a los servicios de IA
 *
 * @returns Contexto financiero completo del usuario
 *
 * @example
 * ```typescript
 * const { data: context, isLoading } = useFinancialContext();
 * if (context) {
 *   const recommendations = await generateFinancialRecommendations({
 *     transactions: context.transactions,
 *     monthlyIncome: context.monthlyIncome,
 *     monthlyExpenses: context.monthlyExpenses,
 *   });
 * }
 * ```
 */
export function useFinancialContext() {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: ['financialContext', currentUser?.id],
    queryFn: async (): Promise<FinancialContext> => {
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      console.log('[useFinancialContext] 🔄 Cargando contexto financiero del usuario...');

      try {
        // Cargar todas las cuentas
        console.log('[useFinancialContext] 📊 Cargando cuentas...');
        const accounts = await getDocuments<Account>('accounts', [
          { field: 'userId', operator: '==', value: currentUser.id },
        ]);

        // Cargar todas las transacciones
        console.log('[useFinancialContext] 💳 Cargando transacciones...');
        const transactions = await getDocuments<Transaction>('transactions', [
          { field: 'userId', operator: '==', value: currentUser.id },
        ]);

        // Cargar todos los estados de cuenta
        console.log('[useFinancialContext] 📄 Cargando estados de cuenta...');
        const statements = await getDocuments<Statement>('statements', [
          { field: 'userId', operator: '==', value: currentUser.id },
        ]);

        // Cargar gastos recurrentes guardados (si existen)
        console.log('[useFinancialContext] 🔄 Cargando gastos recurrentes...');
        let recurringExpensesData: any[] = [];
        try {
          recurringExpensesData = await getDocuments('recurringPayments', [
            { field: 'userId', operator: '==', value: currentUser.id },
          ]);
        } catch (error) {
          console.warn('[useFinancialContext] No hay gastos recurrentes guardados');
        }

        // Calcular totales de cuentas
        const totalBalanceDOP = accounts.reduce((sum, acc) => {
          return sum + ((acc as Account).balancePrimary || 0);
        }, 0);
        const totalBalanceUSD = accounts.reduce((sum, acc) => {
          return sum + ((acc as Account).balanceSecondary || 0);
        }, 0);

        // Calcular ingresos y gastos
        const charges = transactions.filter((tx) => (tx as Transaction).type === 'charge');
        const payments = transactions.filter((tx) => (tx as Transaction).type === 'payment');

        const totalExpenses = charges.reduce((sum, tx) => sum + Math.abs((tx as Transaction).amount), 0);
        const totalIncome = payments.reduce((sum, tx) => sum + (tx as Transaction).amount, 0);

        // Analizar por mes
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const currentMonthTransactions = transactions.filter((tx) => {
          const typedTx = tx as Transaction;
          const txDate = typedTx.date.toDate ? typedTx.date.toDate() : new Date(typedTx.date as any);
          const txMonth = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
          return txMonth === currentMonth;
        });

        const currentMonthCharges = currentMonthTransactions.filter((tx) => (tx as Transaction).type === 'charge');
        const currentMonthPayments = currentMonthTransactions.filter((tx) => (tx as Transaction).type === 'payment');

        const monthlyExpenses = currentMonthCharges.reduce((sum, tx) => sum + Math.abs((tx as Transaction).amount), 0);
        const monthlyIncome = currentMonthPayments.reduce((sum, tx) => sum + (tx as Transaction).amount, 0);

        // Agrupar por categoría
        const categories: Record<string, number> = {};
        charges.forEach((tx) => {
          const typedTx = tx as Transaction;
          const category = typedTx.description || 'Sin categoría';
          categories[category] = (categories[category] || 0) + Math.abs(typedTx.amount);
        });

        const topCategories = Object.entries(categories)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, amount]) => ({ name, amount }));

        // Detectar gastos recurrentes automáticamente
        console.log('[useFinancialContext] 🔍 Detectando gastos recurrentes...');
        const detectedRecurring = await detectRecurringExpenses(transactions as any);

        // Combinar con los guardados
        const recurringExpenses = [
          ...recurringExpensesData,
          ...detectedRecurring.filter(
            (detected) => !recurringExpensesData.some((saved) => saved.description === detected.description)
          ),
        ];

        // Calcular tasas
        const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0;
        const spendingRate = 1 - savingsRate;

        // Determinar salud financiera
        let financialHealth: FinancialContext['financialHealth'] = 'fair';
        if (savingsRate >= 0.3) financialHealth = 'excellent';
        else if (savingsRate >= 0.2) financialHealth = 'good';
        else if (savingsRate >= 0.1) financialHealth = 'fair';
        else financialHealth = 'poor';

        // Generar resumen
        const summary = `
Contexto Financiero del Usuario:
- Saldo total: $${(totalBalanceDOP + totalBalanceUSD).toLocaleString()}
- Ingresos mensuales: $${monthlyIncome.toLocaleString()}
- Gastos mensuales: $${monthlyExpenses.toLocaleString()}
- Tasa de ahorro: ${(savingsRate * 100).toFixed(1)}%
- Transacciones: ${transactions.length}
- Gastos recurrentes: ${recurringExpenses.length}
- Top categorías: ${topCategories
          .slice(0, 3)
          .map((c) => `${c.name} ($${c.amount.toLocaleString()})`)
          .join(', ')}
        `.trim();

        const context: FinancialContext = {
          userId: currentUser.id,
          lastUpdated: new Date(),
          accounts: accounts as Account[],
          totalBalance: totalBalanceDOP + totalBalanceUSD,
          totalBalanceDOP,
          totalBalanceUSD,
          transactions: transactions as Transaction[],
          totalIncome,
          totalExpenses,
          monthlyIncome,
          monthlyExpenses,
          statements: statements as Statement[],
          recurringExpenses,
          categories,
          topCategories,
          savingsRate,
          spendingRate,
          financialHealth,
          summary,
        };

        console.log('[useFinancialContext] ✅ Contexto financiero cargado:', {
          cuentas: accounts.length,
          transacciones: transactions.length,
          ingresos: monthlyIncome,
          gastos: monthlyExpenses,
          gastosRecurrentes: recurringExpenses.length,
          saludFinanciera: financialHealth,
        });

        return context;
      } catch (error) {
        console.error('[useFinancialContext] ❌ Error cargando contexto:', error);
        throw error;
      }
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}
