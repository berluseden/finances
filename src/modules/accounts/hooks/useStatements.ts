import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuments, createDocument, updateDocument, deleteDocument } from '@/firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/firebase';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/modules/auth/AuthContext';
import { extractStatementData, type StatementData } from '@/lib/openai';
import type { Statement } from '@/types/models';

// Hook para obtener statements de una cuenta
export function useStatements(accountId: string) {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: ['statements', accountId],
    queryFn: async () => {
      if (!currentUser) throw new Error('Usuario no autenticado');

      const statements = await getDocuments<Statement>('statements', [
        { field: 'userId', operator: '==', value: currentUser.id },
        { field: 'accountId', operator: '==', value: accountId }
      ]);

      // Ordenar por fecha de corte (más reciente primero), manejando fechas undefined
      return statements.sort((a, b) => {
        if (!a.cutDate && !b.cutDate) return 0;
        if (!a.cutDate) return 1; // Poner sin fecha al final
        if (!b.cutDate) return -1;
        return b.cutDate.toMillis() - a.cutDate.toMillis();
      });
    },
    enabled: !!currentUser && !!accountId,
  });
}

// Hook para subir PDF de statement con extracción automática usando OpenAI
export function useUploadStatement() {
  const { currentUser, firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async ({
      accountId,
      file,
      useAI = true
    }: {
      accountId: string;
      file: File;
      useAI?: boolean; // Si es true, usa OpenAI para extraer datos
    }) => {
      if (!currentUser || !firebaseUser) throw new Error('Usuario no autenticado');

      // Usar el UID de Firebase directamente para que coincida con las reglas de Storage
      const userId = firebaseUser.uid;

      // Generar nombre único para el archivo
      const fileName = `${Date.now()}_${file.name}`;
      const path = `statements/${userId}/${accountId}/${fileName}`;

      console.log('[useStatements] Subiendo PDF:', { path, userId, accountId, fileName });

      // Subir archivo a Storage
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      console.log('[useStatements] ✅ PDF subido exitosamente:', downloadURL);

      let extractedData: StatementData | null = null;

      // Si useAI es true, extraer datos con OpenAI
      if (useAI) {
        console.log('[useStatements] 🤖 Extrayendo datos con OpenAI...');
        try {
          extractedData = await extractStatementData(file);
          console.log('[useStatements] ✅ Datos extraídos:', extractedData);
        } catch (error) {
          console.error('[useStatements] ❌ Error al extraer datos:', error);
          // Continuar sin datos extraídos
        }
      }

      // Crear documento en Firestore con datos extraídos (si existen)
      const statementData: Partial<Statement> = {
        userId: currentUser.id,
        accountId,
        statementPdfPath: downloadURL,
      };

      // Si se extrajeron datos exitosamente, agregarlos
      if (extractedData && extractedData.confidence !== 'low') {
        // Convertir fechas de string a Timestamp
        if (extractedData.cutDate) {
          try {
            statementData.cutDate = Timestamp.fromDate(new Date(extractedData.cutDate));
          } catch (error) {
            console.error('[useStatements] Error convirtiendo cutDate:', error);
          }
        }
        if (extractedData.dueDate) {
          try {
            statementData.dueDate = Timestamp.fromDate(new Date(extractedData.dueDate));
          } catch (error) {
            console.error('[useStatements] Error convirtiendo dueDate:', error);
          }
        }

        // Agregar saldos
        if (extractedData.closingBalanceDOP !== undefined) {
          statementData.closingBalanceDOP = extractedData.closingBalanceDOP;
        }
        if (extractedData.closingBalanceUSD !== undefined) {
          statementData.closingBalanceUSD = extractedData.closingBalanceUSD;
        }

        // Agregar pagos mínimos
        if (extractedData.minimumPaymentDOP !== undefined) {
          statementData.minimumPaymentDOP = extractedData.minimumPaymentDOP;
        }
        if (extractedData.minimumPaymentUSD !== undefined) {
          statementData.minimumPaymentUSD = extractedData.minimumPaymentUSD;
        }

        // Agregar metadatos de extracción
        statementData.aiExtracted = true;
        statementData.aiConfidence = extractedData.confidence;
        if (extractedData.notes) {
          statementData.aiNotes = extractedData.notes;
        }
      }

      // Si no se extrajeron fechas, usar fechas calculadas como fallback
      // Necesitaríamos los datos de la cuenta para esto, lo dejamos para mejora futura
      // Por ahora, si no hay fechas, el usuario deberá editarlas manualmente

      const statementId = await createDocument('statements', statementData);

      return { 
        statementId, 
        downloadURL, 
        extractedData,
        aiExtracted: extractedData && extractedData.confidence !== 'low'
      };
    },
  });
}

// Hook para actualizar statement
export function useUpdateStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      statementId,
      data
    }: {
      statementId: string;
      data: Partial<Statement>;
    }) => {
      await updateDocument('statements', statementId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statements'] });
    },
  });
}

// Hook para eliminar statement
export function useDeleteStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (statementId: string) => {
      await deleteDocument('statements', statementId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statements'] });
    },
  });
}