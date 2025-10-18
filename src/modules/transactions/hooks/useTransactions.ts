import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuments, createDocument, updateDocument, deleteDocument } from '@/firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/firebase/firebase';
import { useAuth } from '@/modules/auth/AuthContext';
import type { Transaction, TransactionFormData } from '@/types/models';

// Hook para obtener transacciones con filtros
export function useTransactions(filters?: {
  accountId?: string;
  statementId?: string;
  startDate?: Date;
  endDate?: Date;
  type?: Transaction['type'];
  currency?: Transaction['currency'];
}) {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: ['transactions', currentUser?.id, filters],
    queryFn: async () => {
      if (!currentUser) throw new Error('Usuario no autenticado');

      let queryConstraints: Array<{ field: string; operator: any; value: any }> = [
        { field: 'userId', operator: '==', value: currentUser.id }
      ];

      if (filters?.accountId) {
        queryConstraints.push({ field: 'accountId', operator: '==', value: filters.accountId });
      }

      if (filters?.statementId) {
        queryConstraints.push({ field: 'statementId', operator: '==', value: filters.statementId });
      }

      if (filters?.type) {
        queryConstraints.push({ field: 'type', operator: '==', value: filters.type });
      }

      if (filters?.currency) {
        queryConstraints.push({ field: 'currency', operator: '==', value: filters.currency });
      }

      // Para fechas, necesitamos queries separadas ya que Firestore no soporta range queries complejas
      let transactions = await getDocuments<Transaction>('transactions', queryConstraints);

      // Filtrar por fechas en el cliente
      if (filters?.startDate || filters?.endDate) {
        transactions = transactions.filter(t => {
          const transactionDate = t.date.toDate();
          if (filters.startDate && transactionDate < filters.startDate) return false;
          if (filters.endDate && transactionDate > filters.endDate) return false;
          return true;
        });
      }

      return transactions.sort((a, b) => b.date.toMillis() - a.date.toMillis());
    },
    enabled: !!currentUser,
  });
}

// Hook para obtener una transacción específica
export function useTransaction(transactionId: string) {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async () => {
      if (!currentUser) throw new Error('Usuario no autenticado');

      const transactions = await getDocuments<Transaction>('transactions', [
        { field: 'id', operator: '==', value: transactionId },
        { field: 'userId', operator: '==', value: currentUser.id }
      ]);

      return transactions[0] || null;
    },
    enabled: !!currentUser && !!transactionId,
  });
}

// Hook para crear transacción
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  return useMutation({
    mutationFn: async (data: TransactionFormData) => {
      if (!currentUser) throw new Error('Usuario no autenticado');

      let receiptPath: string | undefined;

      // Subir recibo si existe
      if (data.receiptFile) {
        const fileName = `${Date.now()}_${data.receiptFile.name}`;
        const path = `receipts/${currentUser.id}/${fileName}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, data.receiptFile);
        receiptPath = await getDownloadURL(storageRef);
      }

      const transactionData = {
        userId: currentUser.id,
        accountId: data.accountId,
        date: data.date,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        type: data.type,
        categoryId: data.categoryId,
        note: data.note,
        receiptPath,
      };

      const transactionId = await createDocument('transactions', transactionData);
      return transactionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// Hook para actualizar transacción
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      data
    }: {
      transactionId: string;
      data: Partial<TransactionFormData & { receiptFile?: File }>;
    }) => {
      let updateData: any = { ...data };
      delete updateData.receiptFile;

      // Si hay nuevo archivo de recibo, subirlo
      if (data.receiptFile) {
        const { currentUser } = useAuth();
        if (!currentUser) throw new Error('Usuario no autenticado');

        const fileName = `${Date.now()}_${data.receiptFile.name}`;
        const path = `receipts/${currentUser.id}/${fileName}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, data.receiptFile);
        const receiptPath = await getDownloadURL(storageRef);
        updateData.receiptPath = receiptPath;
      }

      await updateDocument('transactions', transactionId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction'] });
    },
  });
}

// Hook para eliminar transacción
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      // Obtener la transacción para eliminar el archivo de storage si existe
      const transactions = await getDocuments<Transaction>('transactions', [
        { field: 'id', operator: '==', value: transactionId }
      ]);
      
      const transaction = transactions[0];

      if (transaction?.receiptPath) {
        const storageRef = ref(storage, transaction.receiptPath);
        try {
          await deleteObject(storageRef);
        } catch (error) {
          console.warn('Error deleting receipt file:', error);
        }
      }

      await deleteDocument('transactions', transactionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}