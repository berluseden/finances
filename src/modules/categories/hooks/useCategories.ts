import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { getDocuments, firestoreCollections } from '@/firebase/firestore';
import { useAuth } from '@/modules/auth/AuthContext';
import { Category } from '@/types/models';
import toast from 'react-hot-toast';

export function useCategories() {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: ['categories', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];

      const categories = await getDocuments('categories', [
        { field: 'userId', operator: '==', value: currentUser.id }
      ]);

      return categories as Category[];
    },
    enabled: !!currentUser,
  });
}

export function useCreateCategory() {
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!firebaseUser) throw new Error('User not authenticated');

      const now = Timestamp.now();
      const category = {
        ...data,
        userId: firebaseUser.uid,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(
        collection(db, firestoreCollections.categories),
        category
      );

      return { id: docRef.id, ...category };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoría creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast.error('Error al crear la categoría');
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: Partial<Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> 
    }) => {
      const docRef = doc(db, firestoreCollections.categories, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoría actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast.error('Error al actualizar la categoría');
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const docRef = doc(db, firestoreCollections.categories, id);
      await deleteDoc(docRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoría eliminada exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      toast.error('Error al eliminar la categoría');
    },
  });
}
