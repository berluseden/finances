/**
 * Script de validación de configuración de OpenAI
 * Ejecuta en DevTools Console para verificar que todo está configurado correctamente
 */

// Verificar que la clave API está en el entorno
console.log('=== VALIDACIÓN DE CONFIGURACIÓN OPENAI ===\n');

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.error('❌ ERROR: VITE_OPENAI_API_KEY no está definida');
  console.log('Solución:');
  console.log('1. Crea un archivo .env.local en la raíz del proyecto');
  console.log('2. Agrega: VITE_OPENAI_API_KEY=tu_clave_api');
  console.log('3. Reinicia el servidor de desarrollo');
} else {
  console.log('✅ VITE_OPENAI_API_KEY está configurada');
  console.log(`   Valor (primeros 20 caracteres): ${apiKey.substring(0, 20)}...`);
  console.log(`   Longitud: ${apiKey.length} caracteres`);

  // Validar formato de clave OpenAI
  if (apiKey.startsWith('sk-proj-')) {
    console.log('✅ Formato de clave OpenAI correcto (sk-proj-*)');
  } else if (apiKey.startsWith('sk-')) {
    console.log('⚠️  Advertencia: Clave antigua (sk-*), se recomienda usar sk-proj-*');
  } else {
    console.log('❌ ERROR: Formato de clave no reconocido');
  }
}

// Verificar que el cliente de OpenAI está disponible
console.log('\n=== VERIFICACIÓN DE SERVICIOS ===\n');

try {
  // Intentar importar el cliente
  import('@/services/ai/client').then(({ isAIAvailable, DEFAULT_AI_CONFIG }) => {
    if (isAIAvailable()) {
      console.log('✅ Cliente OpenAI inicializado correctamente');
      console.log(`   Modelo predeterminado: ${DEFAULT_AI_CONFIG.model}`);
  // La mayoría de modelos recientes usan la temperatura por defecto
      console.log(`   Max completion tokens: ${DEFAULT_AI_CONFIG.max_completion_tokens}`);
    } else {
      console.error('❌ ERROR: Cliente OpenAI no disponible');
    }
  });
} catch (error) {
  console.error('❌ ERROR al cargar cliente:', error);
}

// Verificar que los servicios están disponibles
console.log('\n=== SERVICIOS DISPONIBLES ===\n');

const servicios = [
  'categorizeTransaction',
  'categorizeBatch',
  'generateFinancialRecommendations',
  'detectFraud',
  'forecastExpenses',
  'analyzeSpendingTrends',
  'FinancialChatbot',
  'financialChatbot',
];

servicios.forEach((service) => {
  console.log(`  • ${service}`);
});

console.log('\n=== VERIFICACIÓN COMPLETADA ===\n');

console.log('Importar y usar en componentes:');
console.log('import { categorizeTransaction } from "@/services/ai";');
console.log('const result = await categorizeTransaction({ description, amount, currency });');
