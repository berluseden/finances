import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuments, updateDocument, deleteDocument } from '@/firebase/firestore';
import { User, UserRole } from '@/types/models';
import toast from 'react-hot-toast';

/**
 * Hook para obtener todos los usuarios del sistema
 */
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const users = await getDocuments<User>('users', [], 'createdAt', 'desc');
      return users;
    },
  });
}

/**
 * Hook para actualizar el rol de un usuario
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      await updateDocument('users', userId, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Rol actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar el rol');
    },
  });
}

/**
 * Hook para eliminar un usuario (solo de Firestore)
 * Nota: Firebase Auth requiere Admin SDK para eliminar usuarios,
 * esta función solo elimina el documento de Firestore
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await deleteDocument('users', userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario eliminado de Firestore');
      toast('⚠️ El usuario aún existe en Firebase Auth', { duration: 4000 });
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar el usuario');
    },
  });
}
