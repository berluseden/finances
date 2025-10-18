import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuments, getDocument, createDocument, updateDocument, deleteDocument } from '@/firebase/firestore';
import { useAuth } from '@/modules/auth/AuthContext';
import type { Account, AccountFormData } from '@/types/models';

// Hook para obtener todas las cuentas del usuario
export function useAccounts() {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: ['accounts', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) throw new Error('Usuario no autenticado');

      const accounts = await getDocuments<Account>('accounts', [
        { field: 'userId', operator: '==', value: currentUser.id }
      ]);

      return accounts;
    },
    enabled: !!currentUser,
  });
}

// Hook para obtener una cuenta específica
export function useAccount(accountId: string) {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: ['account', accountId],
    queryFn: async () => {
      if (!currentUser) throw new Error('Usuario no autenticado');
      if (!accountId) throw new Error('ID de cuenta no proporcionado');

      // Obtener el documento directamente por su ID
      const account = await getDocument<Account>('accounts', accountId);
      
      // Verificar que la cuenta pertenece al usuario
      if (account && account.userId !== currentUser.id) {
        throw new Error('No tienes permisos para ver esta cuenta');
      }

      return account;
    },
    enabled: !!currentUser && !!accountId,
  });
}

// Hook para crear una cuenta
export function useCreateAccount() {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  return useMutation({
    mutationFn: async (data: AccountFormData) => {
      if (!currentUser) throw new Error('Usuario no autenticado');

      const accountData = {
        userId: currentUser.id,
        ...data,
      };

      const accountId = await createDocument('accounts', accountData);
      return accountId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

// Hook para actualizar una cuenta
export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accountId, data }: { accountId: string; data: Partial<Account> }) => {
      await updateDocument('accounts', accountId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['account'] });
    },
  });
}

// Hook para eliminar una cuenta
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      await deleteDocument('accounts', accountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}