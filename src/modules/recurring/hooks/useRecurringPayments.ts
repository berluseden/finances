import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  collection, 
  query as firestoreQuery, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { firestoreCollections } from '@/firebase/firestore';
import { RecurringPayment } from '@/types/models';
import { useAuth } from '@/modules/auth/AuthContext';

/**
 * Hook para obtener todos los pagos recurrentes del usuario
 */
export function useRecurringPayments() {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: ['recurringPayments', firebaseUser?.uid],
    queryFn: async () => {
      if (!firebaseUser) throw new Error('User not authenticated');

      const q = firestoreQuery(
        collection(db, firestoreCollections.recurringPayments),
        where('userId', '==', firebaseUser.uid),
        orderBy('day', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RecurringPayment[];
    },
    enabled: !!firebaseUser,
  });
}

/**
 * Hook para obtener solo pagos recurrentes activos
 */
export function useActiveRecurringPayments() {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: ['recurringPayments', 'active', firebaseUser?.uid],
    queryFn: async () => {
      if (!firebaseUser) throw new Error('User not authenticated');

      const q = firestoreQuery(
        collection(db, firestoreCollections.recurringPayments),
        where('userId', '==', firebaseUser.uid),
        where('active', '==', true),
        orderBy('day', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RecurringPayment[];
    },
    enabled: !!firebaseUser,
  });
}

/**
 * Hook para crear un nuevo pago recurrente
 */
export function useCreateRecurringPayment() {
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<RecurringPayment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!firebaseUser) throw new Error('User not authenticated');

      const now = Timestamp.now();
      const recurringPayment = {
        ...data,
        userId: firebaseUser.uid,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(
        collection(db, firestoreCollections.recurringPayments),
        recurringPayment
      );

      return { id: docRef.id, ...recurringPayment };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringPayments'] });
    },
  });
}

/**
 * Hook para actualizar un pago recurrente existente
 */
export function useUpdateRecurringPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: Partial<Omit<RecurringPayment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> 
    }) => {
      const docRef = doc(db, firestoreCollections.recurringPayments, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringPayments'] });
    },
  });
}

/**
 * Hook para eliminar un pago recurrente
 */
export function useDeleteRecurringPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const docRef = doc(db, firestoreCollections.recurringPayments, id);
      await deleteDoc(docRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringPayments'] });
    },
  });
}

/**
 * Hook para activar/desactivar un pago recurrente
 */
export function useToggleRecurringPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const docRef = doc(db, firestoreCollections.recurringPayments, id);
      await updateDoc(docRef, {
        active,
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringPayments'] });
    },
  });
}
