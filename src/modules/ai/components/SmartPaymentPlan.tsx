import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Sparkles, AlertCircle, Clock, DollarSign } from 'lucide-react';
import { usePaymentPlan } from '../hooks/useAIInsights';
import { formatCurrency } from '@/lib/currency';

export function SmartPaymentPlan() {
  const { data: plan, isLoading, error } = usePaymentPlan();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-5 h-5 animate-spin text-purple-500" />
            <p className="text-gray-600 dark:text-gray-400">
              Generando plan de pagos estratégico...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !plan) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-gray-500">
            <AlertCircle className="w-5 h-5" />
            <p>No se pudo generar el plan de pagos. Agrega cuentas primero.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'border-red-500 bg-red-50 dark:bg-red-950/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return (
          <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
            URGENTE
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
            PRIORIDAD
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
            NORMAL
          </span>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Plan de Pagos Inteligente
        </CardTitle>
        <p className="text-white/80 text-sm">
          Estrategia optimizada por IA para maximizar tu salud financiera
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Explicación de la estrategia */}
        <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
          <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
            📊 Estrategia Recomendada
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {plan.explanation}
          </p>
        </div>

        {/* Lista priorizada de pagos */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Orden de Prioridad
          </h3>
          <div className="space-y-3">
            {plan.priority.map((item, index) => (
              <div
                key={index}
                className={`border-l-4 rounded-lg p-4 ${getUrgencyColor(item.urgency)}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {item.account}
                      </h4>
                    </div>
                  </div>
                  {getUrgencyBadge(item.urgency)}
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-3 ml-11">
                  {item.reason}
                </p>

                <div className="flex items-center gap-2 ml-11">
                  <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="font-semibold text-green-700 dark:text-green-300">
                    Pagar: {formatCurrency(item.suggestedAmount, item.currency as 'DOP' | 'USD')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nota final */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
            <span>
              Este plan se actualiza automáticamente basándose en tus cuentas y pagos recurrentes.
              Sigue estas recomendaciones para mejorar tu salud financiera.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
