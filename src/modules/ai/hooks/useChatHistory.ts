import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  Timestamp,
  limit,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { useAuth } from '../../auth/AuthContext';

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Hook para gestionar el historial de conversaciones del chatbot
 * Persiste en Firestore por usuario, como los proyectos de ChatGPT
 */
export function useChatHistory() {
  const { firebaseUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar historial desde Firestore
  useEffect(() => {
    if (!firebaseUser) {
      setMessages([]);
      setLoading(false);
      return;
    }

    console.log('[ChatHistory] 📚 Cargando historial de conversaciones...');

    const messagesRef = collection(db, 'chatHistory');
    const q = query(
      messagesRef,
      where('userId', '==', firebaseUser.uid),
      orderBy('timestamp', 'asc'),
      limit(100) // Últimos 100 mensajes
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedMessages: ChatMessage[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            role: data.role,
            content: data.content,
            timestamp: data.timestamp?.toDate() || new Date(),
          };
        });

        console.log(`[ChatHistory] ✅ ${loadedMessages.length} mensajes cargados`);
        setMessages(loadedMessages);
        setLoading(false);
      },
      (error) => {
        console.error('[ChatHistory] ❌ Error cargando historial:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser]);

  /**
   * Guarda un mensaje en Firestore
   */
  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!firebaseUser) {
      console.warn('[ChatHistory] No hay usuario autenticado');
      return;
    }

    try {
      const messagesRef = collection(db, 'chatHistory');
      await addDoc(messagesRef, {
        userId: firebaseUser.uid,
        role,
        content,
        timestamp: Timestamp.now(),
      });

      console.log(`[ChatHistory] 💾 Mensaje guardado (${role})`);
    } catch (error) {
      console.error('[ChatHistory] ❌ Error guardando mensaje:', error);
    }
  };

  /**
   * Limpia todo el historial del usuario
   */
  const clearHistory = async () => {
    if (!firebaseUser) return;

    try {
      const deletePromises = messages.map((msg) =>
        deleteDoc(doc(db, 'chatHistory', msg.id))
      );
      await Promise.all(deletePromises);

      console.log('[ChatHistory] 🗑️ Historial eliminado');
    } catch (error) {
      console.error('[ChatHistory] ❌ Error eliminando historial:', error);
    }
  };

  return {
    messages,
    loading,
    saveMessage,
    clearHistory,
  };
}
