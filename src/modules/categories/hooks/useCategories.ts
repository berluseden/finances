import { useQuery } from '@tanstack/react-query';
import { getDocuments } from '@/firebase/firestore';
import { useAuth } from '@/modules/auth/AuthContext';
import { Category } from '@/types/models';

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