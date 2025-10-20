import { OpenAI } from 'openai';

/**
 * Cliente OpenAI centralizado
 * Usa la variable de entorno VITE_OPENAI_API_KEY
 */

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.warn(
    '[OpenAI] ⚠️ VITE_OPENAI_API_KEY no está definida. Las funciones de IA estarán deshabilitadas.'
  );
}

export const openai = apiKey
  ? new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Necesario para uso desde el navegador
    })
  : null;

/**
 * Verifica si OpenAI está disponible
 */
export function isAIAvailable(): boolean {
  return openai !== null;
}

/**
 * Tipos de modelos disponibles
 */
export const AI_MODELS = {
  GPT_5: 'gpt-5',
  GPT_4_TURBO: 'gpt-4-turbo',
  GPT_4O: 'gpt-4o',
  GPT_4: 'gpt-4',
  GPT_35_TURBO: 'gpt-3.5-turbo',
} as const;

export type AIModel = (typeof AI_MODELS)[keyof typeof AI_MODELS];

/**
 * Configuración por defecto para llamadas a OpenAI
 * Usando GPT-5 (modelo más reciente y potente)
 */
export const DEFAULT_AI_CONFIG = {
  model: AI_MODELS.GPT_5,
  // Algunos modelos recientes no aceptan 'temperature' distinto al valor por defecto.
  // No enviamos 'temperature' en las llamadas; si es requerido por un modelo futuro, se añadirá.
  max_completion_tokens: 1000, // Modelos nuevos usan max_completion_tokens
} as const;
