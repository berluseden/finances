# Integración de IA con OpenAI

## 📋 Descripción

Este sistema utiliza **OpenAI GPT-4o** como un asesor financiero inteligente que analiza tus datos y te ayuda a tomar mejores decisiones. No solo extrae datos de PDFs, sino que actúa como tu consultor personal.

## ✨ Características Principales

### 1. 🤖 Extracción Automática de Estados de Cuenta

Sube un PDF y la IA extrae automáticamente:

- **Fechas**: Corte, vencimiento, fecha del statement
- **Saldos**: DOP y USD, crédito disponible, límites
- **Pagos**: Mínimos requeridos en ambas monedas
- **Transacciones**: Total de compras, pagos, intereses
- **Información bancaria**: Banco, número de cuenta/tarjeta

### 2. 📊 Score de Salud Financiera (0-100)

La IA evalúa tu situación completa y te da una calificación:

- **A (90-100)**: Excelente salud financiera
- **B (80-89)**: Buena salud, pequeñas mejoras
- **C (70-79)**: Salud moderada, necesita atención
- **D (60-69)**: Situación preocupante
- **F (0-59)**: Situación crítica, acción urgente

Incluye:
- ✅ **Fortalezas**: Lo que estás haciendo bien
- ⚠️ **Debilidades**: Áreas que necesitan atención
- 🎯 **Recomendaciones**: Pasos específicos para mejorar
- 📝 **Análisis detallado**: Explicación completa de tu situación

### 3. 💡 Plan de Pagos Inteligente

La IA crea una estrategia personalizada de pagos priorizando:

1. **Urgencia Alta** 🔴: 
   - Vencimientos en 7 días o menos
   - Uso de crédito >80% (afecta credit score)
   - Cuentas en mora o con penalidades

2. **Prioridad Media** 🟡:
   - Tasas de interés altas
   - Uso de crédito 60-80%
   - Deudas que crecen rápidamente

3. **Normal** 🔵:
   - Pagos regulares
   - Cuentas con buen comportamiento
   - Mantenimiento general

**Estrategias que usa**:
- **Avalanche**: Ataca primero las tasas más altas
- **Snowball**: Elimina deudas pequeñas para motivación
- **Liquidez**: Mantiene crédito disponible para emergencias
- **Moneda**: Aprovecha tasas de cambio favorables

### 4. 🚨 Alertas Financieras Inteligentes

Monitoreo continuo que genera alertas automáticas:

- **Peligro** 🔴: Problemas urgentes que requieren acción inmediata
- **Advertencia** 🟡: Situaciones a vigilar de cerca
- **Información** 🔵: Tips y recordatorios útiles
- **Éxito** 🟢: Reconocimiento de buenos hábitos

Ejemplos:
- "Tu tarjeta X está al 95% del límite - afecta tu credit score"
- "Tienes 3 vencimientos esta semana - total $15,000"
- "¡Excelente! Pagaste el balance completo este mes"

### 5. 💰 Identificación de Gastos Reducibles

La IA analiza tus patrones y sugiere donde ahorrar:

Para cada categoría de gasto:
- 📊 **Gasto actual mensual**: Cuánto gastas ahora
- ✂️ **Reducción sugerida**: Cuánto podrías ahorrar
- 💵 **Ahorro anual**: Impacto a largo plazo
- 💡 **Tips específicos**: Consejos accionables para reducir

Categorías analizadas:
- Restaurantes y delivery
- Entretenimiento (cines, bares, eventos)
- Suscripciones (Netflix, Spotify, etc.)
- Transporte (Uber, gasolina)
- Supermercado (marcas premium vs económicas)
- Servicios (telefonía, internet - mejores planes)
- Compras impulsivas

### 6. 🔮 Predicciones de Saldo Futuro

Proyecta tu situación financiera 1-3 meses adelante:

- **Estimaciones**: Saldo futuro en DOP y USD
- **Nivel de confianza**: Qué tan precisa es la predicción
- **Análisis de tendencias**: Estás mejorando o empeorando
- **Factores de riesgo**: Qué podría cambiar la predicción

Considera:
- Patrones históricos de gasto
- Pagos recurrentes confirmados
- Tendencias (crecimiento/reducción)
- Estacionalidad (ej: diciembre = más gastos)

### 7. 📈 Recomendaciones Personalizadas

Basadas en tu perfil específico:

- Estrategias de pago óptimas
- Oportunidades de consolidación de deudas
- Mejores prácticas adaptadas a RD
- Consejos para mejorar credit score
- Ideas para aumentar ahorros

## 🎯 Casos de Uso Reales

### Caso 1: María - Múltiples Tarjetas
**Situación**: 4 tarjetas, todas con saldo
**IA sugiere**:
1. Pagar primero Visa (vence en 3 días)
2. Luego Mastercard (uso 85%, afecta score)
3. American Express puede esperar (solo 40% uso)
4. Consolidar deudas pequeñas en una sola

**Resultado**: Evita mora, mejora score, reduce estrés

### Caso 2: Juan - Gastos Elevados
**Situación**: Gasta RD$45,000/mes en delivery
**IA identifica**:
- Reducir a RD$30,000 (33% menos)
- Ahorro anual: RD$180,000
- Tips: Cocinar 3 días/semana, usar cupones

**Resultado**: Más de RD$15,000/mes extra para ahorrar

### Caso 3: Ana - Predicción de Crisis
**Situación**: Gastos creciendo 15% mensual
**IA predice**:
- En 2 meses: Llegará al límite de todas las tarjetas
- Riesgo: No poder pagar mínimos
- Acción: Reducir gastos YA en 25%

**Resultado**: Evita crisis financiera antes de que ocurra

## 🚀 Cómo Usar el Sistema

- **Fechas**:
  - Fecha de corte
  - Fecha de vencimiento
  - Fecha del estado de cuenta

- **Saldos**:
  - Saldo de cierre en DOP (Pesos Dominicanos)
  - Saldo de cierre en USD (Dólares)
  - Crédito disponible en ambas monedas
  - Límites de crédito

- **Pagos**:
  - Pago mínimo en DOP
  - Pago mínimo en USD

- **Transacciones**:
  - Total de compras
  - Total de pagos
  - Intereses cobrados

- **Información adicional**:
  - Nombre del banco
  - Número de cuenta/tarjeta (últimos 4 dígitos)
  - Tasas de interés

### 2. Recomendaciones Financieras

El sistema puede generar recomendaciones personalizadas basadas en:

- Tu comportamiento de gasto
- Uso de crédito disponible
- Patrones de pago
- Acumulación de intereses

### 3. Análisis de Patrones

Analiza múltiples estados de cuenta para identificar:

- Tendencias de gasto (¿estás gastando más o menos?)
- Comportamiento de pagos (¿pagas el mínimo o el total?)
- Uso eficiente del crédito
- Alertas sobre posibles problemas financieros

## 🔧 Configuración

### 1. Obtener API Key de OpenAI

1. Visita https://platform.openai.com/api-keys
2. Crea una cuenta o inicia sesión
3. Genera una nueva API Key
4. Copia la clave (empieza con `sk-proj-...`)

### 2. Configurar Variables de Entorno

Crea o edita el archivo `.env` en la raíz del proyecto:

```env
VITE_OPENAI_API_KEY=tu-clave-aqui
```

**⚠️ IMPORTANTE**: 
- Nunca compartas tu API Key
- Nunca la subas a GitHub
- El archivo `.env` ya está en `.gitignore`

### 3. Costos de OpenAI

El modelo GPT-4o tiene costos por uso:

- **Input**: ~$2.50 por millón de tokens
- **Output**: ~$10 por millón de tokens

Un estado de cuenta típico consume:
- ~5,000 tokens de input (el PDF)
- ~500 tokens de output (los datos extraídos)
- **Costo aproximado**: ~$0.02 USD por estado de cuenta

**Recomendaciones**:
- Configura límites de gasto en OpenAI Platform
- Monitorea tu uso mensual
- Para producción, considera mover la API key al backend

## 🚀 Uso

### Subir un Estado de Cuenta

1. Ve a la sección de **Cuentas**
2. Selecciona la cuenta
3. Haz clic en "Subir Estado de Cuenta"
4. Selecciona el archivo PDF
5. La IA extraerá automáticamente todos los datos
6. Revisa y confirma los datos extraídos

### Ver Recomendaciones

Las recomendaciones aparecerán automáticamente en:

- Dashboard principal
- Detalle de cuenta
- Sección de presupuestos

## 🔍 Cómo Funciona

### Proceso de Extracción

```
1. Usuario sube PDF
   ↓
2. Sistema convierte PDF a base64
   ↓
3. Envía a GPT-4o con prompt estructurado
   ↓
4. GPT-4o analiza el documento (visión)
   ↓
5. Retorna JSON con datos extraídos
   ↓
6. Sistema valida y guarda en Firestore
   ↓
7. Usuario ve los datos automáticamente
```

### Nivel de Confianza

La IA retorna un nivel de confianza para cada extracción:

- **High** (Alto): Todos los datos encontrados claramente
- **Medium** (Medio): Algunos datos pueden estar faltando
- **Low** (Bajo): Error al procesar, datos incompletos

Solo se guardan automáticamente extracciones con confianza **High** o **Medium**.

## 📝 Campos Extraídos

### En Base de Datos (Firestore)

Cada statement incluye:

```typescript
{
  cutDate: Timestamp,
  dueDate: Timestamp,
  closingBalanceDOP: number,
  closingBalanceUSD: number,
  minimumPaymentDOP: number,
  minimumPaymentUSD: number,
  aiExtracted: boolean,        // Si fue extraído por IA
  aiConfidence: 'high' | 'medium' | 'low',
  aiNotes: string,             // Observaciones de la IA
}
```

## 🛠️ Funciones Disponibles

### `extractStatementData(file: File)`

Extrae datos estructurados de un PDF de estado de cuenta.

```typescript
import { extractStatementData } from '@/lib/openai';

const file = /* File object */;
const data = await extractStatementData(file);

console.log(data);
// {
//   cutDate: "2024-01-15",
//   dueDate: "2024-02-05",
//   closingBalanceDOP: 15000,
//   confidence: "high",
//   ...
// }
```

### `generateFinancialRecommendations(statementData)`

Genera recomendaciones basadas en un estado de cuenta.

```typescript
import { generateFinancialRecommendations } from '@/lib/openai';

const recommendations = await generateFinancialRecommendations(data);

console.log(recommendations);
// [
//   "Considera pagar más del mínimo para reducir intereses",
//   "Tu uso de crédito está en 75%, trata de mantenerlo bajo 30%",
//   ...
// ]
```

### `analyzeSpendingPatterns(statements)`

Analiza patrones de múltiples estados de cuenta.

```typescript
import { analyzeSpendingPatterns } from '@/lib/openai';

const analysis = await analyzeSpendingPatterns([data1, data2, data3]);

console.log(analysis);
// "Tus gastos han incrementado un 15% en los últimos 3 meses..."
```

## ⚠️ Limitaciones

### Navegador vs Backend

Actualmente la API se llama desde el navegador (`dangerouslyAllowBrowser: true`):

**Ventajas**:
- Implementación rápida
- No necesita backend

**Desventajas**:
- API Key expuesta en el cliente
- Limitaciones de CORS
- Usuario paga por su uso

**Para Producción**:
- Mover la lógica a Firebase Functions o backend
- Ocultar la API Key del cliente
- Implementar límites por usuario

### Precisión de Extracción

La precisión depende de:

- **Calidad del PDF**: PDFs escaneados vs nativos
- **Formato del banco**: Cada banco tiene formatos diferentes
- **Claridad del documento**: Texto legible, no imágenes borrosas

Si la extracción falla:
- Verifica que el PDF no esté protegido
- Asegúrate de que el texto sea seleccionable
- Intenta con otro estado de cuenta

## 🔐 Seguridad

### Protección de API Key

- ✅ Archivo `.env` en `.gitignore`
- ✅ No se sube a repositorios públicos
- ⚠️ Expuesta en el build del cliente

### Datos Financieros

- Los PDFs se suben a Firebase Storage (privado)
- Los datos extraídos se guardan en Firestore (privado)
- Solo el usuario autenticado puede ver sus datos
- OpenAI **NO** almacena los PDFs enviados (según su política)

### Mejores Prácticas

1. **Límites de gasto**: Configura alertas en OpenAI Platform
2. **Rotación de keys**: Cambia la API key periódicamente
3. **Monitoreo**: Revisa el uso mensual de la API
4. **Backend**: En producción, mueve la API key al servidor

## 🐛 Troubleshooting

### Error: "Invalid API Key"

- Verifica que la API Key esté correcta en `.env`
- Asegúrate de reiniciar el servidor de desarrollo
- Confirma que la key empiece con `sk-proj-`

### Error: "Rate limit exceeded"

- Has excedido el límite de requests de OpenAI
- Espera unos minutos antes de reintentar
- Verifica tus límites en OpenAI Platform

### Datos Extraídos Incorrectos

- Revisa el nivel de confianza (`aiConfidence`)
- Verifica las notas de la IA (`aiNotes`)
- Si persiste, reporta el issue con el PDF de ejemplo

### PDF No Se Procesa

- Verifica que el archivo sea realmente un PDF
- Confirma que no esté protegido con contraseña
- Intenta con un PDF más pequeño (<5 MB)

## 📊 Monitoreo

### Revisar Uso de OpenAI

1. Ve a https://platform.openai.com/usage
2. Revisa el consumo diario/mensual
3. Configura alertas de gasto
4. Descarga reportes para análisis

### Logs en Consola

El sistema muestra logs detallados:

```
[OpenAI] Procesando PDF: statement.pdf
[OpenAI] Respuesta recibida: {...}
[OpenAI] ✅ Datos extraídos exitosamente
```

## 🚀 Próximas Mejoras

- [ ] Mover API Key al backend (Firebase Functions)
- [ ] Caché de extractiones para evitar procesar dos veces
- [ ] Extracción de transacciones individuales
- [ ] Detección automática de categorías de gasto
- [ ] Dashboard de insights con gráficas
- [ ] Alertas inteligentes (ej: "Gastos inusuales detectados")
- [ ] Exportar análisis a PDF
- [ ] Comparación entre meses

## 📚 Recursos

- [Documentación OpenAI](https://platform.openai.com/docs)
- [GPT-4o Vision](https://platform.openai.com/docs/guides/vision)
- [Pricing OpenAI](https://openai.com/pricing)
- [Best Practices](https://platform.openai.com/docs/guides/production-best-practices)

---

**Desarrollado con ❤️ usando OpenAI GPT-4o**
