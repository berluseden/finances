import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/AuthContext';
import { useAccounts } from '@/modules/accounts/hooks/useAccounts';
import { useRecurringPayments } from '@/modules/recurring/hooks/useRecurringPayments';
import {
  generatePaymentPlan,
  identifyReducibleExpenses,
  generateFinancialAlerts,
  predictFutureBalance,
  analyzeFinancialHealth,
  generateFinancialRecommendations,
  type FinancialContext,
  type StatementData,
} from '@/lib/openai';

/**
 * Hook para obtener el contexto financiero del usuario
 */
export function useFinancialContext(): FinancialContext | null {
  const { data: accounts } = useAccounts();
  const { data: recurringPayments } = useRecurringPayments();

  if (!accounts || !recurringPayments) return null;

  // Calcular totales de gastos del mes
  const totalRecurring = recurringPayments
    .filter((p) => p.active)
    .reduce((sum, p) => {
      // Convertir todo a DOP para simplificar (1 USD = ~59 DOP aproximadamente)
      const amountInDOP = p.currency === 'USD' ? p.amount * 59 : p.amount;
      return sum + amountInDOP;
    }, 0);

  const totalAccountBalances = accounts.reduce((sum, acc) => {
    const balanceDOP = acc.balancePrimary || 0;
    const balanceUSD = (acc.balanceSecondary || 0) * 59;
    return sum + balanceDOP + balanceUSD;
  }, 0);

  return {
    accounts: accounts.map((acc) => ({
      name: acc.name,
      type: acc.type,
      balanceDOP: acc.balancePrimary || 0,
      balanceUSD: acc.balanceSecondary || 0,
      limitDOP: acc.limitPrimary,
      limitUSD: acc.limitSecondary,
      dueDate: acc.cutDay
        ? new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            acc.cutDay + (acc.dueDaysOffset || 20)
          )
        : undefined,
    })),
    recurringPayments: recurringPayments
      .filter((p) => p.active)
      .map((p) => ({
        name: p.name,
        amount: p.amount,
        currency: p.currency,
        day: p.day,
      })),
    totalMonthlyExpenses: totalRecurring,
    totalDebt: totalAccountBalances,
  };
}

/**
 * Hook para generar plan de pagos inteligente
 */
export function usePaymentPlan() {
  const { currentUser } = useAuth();
  const context = useFinancialContext();

  return useQuery({
    queryKey: ['ai', 'payment-plan', currentUser?.id],
    queryFn: async () => {
      if (!context) throw new Error('Contexto financiero no disponible');
      return await generatePaymentPlan(context);
    },
    enabled: !!currentUser && !!context,
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24, // 24 horas (antes cacheTime)
  });
}

/**
 * Hook para identificar gastos reducibles
 */
export function useReducibleExpenses(statements: StatementData[]) {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: ['ai', 'reducible-expenses', currentUser?.id, statements.length],
    queryFn: async () => {
      if (statements.length === 0) return [];
      return await identifyReducibleExpenses(statements);
    },
    enabled: !!currentUser && statements.length > 0,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

/**
 * Hook para generar alertas financieras
 */
export function useFinancialAlerts() {
  const { currentUser } = useAuth();
  const context = useFinancialContext();

  return useQuery({
    queryKey: ['ai', 'financial-alerts', currentUser?.id],
    queryFn: async () => {
      if (!context) return [];
      return await generateFinancialAlerts(context);
    },
    enabled: !!currentUser && !!context,
    staleTime: 1000 * 60 * 30, // 30 minutos
    refetchInterval: 1000 * 60 * 60, // Refrescar cada hora
  });
}

/**
 * Hook para predecir saldo futuro
 */
export function useFutureBalancePrediction(
  statements: StatementData[],
  monthsAhead: number = 3
) {
  const { currentUser } = useAuth();
  const context = useFinancialContext();

  return useQuery({
    queryKey: [
      'ai',
      'future-balance',
      currentUser?.id,
      statements.length,
      monthsAhead,
    ],
    queryFn: async () => {
      if (!context || statements.length < 2) {
        return {
          predictions: [],
          analysis: 'Se necesitan al menos 2 meses de historial para generar predicciones.',
        };
      }
      return await predictFutureBalance(
        statements,
        context.recurringPayments,
        monthsAhead
      );
    },
    enabled: !!currentUser && !!context && statements.length >= 2,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

/**
 * Hook para analizar salud financiera
 */
export function useFinancialHealthScore() {
  const { currentUser } = useAuth();
  const context = useFinancialContext();

  return useQuery({
    queryKey: ['ai', 'health-score', currentUser?.id],
    queryFn: async () => {
      if (!context) {
        return {
          score: 0,
          grade: 'F' as const,
          strengths: [],
          weaknesses: ['No hay datos disponibles'],
          recommendations: [],
          summary: 'Agrega cuentas para obtener tu score financiero.',
        };
      }
      return await analyzeFinancialHealth(context);
    },
    enabled: !!currentUser && !!context,
    staleTime: 1000 * 60 * 60 * 12, // 12 horas
  });
}

/**
 * Hook para generar recomendaciones generales
 */
export function useAIRecommendations(statementData?: StatementData) {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: ['ai', 'recommendations', currentUser?.id, statementData?.cutDate],
    queryFn: async () => {
      if (!statementData) return [];
      return await generateFinancialRecommendations(statementData);
    },
    enabled: !!currentUser && !!statementData,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

/**
 * Hook para verificar si el usuario tiene créditos de IA disponibles
 * (útil para controlar el uso y costos)
 */
export function useAICredits() {
  // Por ahora, retornamos ilimitado
  // En producción, esto debería consultar un contador en Firestore
  return {
    hasCredits: true,
    remaining: Infinity,
    total: Infinity,
    resetDate: null,
  };
}
