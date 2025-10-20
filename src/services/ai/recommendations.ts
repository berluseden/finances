import { openai, isAIAvailable, DEFAULT_AI_CONFIG } from './client';
import type { Transaction, Account } from '@/types/models';

export interface FinancialRecommendation {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionItems: string[];
  estimatedSavings?: number;
}

export interface RecommendationContext {
  transactions: Transaction[];
  accounts: Account[];
  monthlyIncome: number;
  monthlyExpenses: number;
}

/**
 * Genera recomendaciones financieras personalizadas basadas en patrones de gasto
 *
 * @param context - Contexto financiero del usuario
 * @returns Array de recomendaciones
 *
 * @example
 * ```typescript
 * const recommendations = await generateFinancialRecommendations({
 *   transactions: userTransactions,
 *   accounts: userAccounts,
 *   monthlyIncome: 50000,
 *   monthlyExpenses: 35000
 * });
 * ```
 */
export async function generateFinancialRecommendations(
  context: RecommendationContext
): Promise<FinancialRecommendation[]> {
  if (!isAIAvailable()) {
    console.warn('[AI] OpenAI no disponible, recomendaciones deshabilitadas');
    return [];
  }

  try {
    console.log('[AI] Generando recomendaciones financieras...');

    // Analizar patrones de gasto
    const categorySpending = analyzeCategorySpending(context.transactions);
    const topCategories = Object.entries(categorySpending)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const spendingRate = context.monthlyExpenses / context.monthlyIncome;
    const savingsRate = 1 - spendingRate;

    const prompt = `Analiza la siguiente situación financiera de un usuario y proporciona 3-4 recomendaciones personalizadas y accionables.

DATOS FINANCIEROS:
- Ingreso mensual: $${context.monthlyIncome}
- Gastos mensuales: $${context.monthlyExpenses}
- Tasa de ahorro: ${(savingsRate * 100).toFixed(1)}%
- Tasa de gasto: ${(spendingRate * 100).toFixed(1)}%

PRINCIPALES CATEGORÍAS DE GASTO:
${topCategories.map(([cat, amount]) => `- ${cat}: $${amount}`).join('\n')}

NÚMERO DE CUENTAS: ${context.accounts.length}
NÚMERO DE TRANSACCIONES: ${context.transactions.length}

Responde en JSON con este formato:
{
  "recommendations": [
    {
      "title": "Título de la recomendación",
      "description": "Descripción detallada",
      "impact": "high|medium|low",
      "actionItems": ["Acción 1", "Acción 2"],
      "estimatedSavings": 5000
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

    const content = response.choices[0]?.message?.content || '{"recommendations":[]}';
    const parsed = JSON.parse(content);

    console.log('[AI] ✅ Recomendaciones generadas:', parsed.recommendations.length);

    return parsed.recommendations as FinancialRecommendation[];
  } catch (error) {
    console.error('[AI] ❌ Error generando recomendaciones:', error);
    throw error;
  }
}

/**
 * Analiza el gasto por categoría
 */
function analyzeCategorySpending(transactions: Transaction[]): Record<string, number> {
  const spending: Record<string, number> = {};

  transactions.forEach((tx) => {
    const category = tx.description || 'Sin categoría';
    spending[category] = (spending[category] || 0) + Math.abs(tx.amount);
  });

  return spending;
}
