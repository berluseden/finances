import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuments, createDocument, updateDocument, deleteDocument } from '@/firebase/firestore';
import { useAuth } from '@/modules/auth/AuthContext';
import { Budget } from '@/types/models';

export function useBudgets() {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: ['budgets', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];

      const budgets = await getDocuments('budgets', [
        { field: 'userId', operator: '==', value: currentUser.id }
      ]);

      return budgets as Budget[];
    },
    enabled: !!currentUser,
  });
}

// Hook para obtener presupuesto del mes actual
export function useCurrentBudget() {
  const { currentUser } = useAuth();
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return useQuery({
    queryKey: ['budget', 'current', currentUser?.id, monthKey],
    queryFn: async () => {
      if (!currentUser) return null;

      const budgets = await getDocuments<Budget>('budgets', [
        { field: 'userId', operator: '==', value: currentUser.id },
        { field: 'month', operator: '==', value: monthKey },
      ]);

      return budgets[0] || null;
    },
    enabled: !!currentUser,
  });
}

// Hook para calcular progreso del presupuesto
export function useBudgetProgress() {
  const { data: budget } = useCurrentBudget();

  if (!budget) {
    return {
      totalPlanned: 0,
      totalActual: 0,
      remaining: 0,
      percentage: 0,
      isOverBudget: false,
      budget: null,
    };
  }

  const totalPlanned = budget.totalPlannedDOP + (budget.totalPlannedUSD * 58.5); // Convertir USD a DOP
  const totalActual = budget.totalActualDOP + (budget.totalActualUSD * 58.5);
  const remaining = totalPlanned - totalActual;
  const percentage = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;

  return {
    totalPlanned,
    totalActual,
    remaining,
    percentage: Math.min(percentage, 100),
    isOverBudget: totalActual > totalPlanned,
    budget,
  };
}

export function useCreateBudget() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budget: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!currentUser) throw new Error('User not authenticated');

      const budgetData = {
        ...budget,
        userId: currentUser.id,
      };

      return await createDocument('budgets', budgetData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Budget> & { id: string }) => {
      const budgetData = {
        ...updates,
      };

      return await updateDocument('budgets', id, budgetData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteDocument('budgets', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
    },
  });
}