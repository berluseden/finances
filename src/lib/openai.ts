import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Solo para desarrollo - en producción usar backend
});

export interface StatementData {
  // Fechas
  cutDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  statementDate: string; // YYYY-MM-DD
  
  // Información de la cuenta
  accountNumber?: string;
  cardNumber?: string;
  
  // Saldos y límites
  closingBalanceDOP?: number;
  closingBalanceUSD?: number;
  minimumPaymentDOP?: number;
  minimumPaymentUSD?: number;
  creditLimitDOP?: number;
  creditLimitUSD?: number;
  availableCreditDOP?: number;
  availableCreditUSD?: number;
  
  // Intereses
  interestRateDOP?: number;
  interestRateUSD?: number;
  interestChargedDOP?: number;
  interestChargedUSD?: number;
  
  // Transacciones principales (resumen)
  totalPurchasesDOP?: number;
  totalPurchasesUSD?: number;
  totalPaymentsDOP?: number;
  totalPaymentsUSD?: number;
  
  // Información adicional extraída
  bankName?: string;
  cardholderName?: string;
  
  // Confianza de la extracción
  confidence: 'high' | 'medium' | 'low';
  notes?: string; // Notas del AI sobre la extracción
}

/**
 * Extrae información estructurada del estado de cuenta usando GPT-4 Vision
 */
export async function extractStatementData(file: File): Promise<StatementData> {
  try {
    console.log('[OpenAI] Procesando PDF:', file.name);

    // Convertir PDF a base64 para enviar a OpenAI
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    const prompt = `Analiza este estado de cuenta bancario/tarjeta de crédito y extrae la siguiente información en formato JSON:

{
  "cutDate": "YYYY-MM-DD (fecha de corte del estado de cuenta)",
  "dueDate": "YYYY-MM-DD (fecha límite de pago)",
  "statementDate": "YYYY-MM-DD (fecha del estado de cuenta)",
  "accountNumber": "número de cuenta (solo últimos 4 dígitos)",
  "cardNumber": "número de tarjeta (solo últimos 4 dígitos)",
  "closingBalanceDOP": número (saldo de cierre en pesos dominicanos),
  "closingBalanceUSD": número (saldo de cierre en dólares),
  "minimumPaymentDOP": número (pago mínimo en pesos),
  "minimumPaymentUSD": número (pago mínimo en dólares),
  "creditLimitDOP": número (límite de crédito en pesos),
  "creditLimitUSD": número (límite de crédito en dólares),
  "availableCreditDOP": número (crédito disponible en pesos),
  "availableCreditUSD": número (crédito disponible en dólares),
  "interestRateDOP": número (tasa de interés en pesos, como porcentaje),
  "interestRateUSD": número (tasa de interés en dólares, como porcentaje),
  "interestChargedDOP": número (intereses cobrados en pesos),
  "interestChargedUSD": número (intereses cobrados en dólares),
  "totalPurchasesDOP": número (total de compras en pesos),
  "totalPurchasesUSD": número (total de compras en dólares),
  "totalPaymentsDOP": número (total de pagos en pesos),
  "totalPaymentsUSD": número (total de pagos en dólares),
  "bankName": "nombre del banco",
  "cardholderName": "nombre del titular",
  "confidence": "high/medium/low (tu confianza en la extracción)",
  "notes": "cualquier observación importante sobre los datos"
}

IMPORTANTE:
- Si un campo no está presente en el documento, usa null
- Para fechas, usa el formato YYYY-MM-DD
- Para números, no incluyas símbolos de moneda ni comas
- República Dominicana usa RD$ para pesos dominicanos (DOP)
- Identifica correctamente si los montos están en DOP o USD
- Sé preciso con los números, son datos financieros críticos`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Modelo más reciente con capacidad de visión
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:application/pdf;base64,${base64}`,
                detail: 'high'
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.1, // Baja temperatura para respuestas más consistentes
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    console.log('[OpenAI] Respuesta recibida:', content);

    // Extraer JSON de la respuesta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta');
    }

    const extractedData = JSON.parse(jsonMatch[0]) as StatementData;
    
    console.log('[OpenAI] ✅ Datos extraídos exitosamente:', extractedData);

    return extractedData;
  } catch (error) {
    console.error('[OpenAI] ❌ Error al procesar PDF:', error);
    
    // Retornar datos vacíos con baja confianza
    return {
      cutDate: '',
      dueDate: '',
      statementDate: '',
      confidence: 'low',
      notes: `Error al procesar el PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    };
  }
}

/**
 * Genera recomendaciones financieras basadas en el estado de cuenta
 */
export async function generateFinancialRecommendations(
  statementData: StatementData
): Promise<string[]> {
  try {
    const prompt = `Basándote en estos datos de un estado de cuenta bancario, genera 3-5 recomendaciones financieras prácticas y específicas:

Datos del estado de cuenta:
- Saldo de cierre: ${statementData.closingBalanceDOP || 0} DOP / ${statementData.closingBalanceUSD || 0} USD
- Pago mínimo: ${statementData.minimumPaymentDOP || 0} DOP / ${statementData.minimumPaymentUSD || 0} USD
- Límite de crédito: ${statementData.creditLimitDOP || 0} DOP / ${statementData.creditLimitUSD || 0} USD
- Crédito disponible: ${statementData.availableCreditDOP || 0} DOP / ${statementData.availableCreditUSD || 0} USD
- Tasa de interés: ${statementData.interestRateDOP || 0}% DOP / ${statementData.interestRateUSD || 0}% USD
- Total de compras: ${statementData.totalPurchasesDOP || 0} DOP / ${statementData.totalPurchasesUSD || 0} USD

Genera recomendaciones que sean:
1. Específicas para estos números
2. Accionables (que el usuario pueda hacer algo)
3. Enfocadas en mejorar la salud financiera
4. En español dominicano (República Dominicana)

Formato: Array JSON de strings, ejemplo: ["Recomendación 1", "Recomendación 2", ...]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un asesor financiero experto en República Dominicana. Tus recomendaciones son prácticas, específicas y fáciles de entender.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return [];
    }

    // Extraer array JSON de la respuesta
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [];
    }

    const recommendations = JSON.parse(jsonMatch[0]) as string[];
    console.log('[OpenAI] ✅ Recomendaciones generadas:', recommendations);

    return recommendations;
  } catch (error) {
    console.error('[OpenAI] ❌ Error al generar recomendaciones:', error);
    return [];
  }
}

/**
 * Analiza el comportamiento de gasto y genera insights
 */
export async function analyzeSpendingPatterns(
  statements: StatementData[]
): Promise<string> {
  try {
    const prompt = `Analiza estos estados de cuenta históricos y genera un análisis de patrones de gasto:

${statements.map((s, i) => `
Mes ${i + 1}:
- Fecha: ${s.statementDate}
- Saldo: ${s.closingBalanceDOP} DOP / ${s.closingBalanceUSD} USD
- Compras: ${s.totalPurchasesDOP} DOP / ${s.totalPurchasesUSD} USD
- Pagos: ${s.totalPaymentsDOP} DOP / ${s.totalPaymentsUSD} USD
`).join('\n')}

Genera un análisis que incluya:
1. Tendencias de gasto (subiendo, bajando, estable)
2. Comportamiento de pagos (paga completo, mínimo, etc.)
3. Uso de crédito (porcentaje usado vs disponible)
4. Alertas sobre posibles problemas
5. Reconocimientos de buenos hábitos

Sé específico con los números y amigable en el tono.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un analista financiero que ayuda a personas a entender sus patrones de gasto de manera clara y motivadora.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'No se pudo generar el análisis.';
  } catch (error) {
    console.error('[OpenAI] ❌ Error al analizar patrones:', error);
    return 'Error al analizar los patrones de gasto.';
  }
}

/**
 * Interfaz para el contexto financiero completo del usuario
 */
export interface FinancialContext {
  accounts: Array<{
    name: string;
    type: string;
    balanceDOP: number;
    balanceUSD: number;
    limitDOP?: number;
    limitUSD?: number;
    dueDate?: Date;
  }>;
  recurringPayments: Array<{
    name: string;
    amount: number;
    currency: string;
    day: number;
  }>;
  totalMonthlyExpenses?: number; // Total de gastos mensuales en DOP
  totalDebt?: number; // Total de deuda en DOP
  totalIncomeDOP?: number;
  totalIncomeUSD?: number;
}

/**
 * Genera un plan de pagos inteligente priorizando deudas
 */
export async function generatePaymentPlan(context: FinancialContext): Promise<{
  priority: Array<{
    account: string;
    reason: string;
    suggestedAmount: number;
    currency: string;
    urgency: 'high' | 'medium' | 'low';
  }>;
  explanation: string;
}> {
  try {
    const prompt = `Como experto financiero, analiza esta situación y genera un plan de pagos estratégico:

CUENTAS:
${context.accounts.map(acc => `
- ${acc.name} (${acc.type}):
  * Deuda DOP: ${acc.balanceDOP}
  * Deuda USD: ${acc.balanceUSD}
  * Límite DOP: ${acc.limitDOP || 'N/A'}
  * Límite USD: ${acc.limitUSD || 'N/A'}
  * Vence: ${acc.dueDate?.toLocaleDateString('es-ES') || 'N/A'}
  * Uso de crédito: ${acc.limitDOP ? ((acc.balanceDOP / acc.limitDOP) * 100).toFixed(1) : 'N/A'}%
`).join('\n')}

PAGOS RECURRENTES:
${context.recurringPayments.map(p => `
- ${p.name}: ${p.amount} ${p.currency} (día ${p.day})
`).join('\n')}

INGRESOS ESTIMADOS:
- DOP: ${context.totalIncomeDOP || 'No especificado'}
- USD: ${context.totalIncomeUSD || 'No especificado'}

Genera un plan de pagos en formato JSON con esta estructura:
{
  "priority": [
    {
      "account": "Nombre de la cuenta",
      "reason": "Explicación clara de por qué debe ser prioridad",
      "suggestedAmount": número (cuánto pagar),
      "currency": "DOP" o "USD",
      "urgency": "high" | "medium" | "low"
    }
  ],
  "explanation": "Explicación general de la estrategia (2-3 párrafos)"
}

CRITERIOS DE PRIORIZACIÓN:
1. Cuentas con fecha de vencimiento cercana (próximos 7 días) = URGENCIA ALTA
2. Cuentas con uso de crédito >80% = URGENCIA ALTA (afecta credit score)
3. Cuentas con intereses altos (típicamente tarjetas) = PRIORIDAD MEDIA
4. Balance entre pagar deudas y mantener liquidez
5. Considerar pagos recurrentes para no dejar sin fondos

ESTRATEGIA:
- Método "Avalanche" (atacar tasas más altas) o "Snowball" (deudas pequeñas primero)
- Evitar pagar solo el mínimo (genera intereses)
- Mantener al menos una cuenta con crédito disponible para emergencias
- Priorizar deudas en USD si la tasa de cambio está favorable

Sé específico, práctico y motivador. Usa números reales.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Eres un asesor financiero certificado especializado en República Dominicana. Tus recomendaciones son estratégicas, basadas en datos y fáciles de implementar. Priorizas la salud financiera a largo plazo.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    const plan = JSON.parse(content);
    console.log('[OpenAI] ✅ Plan de pagos generado:', plan);

    return plan;
  } catch (error) {
    console.error('[OpenAI] ❌ Error al generar plan de pagos:', error);
    return {
      priority: [],
      explanation: 'No se pudo generar el plan de pagos. Por favor, intenta nuevamente.',
    };
  }
}

/**
 * Identifica gastos que pueden reducirse basándose en patrones
 */
export async function identifyReducibleExpenses(
  statements: StatementData[]
): Promise<Array<{
  category: string;
  currentSpending: number;
  suggestedReduction: number;
  potentialSavings: number;
  tips: string[];
}>> {
  try {
    const prompt = `Analiza estos estados de cuenta y sugiere gastos que se pueden reducir:

${statements.map((s, i) => `
Mes ${i + 1} (${s.statementDate}):
- Compras totales DOP: ${s.totalPurchasesDOP}
- Compras totales USD: ${s.totalPurchasesUSD}
- Saldo final DOP: ${s.closingBalanceDOP}
- Saldo final USD: ${s.closingBalanceUSD}
`).join('\n')}

Identifica categorías de gasto comunes en República Dominicana y sugiere reducciones realistas.

Retorna JSON array:
[
  {
    "category": "Nombre de la categoría (ej: Entretenimiento, Restaurantes, Suscripciones)",
    "currentSpending": número estimado mensual,
    "suggestedReduction": número que se puede reducir,
    "potentialSavings": ahorro anual si se reduce,
    "tips": ["tip 1", "tip 2", "tip 3"] (consejos específicos y accionables)
  }
]

CATEGORÍAS TÍPICAS EN RD:
- Restaurantes y delivery (Uber Eats, Pedidos Ya)
- Entretenimiento (cine, bares, conciertos)
- Suscripciones (Netflix, Spotify, Amazon Prime)
- Transporte (Uber, gasolina)
- Supermercado (excesos, marcas premium)
- Servicios (telefonía, internet - posibles mejores planes)
- Impulsos (compras no planificadas)

Sé realista: no sugieras eliminar todo, sino reducir inteligentemente (ej: 20-30%).`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un consultor financiero personal que ayuda a personas a optimizar sus gastos sin sacrificar calidad de vida. Tus sugerencias son prácticas y adaptadas a la cultura dominicana.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return [];
    }

    const parsed = JSON.parse(content);
    // El response puede venir como {expenses: [...]} o directamente [...]
    const expenses = Array.isArray(parsed) ? parsed : (parsed.expenses || []);
    
    console.log('[OpenAI] ✅ Gastos reducibles identificados:', expenses);
    return expenses;
  } catch (error) {
    console.error('[OpenAI] ❌ Error al identificar gastos reducibles:', error);
    return [];
  }
}

/**
 * Genera alertas inteligentes sobre la situación financiera
 */
export async function generateFinancialAlerts(
  context: FinancialContext
): Promise<Array<{
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  message: string;
  action?: string;
}>> {
  try {
    const prompt = `Analiza esta situación financiera y genera alertas importantes:

${JSON.stringify(context, null, 2)}

Genera alertas en formato JSON array:
[
  {
    "type": "warning" | "danger" | "info" | "success",
    "title": "Título corto de la alerta",
    "message": "Descripción clara del problema u oportunidad",
    "action": "Acción sugerida (opcional)"
  }
]

TIPOS DE ALERTAS:
- "danger": Problemas urgentes (deuda >90% del límite, vencimientos hoy, sobregiro)
- "warning": Situaciones a vigilar (uso >70%, vencimientos próximos, gastos elevados)
- "info": Información útil (mejores prácticas, recordatorios, tips)
- "success": Reconocimientos (buenos hábitos, metas alcanzadas, mejoras)

EJEMPLOS DE ALERTAS:
- Uso de crédito muy alto (>80%) - afecta credit score
- Múltiples vencimientos en misma semana - riesgo de mora
- Pagar solo el mínimo - acumulación de intereses
- Pagos recurrentes que suman más del 40% del ingreso
- Oportunidad de consolidar deudas
- Buen comportamiento de pagos - felicitaciones

Máximo 5 alertas, priorizadas por importancia.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un sistema de alertas financieras inteligente. Identificas riesgos, oportunidades y reconoces buenos hábitos. Tus alertas son claras, accionables y priorizadas.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return [];
    }

    const parsed = JSON.parse(content);
    const alerts = Array.isArray(parsed) ? parsed : (parsed.alerts || []);
    
    console.log('[OpenAI] ✅ Alertas generadas:', alerts);
    return alerts;
  } catch (error) {
    console.error('[OpenAI] ❌ Error al generar alertas:', error);
    return [];
  }
}

/**
 * Predice el saldo futuro basándose en patrones históricos
 */
export async function predictFutureBalance(
  statements: StatementData[],
  recurringPayments: FinancialContext['recurringPayments'],
  monthsAhead: number = 3
): Promise<{
  predictions: Array<{
    month: string;
    estimatedBalanceDOP: number;
    estimatedBalanceUSD: number;
    confidence: number;
  }>;
  analysis: string;
}> {
  try {
    const prompt = `Como analista financiero, predice el saldo futuro basándote en estos datos históricos:

HISTORIAL (últimos ${statements.length} meses):
${statements.map((s, i) => `
Mes ${i + 1}:
- Saldo DOP: ${s.closingBalanceDOP}
- Saldo USD: ${s.closingBalanceUSD}
- Compras DOP: ${s.totalPurchasesDOP}
- Compras USD: ${s.totalPurchasesUSD}
- Pagos DOP: ${s.totalPaymentsDOP}
- Pagos USD: ${s.totalPaymentsUSD}
`).join('\n')}

PAGOS RECURRENTES MENSUALES:
${recurringPayments.map(p => `- ${p.name}: ${p.amount} ${p.currency}`).join('\n')}

Genera predicciones para los próximos ${monthsAhead} meses en formato JSON:
{
  "predictions": [
    {
      "month": "YYYY-MM",
      "estimatedBalanceDOP": número,
      "estimatedBalanceUSD": número,
      "confidence": número entre 0 y 1 (0.7 = 70% confianza)
    }
  ],
  "analysis": "Explicación de las predicciones, tendencias identificadas y factores de riesgo"
}

METODOLOGÍA:
- Calcula el promedio de gastos mensuales
- Identifica tendencias (crecimiento/reducción)
- Suma pagos recurrentes confirmados
- Considera estacionalidad (ej: diciembre = más gastos)
- Ajusta la confianza según volatilidad histórica

Sé conservador en las estimaciones (mejor subestimar que sobrestimar).`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Eres un analista financiero especializado en proyecciones y análisis predictivo. Usas datos históricos para hacer estimaciones conservadoras y realistas.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No se recibió respuesta');
    }

    const result = JSON.parse(content);
    console.log('[OpenAI] ✅ Predicciones generadas:', result);

    return result;
  } catch (error) {
    console.error('[OpenAI] ❌ Error al predecir saldo futuro:', error);
    return {
      predictions: [],
      analysis: 'No se pudieron generar predicciones. Se necesita más historial.',
    };
  }
}

/**
 * Genera un análisis completo de salud financiera con score
 */
export async function analyzeFinancialHealth(
  context: FinancialContext
): Promise<{
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  summary: string;
}> {
  try {
    const prompt = `Evalúa la salud financiera de esta persona y asigna un score:

${JSON.stringify(context, null, 2)}

Genera un análisis completo en formato JSON:
{
  "score": número de 0 a 100,
  "grade": "A" | "B" | "C" | "D" | "F",
  "strengths": ["fortaleza 1", "fortaleza 2", ...],
  "weaknesses": ["debilidad 1", "debilidad 2", ...],
  "recommendations": ["recomendación 1", "recomendación 2", ...],
  "summary": "Resumen ejecutivo de la situación (2-3 párrafos)"
}

CRITERIOS DE EVALUACIÓN:
- Ratio deuda/ingreso (debt-to-income ratio)
- Uso de crédito disponible (credit utilization)
- Diversificación de deudas
- Comportamiento de pagos
- Reserva de emergencia
- Balances crecientes vs decrecientes

ESCALA:
- 90-100 (A): Excelente salud financiera
- 80-89 (B): Buena salud, pequeñas mejoras
- 70-79 (C): Salud moderada, necesita atención
- 60-69 (D): Situación preocupante
- 0-59 (F): Situación crítica, acción urgente

Sé honesto pero constructivo. Siempre incluye camino hacia la mejora.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Eres un asesor financiero certificado que evalúa la salud financiera de manera objetiva pero empática. Tu objetivo es ayudar a las personas a mejorar, no juzgarlas.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No se recibió respuesta');
    }

    const analysis = JSON.parse(content);
    console.log('[OpenAI] ✅ Análisis de salud financiera:', analysis);

    return analysis;
  } catch (error) {
    console.error('[OpenAI] ❌ Error al analizar salud financiera:', error);
    return {
      score: 0,
      grade: 'F',
      strengths: [],
      weaknesses: ['No se pudo realizar el análisis'],
      recommendations: ['Intenta nuevamente más tarde'],
      summary: 'Error al generar el análisis.',
    };
  }
}
