import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuments, createDocument, updateDocument, deleteDocument } from '@/firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/modules/auth/AuthContext';
import type { Income, IncomeFormData } from '@/types/models';

// Hook para obtener todos los ingresos del usuario
export function useIncome() {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: ['income', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) throw new Error('Usuario no autenticado');

      const incomes = await getDocuments<Income>('income', [
        { field: 'userId', operator: '==', value: currentUser.id },
      ]);

      // Ordenar por fecha (más reciente primero)
      return incomes.sort((a, b) => b.date.toMillis() - a.date.toMillis());
    },
    enabled: !!currentUser,
  });
}

// Hook para obtener ingresos recurrentes
export function useRecurringIncome() {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: ['income', 'recurring', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) throw new Error('Usuario no autenticado');

      const incomes = await getDocuments<Income>('income', [
        { field: 'userId', operator: '==', value: currentUser.id },
        { field: 'recurring', operator: '==', value: true },
      ]);

      // Ordenar por día del mes
      return incomes.sort((a, b) => (a.recurringDay || 0) - (b.recurringDay || 0));
    },
    enabled: !!currentUser,
  });
}

// Hook para obtener ingresos del mes actual
export function useCurrentMonthIncome() {
  const { currentUser } = useAuth();
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return useQuery({
    queryKey: ['income', 'month', currentUser?.id, now.getMonth()],
    queryFn: async () => {
      if (!currentUser) throw new Error('Usuario no autenticado');

      const incomes = await getDocuments<Income>('income', [
        { field: 'userId', operator: '==', value: currentUser.id },
      ]);

      // Filtrar por mes actual
      const monthlyIncomes = incomes.filter((income) => {
        const date = income.date.toDate();
        return date >= firstDay && date <= lastDay;
      });

      // Calcular total
      const totalDOP = monthlyIncomes
        .filter((i) => i.currency === 'DOP')
        .reduce((sum, i) => sum + i.amount, 0);

      const totalUSD = monthlyIncomes
        .filter((i) => i.currency === 'USD')
        .reduce((sum, i) => sum + i.amount, 0);

      return {
        incomes: monthlyIncomes.sort((a, b) => b.date.toMillis() - a.date.toMillis()),
        totalDOP,
        totalUSD,
        count: monthlyIncomes.length,
      };
    },
    enabled: !!currentUser,
  });
}

// Hook para calcular ingresos proyectados del mes
export function useProjectedMonthlyIncome() {
  const { data: recurringIncome = [] } = useRecurringIncome();

  const totalDOP = recurringIncome
    .filter((i) => i.currency === 'DOP')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalUSD = recurringIncome
    .filter((i) => i.currency === 'USD')
    .reduce((sum, i) => sum + i.amount, 0);

  return {
    projectedDOP: totalDOP,
    projectedUSD: totalUSD,
    sources: recurringIncome.length,
  };
}

// Hook para crear ingreso
export function useCreateIncome() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IncomeFormData) => {
      if (!currentUser) throw new Error('Usuario no autenticado');

      const incomeData: Partial<Income> = {
        userId: currentUser.id,
        source: data.source,
        type: data.type,
        amount: data.amount,
        currency: data.currency,
        date: Timestamp.fromDate(data.date),
        recurring: data.recurring,
        recurringDay: data.recurring ? data.recurringDay : undefined,
        categoryId: data.categoryId,
        notes: data.notes,
      };

      return await createDocument('income', incomeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
    },
  });
}

// Hook para actualizar ingreso
export function useUpdateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      incomeId,
      data,
    }: {
      incomeId: string;
      data: Partial<IncomeFormData>;
    }) => {
      const updateData: Partial<Income> = {};

      if (data.source !== undefined) updateData.source = data.source;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.date) updateData.date = Timestamp.fromDate(data.date);
      if (data.recurring !== undefined) updateData.recurring = data.recurring;
      if (data.recurringDay !== undefined) updateData.recurringDay = data.recurringDay;
      if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
      if (data.notes !== undefined) updateData.notes = data.notes;

      await updateDocument('income', incomeId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
    },
  });
}

// Hook para eliminar ingreso
export function useDeleteIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incomeId: string) => {
      await deleteDocument('income', incomeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
    },
  });
}

// Hook para obtener próximos ingresos recurrentes
export function useUpcomingRecurringIncome() {
  const { data: recurringIncome = [] } = useRecurringIncome();
  const today = new Date();
  const currentDay = today.getDate();

  const upcoming = recurringIncome
    .map((income) => {
      const daysUntil = income.recurringDay! - currentDay;
      const isThisMonth = daysUntil >= 0;
      
      return {
        ...income,
        daysUntil: isThisMonth ? daysUntil : daysUntil + 30, // Aproximado
        nextDate: isThisMonth
          ? new Date(today.getFullYear(), today.getMonth(), income.recurringDay!)
          : new Date(today.getFullYear(), today.getMonth() + 1, income.recurringDay!),
      };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return upcoming;
}
