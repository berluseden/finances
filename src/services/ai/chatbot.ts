import { openai, isAIAvailable, DEFAULT_AI_CONFIG } from './client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  message: string;
  suggestedFollowUps: string[];
  confidence: number;
}

/**
 * Interfaz para el contexto financiero del usuario
 */
export interface FinancialContextForChat {
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  financialHealth: 'excellent' | 'good' | 'fair' | 'poor';
  totalBalance: number;
  topCategories: Array<{ name: string; amount: number }>;
  recurringExpenses: any[]; // Array flexible para adaptarse a diferentes estructuras
  accountsCount: number;
  transactionsCount: number;
}

const SYSTEM_PROMPT_TEMPLATE = (context: FinancialContextForChat) => {
  // Formatear gastos recurrentes de forma flexible
  const recurringText = context.recurringExpenses
    .map((e: any) => {
      const name = e.name || e.description || 'Gasto';
      const amount = e.amount || 0;
      const day = e.day || e.recurringDay || 'N/A';
      return `${name} (RD$${amount.toLocaleString('es-DO')} el día ${day})`;
    })
    .join(', ') || 'Ninguno detectado';

  return `Eres un asesor financiero personal experto, amigable y proactivo.

CONTEXTO FINANCIERO DEL USUARIO:
- Ingresos mensuales: RD$${context.monthlyIncome.toLocaleString('es-DO')}
- Gastos mensuales: RD$${context.monthlyExpenses.toLocaleString('es-DO')}
- Tasa de ahorro: ${context.savingsRate}%
- Salud financiera: ${context.financialHealth}
- Balance total: RD$${context.totalBalance.toLocaleString('es-DO')}
- Cuentas: ${context.accountsCount}
- Total transacciones: ${context.transactionsCount}
- Gastos recurrentes: ${recurringText}
- Top categorías de gasto: ${context.topCategories.map(c => `${c.name} (RD$${c.amount.toLocaleString('es-DO')})`).join(', ')}

Tu objetivo es ayudar al usuario con:
- Análisis detallado de sus gastos reales
- Recomendaciones personalizadas basadas en SUS DATOS
- Estrategias de ahorro específicas para su situación
- Identificación de patrones de gasto
- Planificación financiera práctica
- Responder preguntas sobre su dinero con datos concretos

SÉ:
- Amigable, accesible y motivador
- Específico: usa SIEMPRE los datos del usuario en tus análisis
- Práctico: da acciones concretas que pueda tomar
- Proactivo: sugiere mejoras basadas en sus patrones
- Honesto: reconoce si algo está bien o necesita cambios
- Respetuoso con la privacidad

NO:
- Hagas predicciones sin base en los datos
- Recomiendes inversiones específicas
- Proporciones asesoramiento legal o fiscal profesional
- Ignores el contexto financiero real del usuario

Siempre responde en español. Usa emojis ocasionalmente para ser amigable.
Basate en los datos reales del usuario para cada recomendación.`;
};

/**
 * Clase para gestionar conversaciones con el chatbot de IA
 */
export class FinancialChatbot {
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private maxHistoryLength = 20; // Mantener últimos 20 mensajes en memoria
  private userContext: FinancialContextForChat | null = null;

  /**
   * Establece el contexto financiero del usuario
   */
  setUserContext(context: FinancialContextForChat): void {
    this.userContext = context;
    console.log('[Chatbot] 📊 Contexto financiero actualizado');
  }

  /**
   * Carga historial de conversaciones desde Firestore
   * Esto permite que el chatbot "recuerde" conversaciones anteriores
   */
  loadHistory(messages: Array<{ role: 'user' | 'assistant'; content: string }>): void {
    this.conversationHistory = messages.slice(-this.maxHistoryLength);
    console.log(`[Chatbot] 📚 Historial cargado: ${this.conversationHistory.length} mensajes`);
  }

  /**
   * Envía un mensaje al chatbot y obtiene respuesta
   */
  async chat(userMessage: string): Promise<ChatResponse> {
    if (!isAIAvailable()) {
      console.warn('[AI] OpenAI no disponible, chatbot deshabilitado');
      return {
        message: 'Lo siento, el asistente de IA no está disponible en este momento.',
        suggestedFollowUps: [],
        confidence: 0,
      };
    }

    try {
      console.log('[AI] 💬 Procesando mensaje del usuario:', userMessage.substring(0, 50) + '...');

      // Agregar mensaje del usuario al historial
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
      });

      // Limitar el historial
      if (this.conversationHistory.length > this.maxHistoryLength) {
        this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
      }

      // Usar contexto del usuario si está disponible, sino usar prompt genérico
      const systemPrompt = this.userContext
        ? SYSTEM_PROMPT_TEMPLATE(this.userContext)
        : `Eres un asesor financiero personal experto y amigable. Tu objetivo es ayudar a los usuarios con consejos sobre gestión de dinero, estrategias de ahorro, análisis de gastos y planificación financiera. Siempre responde en español.`;

      // Construir mensajes para la API
      const messages = [
        {
          role: 'system' as const,
          content: systemPrompt,
        },
        ...this.conversationHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      ];

      const response = await openai!.chat.completions.create({
        model: DEFAULT_AI_CONFIG.model, // GPT-5 - modelo más reciente
        max_completion_tokens: 2000, // GPT-5 usa max_completion_tokens
        messages,
      });

      const assistantMessage = response.choices[0]?.message?.content || '';

      // Agregar respuesta del asistente al historial
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage,
      });

      console.log('[AI] ✅ Respuesta generada con contexto financiero del usuario');

      // Generar sugerencias de seguimiento
      const suggestedFollowUps = await this.generateFollowUpSuggestions(assistantMessage);

      return {
        message: assistantMessage,
        suggestedFollowUps,
        confidence: 0.9,
      };
    } catch (error) {
      console.error('[AI] ❌ Error en chatbot:', error);
      throw error;
    }
  }

  /**
   * Genera sugerencias de preguntas de seguimiento
   */
  private async generateFollowUpSuggestions(response: string): Promise<string[]> {
    try {
      const prompt = `Basado en esta respuesta sobre finanzas, sugiere 2-3 preguntas de seguimiento cortas y relevantes que el usuario podría hacer.

Respuesta: ${response}

Responde en JSON con este formato:
{
  "suggestions": ["Pregunta 1", "Pregunta 2", "Pregunta 3"]
}

Solo responde el JSON, sin explicaciones.`;

      const result = await openai!.chat.completions.create({
        model: DEFAULT_AI_CONFIG.model,
        max_completion_tokens: 200,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = result.choices[0]?.message?.content || '{"suggestions":[]}';
      const parsed = JSON.parse(content);

      return parsed.suggestions || [];
    } catch (error) {
      console.warn('[AI] Error generando sugerencias de seguimiento:', error);
      return [];
    }
  }

  /**
   * Reinicia la conversación
   */
  reset(): void {
    console.log('[AI] Reiniciando conversación del chatbot');
    this.conversationHistory = [];
  }

  /**
   * Obtiene el historial de mensajes
   */
  getHistory(): ChatMessage[] {
    return this.conversationHistory.map((msg, index) => ({
      id: `${msg.role}-${index}`,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(),
    }));
  }
}

/**
 * Instancia global del chatbot
 */
export const financialChatbot = new FinancialChatbot();
