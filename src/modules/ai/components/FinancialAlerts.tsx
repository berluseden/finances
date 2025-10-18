import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle, Sparkles } from 'lucide-react';
import { useFinancialAlerts } from '../hooks/useAIInsights';

export function FinancialAlerts() {
  const { data: alerts, isLoading } = useFinancialAlerts();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 animate-spin text-purple-500" />
            <p className="text-gray-600 dark:text-gray-400">Analizando tu situación...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Sin Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            Todo se ve bien. ¡Sigue así! 🎉
          </p>
        </CardContent>
      </Card>
    );
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'danger':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'danger':
        return 'border-red-500 bg-red-50 dark:bg-red-950/20';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'success':
        return 'border-green-500 bg-green-50 dark:bg-green-950/20';
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Alertas Inteligentes ({alerts.length})
        </CardTitle>
        <p className="text-white/80 text-sm">
          Notificaciones importantes sobre tu situación financiera
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`border-l-4 rounded-lg p-4 ${getAlertStyle(alert.type)}`}
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {alert.title}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                    {alert.message}
                  </p>
                  {alert.action && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        💡 Acción sugerida: {alert.action}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Las alertas se actualizan automáticamente cada hora
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
