import { openai, isAIAvailable, DEFAULT_AI_CONFIG } from './client';
import type { Transaction } from '@/types/models';

export interface ExpenseForecast {
  month: string;
  totalExpected: number;
  byCategory: Record<string, number>;
  confidence: number;
  reasoning: string;
}

export interface SpendingTrend {
  month: string;
  amount: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

/**
 * Predice gastos futuros basado en patrones históricos
 *
 * @param transactions - Transacciones históricas (últimos 3-6 meses)
 * @param forecastMonths - Número de meses a pronosticar (default: 3)
 * @returns Pronósticos de gastos
 *
 * @example
 * ```typescript
 * const forecast = await forecastExpenses(historicalTransactions, 3);
 * console.log('Gasto esperado próximo mes:', forecast[0].totalExpected);
 * ```
 */
export async function forecastExpenses(
  transactions: Transaction[],
  forecastMonths: number = 3
): Promise<ExpenseForecast[]> {
  if (!isAIAvailable()) {
    console.warn('[AI] OpenAI no disponible, pronósticos deshabilitados');
    return [];
  }

  try {
    console.log('[AI] Generando pronóstico de gastos para', forecastMonths, 'meses');

    // Analizar gastos históricos
    const monthlySpending = analyzeMonthlySpending(transactions);
    const spendingHistory = Object.entries(monthlySpending)
      .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
      .map(([month, amount]) => `${month}: $${amount.toFixed(2)}`);

    const prompt = `Analiza el histórico de gastos y pronostica los gastos para los próximos ${forecastMonths} meses.

HISTÓRICO DE GASTOS MENSUALES:
${spendingHistory.join('\n')}

TOTAL DE TRANSACCIONES ANALIZADAS: ${transactions.length}

Considera:
- Tendencias estacionales
- Patrones de gasto recurrentes
- Variabilidad histórica
- Cambios graduales en el tiempo

Genera pronósticos para los próximos ${forecastMonths} meses.

Responde en JSON con este formato:
{
  "forecasts": [
    {
      "month": "2025-11",
      "totalExpected": 45000,
      "byCategory": {
        "Comida": 8000,
        "Transporte": 5000,
        "Otros": 32000
      },
      "confidence": 0.82,
      "reasoning": "Basado en tendencia estable con ligero aumento estacional"
    }
  ]
}

Solo responde el JSON, sin explicaciones adicionales.`;

    const response = await openai!.chat.completions.create({
      model: DEFAULT_AI_CONFIG.model,
      max_completion_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content || '{"forecasts":[]}';
    const parsed = JSON.parse(content);

    console.log('[AI] ✅ Pronóstico generado:', parsed.forecasts.length, 'meses');

    return parsed.forecasts as ExpenseForecast[];
  } catch (error) {
    console.error('[AI] ❌ Error generando pronóstico:', error);
    throw error;
  }
}

/**
 * Analiza tendencias de gasto
 */
export function analyzeSpendingTrends(transactions: Transaction[]): SpendingTrend[] {
  const monthlySpending = analyzeMonthlySpending(transactions);
  const months = Object.entries(monthlySpending)
    .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
    .map(([month, amount]) => ({ month, amount }));

  const trends: SpendingTrend[] = [];

  for (let i = 0; i < months.length; i++) {
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';

    if (i > 0) {
      const diff = months[i].amount - months[i - 1].amount;
      const percentChange = diff / months[i - 1].amount;

      if (percentChange > 0.1) {
        trend = 'increasing';
      } else if (percentChange < -0.1) {
        trend = 'decreasing';
      }
    }

    trends.push({
      month: months[i].month,
      amount: months[i].amount,
      trend,
    });
  }

  return trends;
}

/**
 * Analiza gastos por mes
 */
function analyzeMonthlySpending(transactions: Transaction[]): Record<string, number> {
  const spending: Record<string, number> = {};

  transactions.forEach((tx) => {
    if (tx.type === 'charge') {
      const date = tx.date.toDate ? tx.date.toDate() : new Date(tx.date as any);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      spending[month] = (spending[month] || 0) + Math.abs(tx.amount);
    }
  });

  return spending;
}
