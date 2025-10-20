# 🤖 Implementación de IA - OpenAI Integration

## ✅ Estado de la Implementación

### Servicios de IA Implementados

#### 1. **Categorización de Transacciones** ✅
- Función: `categorizeTransaction()`
- Descripción: Categoriza automáticamente transacciones usando IA
- Ubicación: `src/services/ai/categorization.ts`
- Categorías disponibles: Comida, Transporte, Entretenimiento, Servicios, Salud, Educación, Compras, Inversión, Otros
- Características:
  - Categorización individual
  - Procesamiento en lote (5 transacciones por vez)
  - Confianza de predicción incluida
  - Razonamiento explicativo

#### 2. **Recomendaciones Financieras** ✅
- Función: `generateFinancialRecommendations()`
- Descripción: Genera recomendaciones personalizadas basadas en patrones de gasto
- Ubicación: `src/services/ai/recommendations.ts`
- Características:
  - Análisis de patrones de gasto
  - Categorización de gastos principales
  - Calificación de impacto (alto, medio, bajo)
  - Acciones sugeridas por recomendación
  - Estimación de ahorros potenciales

#### 3. **Detección de Fraude** ✅
- Función: `detectFraud()`
- Descripción: Detecta transacciones sospechosas o potencialmente fraudulentas
- Ubicación: `src/services/ai/fraud-detection.ts`
- Características:
  - Análisis de patrones de transacciones normales
  - Detección de duplicados
  - Clasificación de riesgo (crítico, alto, medio, bajo)
  - Razones explicadas
  - Recomendaciones de acción

#### 4. **Pronósticos de Gastos** ✅
- Función: `forecastExpenses()`
- Descripción: Predice gastos futuros basados en patrones históricos
- Ubicación: `src/services/ai/forecasting.ts`
- Características:
  - Análisis de tendencias históricas
  - Predicción de 3+ meses
  - Desglose por categoría
  - Nivel de confianza de predicción
  - Análisis de tendencias (creciente, estable, decreciente)

#### 5. **Chatbot Financiero** ✅
- Clase: `FinancialChatbot`
- Descripción: Asistente conversacional para consultas financieras
- Ubicación: `src/services/ai/chatbot.ts`
- Características:
  - Conversación contextual (mantiene historial)
  - Sugerencias de preguntas de seguimiento
  - Rol de sistema especializado en finanzas
  - Métodos: `chat()`, `reset()`, `getHistory()`
  - Instancia global: `financialChatbot`

---

## 🔧 Configuración Requerida

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Copia del archivo .env.example
VITE_OPENAI_API_KEY=tu_clave_api_de_openai
```

### 2. Obtener API Key de OpenAI

1. Ve a https://platform.openai.com/api-keys
2. Crea una nueva API key
3. Copia la clave y guárdala en `.env.local`
4. ⚠️ Nunca commits `.env.local` - ya está en `.gitignore`

### 3. Configuración de Modelos

Por defecto usa `gpt-3.5-turbo` (más económico).
Para cambiar a modelos más potentes en `src/services/ai/client.ts`:

```typescript
model: AI_MODELS.GPT_4_TURBO, // O GPT_4 para máxima potencia
```

---

## 📦 Estructura de Archivos

```
src/services/ai/
├── client.ts                 # Cliente OpenAI centralizado
├── categorization.ts        # Categorización de transacciones
├── recommendations.ts       # Recomendaciones financieras
├── fraud-detection.ts       # Detección de fraude
├── forecasting.ts           # Pronósticos de gastos
├── chatbot.ts              # Chatbot conversacional
└── index.ts                # Exportaciones centralizadas
```

---

## 🚀 Uso de los Servicios

### Ejemplo 1: Categorizar una transacción

```typescript
import { categorizeTransaction } from '@/services/ai';

const result = await categorizeTransaction({
  description: 'McDonald\'s Downtown',
  amount: 45.50,
  currency: 'DOP'
});

console.log(result);
// {
//   category: 'Comida',
//   confidence: 0.95,
//   reasoning: 'McDonald\'s es un restaurante de comida rápida'
// }
```

### Ejemplo 2: Obtener recomendaciones

```typescript
import { generateFinancialRecommendations } from '@/services/ai';

const recommendations = await generateFinancialRecommendations({
  transactions: userTransactions,
  accounts: userAccounts,
  monthlyIncome: 50000,
  monthlyExpenses: 35000
});

console.log(recommendations[0]);
// {
//   title: 'Reduce gastos en entretenimiento',
//   description: '...',
//   impact: 'medium',
//   actionItems: ['...', '...'],
//   estimatedSavings: 5000
// }
```

### Ejemplo 3: Detectar fraude

```typescript
import { detectFraud } from '@/services/ai';

const alert = await detectFraud(transaction, recentTransactions);

if (alert) {
  console.log('⚠️ Alerta de fraude:', alert.riskLevel);
  console.log('Razones:', alert.reasons);
}
```

### Ejemplo 4: Pronóstico de gastos

```typescript
import { forecastExpenses } from '@/services/ai';

const forecast = await forecastExpenses(historicalTransactions, 3);

forecast.forEach(f => {
  console.log(`${f.month}: $${f.totalExpected} (confianza: ${f.confidence})`);
});
```

### Ejemplo 5: Chatbot

```typescript
import { financialChatbot } from '@/services/ai';

const response = await financialChatbot.chat(
  '¿Cómo puedo ahorrar más dinero?'
);

console.log(response.message);
console.log('Preguntas sugeridas:', response.suggestedFollowUps);

// Reiniciar conversación
financialChatbot.reset();
```

---

## ⚠️ Consideraciones Importantes

### Costos

- `gpt-3.5-turbo`: $0.50 por 1M tokens (más económico)
- `gpt-4-turbo`: $10 por 1M tokens (más potente)
- Estima ~500-1000 tokens por categorización

### Límites

- La API tiene límites de rate limiting
- Procesamiento en lote respeta pausas de 500ms
- Máximo historial de chat: últimos 10 mensajes

### Privacidad

- Los datos se envían a los servidores de OpenAI
- No almacena datos personales en caché
- Implementa `dangerouslyAllowBrowser: true` para uso desde navegador

### Errores

Si falta la API Key:
- Los servicios retornan valores por defecto
- Se registra en consola: `[OpenAI] ⚠️ VITE_OPENAI_API_KEY no está definida`
- `isAIAvailable()` retorna `false`

---

## 🧪 Testing

```typescript
// Verificar disponibilidad
import { isAIAvailable } from '@/services/ai';

if (!isAIAvailable()) {
  console.log('IA no disponible');
  return;
}

// Todas las funciones tienen manejo de errores
try {
  const result = await categorizeTransaction(tx);
} catch (error) {
  console.error('Error:', error);
}
```

---

## 📊 Next Steps

Los módulos UI todavía no están implementados:
- [ ] Módulo de chat UI
- [ ] Módulo de insights con recomendaciones
- [ ] Integración en TransactionsPage para categorización automática
- [ ] Dashboard con alertas de fraude

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que `VITE_OPENAI_API_KEY` esté en `.env.local`
2. Revisa la consola del navegador (DevTools → Console)
3. Logs de IA incluyen prefijo `[AI]` o `[OpenAI]`
4. Verifica que la API Key sea válida en https://platform.openai.com/api-keys

**Última actualización:** Octubre 18, 2025
