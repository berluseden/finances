# 🚀 Quick Start - OpenAI Integration

## 1️⃣ Configuración Inicial (2 minutos)

### Paso 1: Copiar archivo de configuración

```bash
# Windows PowerShell
Copy-Item .env.example .env.local

# Linux/Mac
cp .env.example .env.local
```

### Paso 2: Agregar tu API Key de OpenAI

Abre `.env.local` y reemplaza:

```bash
VITE_OPENAI_API_KEY=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
```

Con tu clave real de: https://platform.openai.com/api-keys

### Paso 3: Reiniciar servidor (si está corriendo)

```bash
npm run dev
```

---

## 2️⃣ Verificar que todo funciona

### En la consola del navegador (DevTools → Console):

Deberías ver:

```
[OpenAI] Auth persistence enabled
[Firebase] Services initialized successfully
```

✅ Si ves estos logs, ¡está funcionando!

---

## 3️⃣ Usar los Servicios de IA

### Opción A: Desde un componente React

```tsx
import { categorizeTransaction, financialChatbot } from '@/services/ai';

export function MyComponent() {
  const handleCategorize = async () => {
    try {
      const result = await categorizeTransaction({
        description: 'Starbucks Downtown',
        amount: 150,
        currency: 'DOP'
      });
      console.log('Categoría:', result.category);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return <button onClick={handleCategorize}>Categorizar</button>;
}
```

### Opción B: Desde un Hook personalizado

```tsx
import { useQuery } from '@tanstack/react-query';
import { categorizeTransaction } from '@/services/ai';

export function useCategorization(transaction: Transaction) {
  return useQuery({
    queryKey: ['categorize', transaction.id],
    queryFn: () => categorizeTransaction(transaction),
  });
}
```

### Opción C: Usar el Chatbot

```tsx
import { financialChatbot } from '@/services/ai';

async function askBot() {
  const response = await financialChatbot.chat(
    '¿Cuáles son mis mayores gastos?'
  );
  
  console.log('Respuesta:', response.message);
  console.log('Preguntas sugeridas:', response.suggestedFollowUps);
}
```

---

## 4️⃣ Funciones Disponibles

### Categorización
```typescript
import { categorizeTransaction, categorizeBatch } from '@/services/ai';

// Una transacción
const result = await categorizeTransaction(transaction);

// Múltiples transacciones
const results = await categorizeBatch(transactions);
```

### Recomendaciones
```typescript
import { generateFinancialRecommendations } from '@/services/ai';

const recommendations = await generateFinancialRecommendations({
  transactions,
  accounts,
  monthlyIncome: 50000,
  monthlyExpenses: 35000
});
```

### Detección de Fraude
```typescript
import { detectFraud } from '@/services/ai';

const alert = await detectFraud(transaction, recentTransactions);
if (alert) console.log('⚠️ Posible fraude');
```

### Pronósticos
```typescript
import { forecastExpenses, analyzeSpendingTrends } from '@/services/ai';

const forecast = await forecastExpenses(transactions, 3);
const trends = analyzeSpendingTrends(transactions);
```

### Chatbot
```typescript
import { financialChatbot } from '@/services/ai';

const response = await financialChatbot.chat('Tu pregunta aquí');
financialChatbot.reset(); // Reiniciar conversación
```

---

## 5️⃣ Debugging

### Si no funciona:

#### Problema 1: "VITE_OPENAI_API_KEY no está definida"

```
[OpenAI] ⚠️ VITE_OPENAI_API_KEY no está definida
```

**Solución:**
1. Verifica que `.env.local` exista
2. Verifica que tenga `VITE_OPENAI_API_KEY=tu_clave`
3. Reinicia el servidor (`npm run dev`)

#### Problema 2: Error de autenticación

```
Error: Invalid API key
```

**Solución:**
1. Verifica tu API key en https://platform.openai.com/api-keys
2. Cópiala nuevamente en `.env.local`
3. Comprueba que no haya espacios al inicio/final

#### Problema 3: Rate limiting

```
Error: Rate limit exceeded
```

**Solución:**
- El lote de procesamiento espera 500ms entre operaciones
- Espera unos minutos y reintenta
- Considera usar un modelo más económico

### Ver los logs detallados

Abre DevTools (F12) → Console y filtra por `[AI]`:

```javascript
// En la consola del navegador
// Verás todos los logs de IA
```

---

## 6️⃣ Costos Estimados

| Modelo | Precio | Caso de Uso |
|--------|--------|-----------|
| gpt-3.5-turbo | $0.50/1M tokens | Categorización, Chatbot |
| gpt-4-turbo | $10/1M tokens | Recomendaciones, Fraude |
| gpt-4 | $30/1M tokens | Máxima precisión |

**Estimación:** ~500-1000 tokens por operación

---

## 7️⃣ Buenas Prácticas

### ✅ DO

```typescript
// ✅ Verificar disponibilidad
if (isAIAvailable()) {
  const result = await categorizeTransaction(tx);
}

// ✅ Usar try-catch
try {
  const result = await categorizeTransaction(tx);
} catch (error) {
  console.error('Error:', error);
}

// ✅ Procesar en lotes pequeños
const results = await categorizeBatch(transactions.slice(0, 10));
```

### ❌ DON'T

```typescript
// ❌ Sin verificación
const result = await categorizeTransaction(tx); // Puede fallar

// ❌ Sin manejo de errores
const results = await categorizeBatch(allTransactions); // Puede timeout

// ❌ Procesar demasiadas transacciones
const results = await categorizeBatch(10000transactions); // Timeout
```

---

## 📞 Soporte

Si tienes problemas:

1. **Lee la documentación:** `AI_IMPLEMENTATION.md`
2. **Revisa los logs:** DevTools → Console → Filtra por `[AI]`
3. **Verifica configuración:** `.env.local` debe existir con API key
4. **Check API Key:** https://platform.openai.com/api-keys

---

**¡Listo! Tu integración de OpenAI está lista para usar 🎉**

**Documentos relacionados:**
- `AI_IMPLEMENTATION.md` - Documentación completa
- `VALIDATION_REPORT_AI.md` - Reporte de validación
- `.env.example` - Variables de entorno
