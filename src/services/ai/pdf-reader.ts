import { openai, isAIAvailable, DEFAULT_AI_CONFIG } from './client';
import type { Transaction } from '@/types/models';

export interface PDFExtractedData {
  transactions: Array<{
    description: string;
    amount: number;
    date: string;
    category?: string;
    type: 'charge' | 'payment';
    currency: 'DOP' | 'USD';
  }>;
  recurringExpenses: Array<{
    description: string;
    amount: number;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
    confidence: number;
    lastSeen: string;
  }>;
  monthlyIncome?: number;
  monthlyExpenses: number;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}

/**
 * Lee un PDF de estado de cuenta y extrae:
 * - Transacciones individuales
 * - Gastos recurrentes detectados
 * - Ingresos estimados
 *
 * @param file - Archivo PDF a procesar
 * @returns Datos extraídos del PDF
 *
 * @example
 * ```typescript
 * const data = await readPDF(pdfFile);
 * console.log('Transacciones:', data.transactions.length);
 * console.log('Gastos recurrentes:', data.recurringExpenses);
 * ```
 */
export async function readPDF(file: File): Promise<PDFExtractedData> {
  if (!isAIAvailable()) {
    console.warn('[PDF Reader] OpenAI no disponible, lectura deshabilitada');
    return {
      transactions: [],
      recurringExpenses: [],
      monthlyExpenses: 0,
      confidence: 'low',
      notes: 'IA no disponible',
    };
  }

  try {
    console.log('[PDF Reader] Procesando PDF:', file.name);

    // Convertir PDF a base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    const prompt = `Analiza este estado de cuenta bancario/tarjeta de crédito y extrae la siguiente información en formato JSON:

1. **TRANSACCIONES**: Lista de cada transacción individual
2. **GASTOS RECURRENTES**: Patrones de gastos que se repiten (ej: Netflix cada mes, salario cada quincena)
3. **INGRESOS MENSUALES**: Monto aproximado de ingresos mensuales si está disponible
4. **GASTOS MENSUALES**: Total de gastos en el período

RESPONDE EN JSON CON ESTE FORMATO EXACTO:
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "Descripción completa de la transacción",
      "amount": número positivo,
      "type": "charge" o "payment",
      "currency": "DOP" o "USD",
      "category": "Comida|Transporte|Entretenimiento|Servicios|Salud|Educación|Compras|Inversión|Otros"
    }
  ],
  "recurringExpenses": [
    {
      "description": "Netflix",
      "amount": 299,
      "frequency": "monthly",
      "confidence": 0.95,
      "lastSeen": "YYYY-MM-DD",
      "notes": "Suscripción mensual"
    }
  ],
  "monthlyIncome": 50000 o null si no está disponible,
  "monthlyExpenses": 35000,
  "confidence": "high|medium|low",
  "notes": "Observaciones importantes sobre los datos"
}

INSTRUCCIONES CRÍTICAS:
- Sé preciso: estos son datos financieros importantes.
- Para fechas usa YYYY-MM-DD.
- Los montos deben ser positivos (sin signos) y en su moneda.
- En "type": "charge" es gasto, "payment" es ingreso/pago.
- Detecta TODAS las suscripciones y pagos recurrentes (incluye confidence y lastSeen).
- Si un campo no está disponible, usa null o un valor por defecto razonable.
`;

    const response = await openai!.chat.completions.create({
      model: DEFAULT_AI_CONFIG.model,
      max_completion_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:application/pdf;base64,${base64}`,
                detail: 'high',
              },
            },
          ] as any,
        },
      ],
    });

    const content = response.choices[0]?.message?.content || '{}';

    // Extraer JSON de la respuesta (puede estar envuelto en markdown)
    let jsonContent = content;
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonContent);

    console.log('[PDF Reader] ✅ PDF procesado:', {
      transacciones: parsed.transactions?.length || 0,
      gastosRecurrentes: parsed.recurringExpenses?.length || 0,
      confianza: parsed.confidence,
    });

    return {
      transactions: parsed.transactions || [],
      recurringExpenses: parsed.recurringExpenses || [],
      monthlyIncome: parsed.monthlyIncome,
      monthlyExpenses: parsed.monthlyExpenses || 0,
      confidence: parsed.confidence || 'medium',
      notes: parsed.notes,
    };
  } catch (error) {
    console.error('[PDF Reader] ❌ Error procesando PDF:', error);
    throw error;
  }
}

/**
 * Detecta gastos recurrentes en un historial de transacciones
 * Útil cuando no se puede extraer del PDF directamente
 *
 * @param transactions - Transacciones históricas
 * @returns Gastos recurrentes detectados
 */
export async function detectRecurringExpenses(
  transactions: Transaction[]
): Promise<PDFExtractedData['recurringExpenses']> {
  if (!isAIAvailable()) {
    console.warn('[PDF Reader] OpenAI no disponible');
    return [];
  }

  try {
    console.log('[PDF Reader] Detectando gastos recurrentes...');

    // Agrupar transacciones por descripción
    const grouped: Record<string, Array<{ date: Date; amount: number }>> = {};

    transactions.forEach((tx) => {
      const key = tx.description.toLowerCase().trim();
      if (!grouped[key]) {
        grouped[key] = [];
      }
      const date = tx.date.toDate ? tx.date.toDate() : new Date(tx.date as any);
      grouped[key].push({
        date,
        amount: Math.abs(tx.amount),
      });
    });

    // Filtrar solo transacciones que aparecen múltiples veces
    const recurring = Object.entries(grouped)
      .filter(([_, txs]) => txs.length >= 2)
      .map(([description, txs]) => {
        const sorted = txs.sort((a, b) => a.date.getTime() - b.date.getTime());
        const intervals: number[] = [];

        for (let i = 1; i < sorted.length; i++) {
          const diffDays = (sorted[i].date.getTime() - sorted[i - 1].date.getTime()) / (1000 * 60 * 60 * 24);
          intervals.push(diffDays);
        }

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const avgAmount = txs.reduce((a, b) => a + b.amount, 0) / txs.length;

        // Determinar frecuencia
        let frequency: PDFExtractedData['recurringExpenses'][0]['frequency'] = 'monthly';
        if (avgInterval <= 1.5) frequency = 'daily';
        else if (avgInterval <= 7.5) frequency = 'weekly';
        else if (avgInterval <= 15) frequency = 'biweekly';
        else if (avgInterval <= 35) frequency = 'monthly';
        else if (avgInterval <= 120) frequency = 'quarterly';
        else frequency = 'yearly';

        // Confianza basada en consistencia
        const variance = Math.sqrt(
          intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length
        );
        const consistency = Math.max(0, 1 - variance / avgInterval / 2);

        return {
          description,
          amount: Math.round(avgAmount),
          frequency,
          confidence: Math.min(1, consistency * (txs.length / 5)), // Más transacciones = más confianza
          lastSeen: sorted[sorted.length - 1].date.toISOString().split('T')[0],
        };
      });

    console.log('[PDF Reader] ✅ Gastos recurrentes detectados:', recurring.length);

    return recurring;
  } catch (error) {
    console.error('[PDF Reader] ❌ Error detectando gastos recurrentes:', error);
    return [];
  }
}

/**
 * Analiza el contexto financiero completo del usuario
 * Incluye: ingresos, gastos, categorías, tendencias, gastos recurrentes
 *
 * @param transactions - Todas las transacciones del usuario
 * @returns Análisis del contexto financiero
 */
export async function analyzeFinancialContext(transactions: Transaction[]) {
  if (!isAIAvailable()) {
    console.warn('[PDF Reader] OpenAI no disponible');
    return null;
  }

  try {
    console.log('[PDF Reader] Analizando contexto financiero...');

    // Detectar gastos recurrentes
    const recurringExpenses = await detectRecurringExpenses(transactions);

    // Calcular totales
    const charges = transactions.filter((tx) => tx.type === 'charge');
    const payments = transactions.filter((tx) => tx.type === 'payment');

    const totalCharges = charges.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const totalPayments = payments.reduce((sum, tx) => sum + tx.amount, 0);

    // Agrupar por categoría
    const byCategory: Record<string, number> = {};
    charges.forEach((tx) => {
      const category = tx.description || 'Sin categoría';
      byCategory[category] = (byCategory[category] || 0) + Math.abs(tx.amount);
    });

    // Identificar ingresos (generalmente pagos grandes o transferencias)
    const estimatedMonthlyIncome = Math.max(...payments.map((tx) => tx.amount), 0);

    const context = {
      totalTransactions: transactions.length,
      totalCharges,
      totalPayments,
      estimatedMonthlyIncome,
      estimatedMonthlyExpenses: totalCharges / Math.max(1, Math.floor(transactions.length / 20)), // Aproximar por mes
      recurringExpenses,
      topCategories: Object.entries(byCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, amount]) => ({ name, amount })),
      transactionCount: transactions.length,
    };

    console.log('[PDF Reader] ✅ Contexto analizado:', {
      ingresos: context.estimatedMonthlyIncome,
      gastos: context.estimatedMonthlyExpenses.toFixed(0),
      gastosRecurrentes: context.recurringExpenses.length,
    });

    return context;
  } catch (error) {
    console.error('[PDF Reader] ❌ Error analizando contexto:', error);
    return null;
  }
}
