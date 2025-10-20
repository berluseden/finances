import { openai, isAIAvailable, DEFAULT_AI_CONFIG } from './client';
import type { Transaction } from '@/types/models';

/**
 * Tipos de categorías disponibles
 */
export const TRANSACTION_CATEGORIES = [
  'Comida',
  'Transporte',
  'Entretenimiento',
  'Servicios',
  'Salud',
  'Educación',
  'Compras',
  'Inversión',
  'Otros',
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export interface CategorizationResult {
  description: string;
  category: TransactionCategory;
  confidence: number;
  reasoning: string;
}

/**
 * Categoriza automáticamente una transacción usando IA
 *
 * @param transaction - La transacción a categorizar
 * @returns Resultado de la categorización con confianza
 *
 * @example
 * ```typescript
 * const result = await categorizeTransaction({
 *   description: 'McDonald\'s',
 *   amount: 45.50,
 *   currency: 'DOP'
 * });
 * // { category: 'Comida', confidence: 0.95, reasoning: '...' }
 * ```
 */
export async function categorizeTransaction(
  transaction: Pick<Transaction, 'description' | 'amount' | 'currency'>
): Promise<CategorizationResult> {
  if (!isAIAvailable()) {
    console.warn('[AI] OpenAI no disponible, categorización deshabilitada');
    return {
      description: transaction.description,
      category: 'Otros',
      confidence: 0,
      reasoning: 'IA no disponible',
    };
  }

  try {
    console.log('[AI] Categorizando transacción:', transaction.description);

    const categories = TRANSACTION_CATEGORIES.join(', ');
    const prompt = `Categoriza la siguiente transacción financiera en una de estas categorías: ${categories}

Descripción: ${transaction.description}
Monto: ${transaction.amount} ${transaction.currency}

Responde en JSON con este formato exacto:
{
  "category": "nombre de la categoría",
  "confidence": 0.95,
  "reasoning": "Breve explicación de por qué se eligió esta categoría"
}

Solo responde el JSON, sin explicaciones adicionales.`;

    const response = await openai!.chat.completions.create({
      model: DEFAULT_AI_CONFIG.model,
      max_completion_tokens: 200,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    console.log('[AI] ✅ Transacción categorizada:', parsed);

    return {
      description: transaction.description,
      category: parsed.category as TransactionCategory,
      confidence: parsed.confidence as number,
      reasoning: parsed.reasoning as string,
    };
  } catch (error) {
    console.error('[AI] ❌ Error categorizando transacción:', error);
    throw error;
  }
}

/**
 * Categoriza múltiples transacciones en lote
 *
 * @param transactions - Array de transacciones
 * @returns Array de resultados de categorización
 */
export async function categorizeBatch(
  transactions: Pick<Transaction, 'description' | 'amount' | 'currency'>[]
): Promise<CategorizationResult[]> {
  console.log('[AI] Categorizando lote de', transactions.length, 'transacciones');

  // Procesar de 5 en 5 para evitar sobrecargar la API
  const batchSize = 5;
  const results: CategorizationResult[] = [];

  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(categorizeTransaction));
    results.push(...batchResults);

    // Pequeña pausa entre lotes
    if (i + batchSize < transactions.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}
