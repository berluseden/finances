import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  type DocumentData,
  type Query,
  type WhereFilterOp,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Generic Firestore helper functions
 */

export const firestoreCollections = {
  users: 'users',
  accounts: 'accounts',
  transactions: 'transactions',
  statements: 'statements',
  recurringPayments: 'recurringPayments',
  budgets: 'budgets',
  calendarEvents: 'calendarEvents',
  categories: 'categories',
} as const;

export async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as T) : null;
}

export async function getDocuments<T>(
  collectionName: string,
  conditions?: Array<{ field: string; operator: WhereFilterOp; value: unknown }>,
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'desc'
): Promise<T[]> {
  let q: Query<DocumentData> = collection(db, collectionName);

  if (conditions && conditions.length > 0) {
    conditions.forEach((condition) => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });
  }

  if (orderByField) {
    q = query(q, orderBy(orderByField, orderDirection));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
}

export async function createDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateDocument<T extends Partial<DocumentData>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

export { Timestamp };
