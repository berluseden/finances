/**
 * Módulo AI - Servicios de inteligencia artificial
 * Integración con OpenAI para análisis financiero automático
 */

// Cliente
export { openai, isAIAvailable, AI_MODELS, DEFAULT_AI_CONFIG } from './client';
export type { AIModel } from './client';

// Categorización
export {
  categorizeTransaction,
  categorizeBatch,
  TRANSACTION_CATEGORIES,
} from './categorization';
export type { CategorizationResult, TransactionCategory } from './categorization';

// Recomendaciones
export { generateFinancialRecommendations } from './recommendations';
export type { FinancialRecommendation, RecommendationContext } from './recommendations';

// Detección de fraude
export { detectFraud } from './fraud-detection';
export type { FraudAlert } from './fraud-detection';

// Pronósticos
export { forecastExpenses, analyzeSpendingTrends } from './forecasting';
export type { ExpenseForecast, SpendingTrend } from './forecasting';

// Chatbot
export { FinancialChatbot, financialChatbot } from './chatbot';
export type { ChatMessage, ChatResponse } from './chatbot';

// PDF Reader - Extrae contexto de estados de cuenta
export {
  readPDF,
  detectRecurringExpenses,
  analyzeFinancialContext,
} from './pdf-reader';
export type { PDFExtractedData } from './pdf-reader';
