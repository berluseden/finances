import { openai, isAIAvailable, DEFAULT_AI_CONFIG } from './client';
import type { Transaction } from '@/types/models';

export interface FraudAlert {
  transactionId: string;
  description: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  reasons: string[];
  recommendation: string;
  similarTransactions?: number;
}

/**
 * Detecta transacciones sospechosas o potencialmente fraudulentas
 *
 * @param transaction - La transacción a analizar
 * @param recentTransactions - Transacciones recientes para comparación
 * @returns Alerta de fraude si se detecta riesgo
 *
 * @example
 * ```typescript
 * const alert = await detectFraud(transaction, recentTransactions);
 * if (alert) {
 *   console.log('⚠️ Posible fraude detectado:', alert.riskLevel);
 * }
 * ```
 */
export async function detectFraud(
  transaction: Transaction,
  recentTransactions: Transaction[]
): Promise<FraudAlert | null> {
  if (!isAIAvailable()) {
    console.warn('[AI] OpenAI no disponible, detección de fraude deshabilitada');
    return null;
  }

  try {
    console.log('[AI] Analizando transacción para detectar fraude:', transaction.description);

    // Analizar patrones
    const stats = analyzeTransactionPatterns(recentTransactions);
    const avgAmount = stats.avgAmount;
    const maxAmount = stats.maxAmount;
    const isDuplicate = recentTransactions.some(
      (tx) =>
        tx.description === transaction.description &&
        tx.amount === transaction.amount &&
        new Date(tx.date.toDate()).getTime() - new Date(transaction.date.toDate()).getTime() <
          60000 // Dentro de 1 minuto
    );

    const prompt = `Analiza si la siguiente transacción financiera podría ser fraudulenta:

TRANSACCIÓN A ANALIZAR:
- Descripción: ${transaction.description}
- Monto: ${transaction.amount} ${transaction.currency}
- Tipo: ${transaction.type}
- Fecha: ${new Date(transaction.date.toDate()).toISOString()}

PATRONES DEL USUARIO:
- Monto promedio de transacciones: $${avgAmount.toFixed(2)}
- Monto máximo histórico: $${maxAmount.toFixed(2)}
- ¿Posible duplicado?: ${isDuplicate ? 'Sí' : 'No'}
- Total de transacciones recientes: ${recentTransactions.length}

INDICADORES DE RIESGO A CONSIDERAR:
- Monto inusualmente alto o bajo
- Descripción sospechosa o genérica
- Desviación significativa del patrón normal
- Duplicados o transacciones muy similares
- Comerciantes sospechosos

Responde en JSON con este formato:
{
  "riskLevel": "critical|high|medium|low",
  "reasons": ["Razón 1", "Razón 2"],
  "recommendation": "Recomendación de acción",
  "confidence": 0.85
}

Solo responde el JSON, sin explicaciones adicionales.`;

    const response = await openai!.chat.completions.create({
      model: DEFAULT_AI_CONFIG.model,
      max_completion_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    // Solo retornar alerta si el riesgo es medio o superior
    if (parsed.riskLevel && ['critical', 'high', 'medium'].includes(parsed.riskLevel)) {
      console.log('[AI] ⚠️ Alerta de fraude detectada:', parsed.riskLevel);

      return {
        transactionId: transaction.id,
        description: transaction.description,
        riskLevel: parsed.riskLevel,
        reasons: parsed.reasons,
        recommendation: parsed.recommendation,
        similarTransactions: recentTransactions.filter(
          (tx) => tx.description === transaction.description
        ).length,
      };
    }

    console.log('[AI] ✅ Transacción segura');
    return null;
  } catch (error) {
    console.error('[AI] ❌ Error detectando fraude:', error);
    throw error;
  }
}

/**
 * Analiza patrones en transacciones recientes
 */
function analyzeTransactionPatterns(transactions: Transaction[]) {
  const amounts = transactions.map((tx) => Math.abs(tx.amount));

  return {
    avgAmount: amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0,
    maxAmount: amounts.length > 0 ? Math.max(...amounts) : 0,
    minAmount: amounts.length > 0 ? Math.min(...amounts) : 0,
    stdDev:
      amounts.length > 1
        ? Math.sqrt(
            amounts.reduce((sq, n) => sq + Math.pow(n - amounts.reduce((a, b) => a + b, 0) / amounts.length, 2), 0) /
              (amounts.length - 1)
          )
        : 0,
  };
}
