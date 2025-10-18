import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FinancialHealthScore } from './components/FinancialHealthScore';
import { SmartPaymentPlan } from './components/SmartPaymentPlan';
import { FinancialAlerts } from './components/FinancialAlerts';
import { ReducibleExpenses } from './components/ReducibleExpenses';
import { Card, CardContent } from '@/components/ui/Card';
import { Sparkles, Brain, TrendingUp, Zap } from 'lucide-react';
import type { StatementData } from '@/lib/openai';

export function AIInsightsPage() {
  // TODO: Obtener statements reales del usuario
  const statements: StatementData[] = []; // Por ahora vacío

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Análisis Financiero con IA</h1>
              <p className="text-white/80 mt-1">
                Insights inteligentes para mejorar tu salud financiera
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-semibold">Análisis Inteligente</h3>
              </div>
              <p className="text-sm text-white/80">
                IA analiza tus patrones de gasto y genera recomendaciones personalizadas
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <h3 className="font-semibold">Predicciones</h3>
              </div>
              <p className="text-sm text-white/80">
                Proyecta tu situación financiera futura y anticipa problemas
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5" />
                <h3 className="font-semibold">Accionable</h3>
              </div>
              <p className="text-sm text-white/80">
                Recibe pasos específicos que puedes tomar hoy para mejorar
              </p>
            </div>
          </div>
        </div>

        {/* Score de Salud Financiera */}
        <FinancialHealthScore />

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Plan de Pagos */}
          <SmartPaymentPlan />

          {/* Alertas */}
          <FinancialAlerts />
        </div>

        {/* Gastos Reducibles */}
        {statements.length > 0 && <ReducibleExpenses statements={statements} />}

        {/* Información sobre la IA */}
        <Card className="border-2 border-dashed border-purple-300 dark:border-purple-700">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  ¿Cómo funciona el análisis con IA?
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
                  Utilizamos OpenAI GPT-4o para analizar tus datos financieros y generar
                  recomendaciones personalizadas. La IA considera:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Tus patrones históricos de gasto y pago</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>El uso de tu crédito disponible y límites</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Fechas de vencimiento y pagos recurrentes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Mejores prácticas financieras y estrategias de pago</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>El contexto económico de República Dominicana</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  💡 Tip: Los análisis se actualizan automáticamente cuando agregas nuevos datos.
                  Sube tus estados de cuenta para obtener insights más precisos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
