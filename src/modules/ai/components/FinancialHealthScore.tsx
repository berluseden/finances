import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Sparkles, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { useFinancialHealthScore } from '../hooks/useAIInsights';

export function FinancialHealthScore() {
  const { data: health, isLoading } = useFinancialHealthScore();

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-5 h-5 animate-spin text-purple-500" />
            <p className="text-gray-600 dark:text-gray-400">
              Analizando tu salud financiera con IA...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!health) return null;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'from-green-500 to-emerald-600';
      case 'B':
        return 'from-blue-500 to-cyan-600';
      case 'C':
        return 'from-yellow-500 to-orange-600';
      case 'D':
        return 'from-orange-500 to-red-600';
      default:
        return 'from-red-500 to-red-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className="col-span-full overflow-hidden">
      <CardHeader className={`bg-gradient-to-r ${getGradeColor(health.grade)} text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5" />
              Análisis de Salud Financiera con IA
            </CardTitle>
            <p className="text-white/80 text-sm mt-1">
              Evaluación inteligente de tu situación financiera
            </p>
          </div>
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(health.score)}`}>
              {health.grade}
            </div>
            <div className="text-white/90 text-lg font-semibold">
              {health.score}/100
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Resumen */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {health.summary}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Fortalezas */}
          <div>
            <h3 className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold mb-3">
              <CheckCircle className="w-5 h-5" />
              Fortalezas
            </h3>
            <ul className="space-y-2">
              {health.strengths.map((strength, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                >
                  <span className="text-green-500 mt-1">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Áreas de Mejora */}
          <div>
            <h3 className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-semibold mb-3">
              <AlertTriangle className="w-5 h-5" />
              Áreas de Mejora
            </h3>
            <ul className="space-y-2">
              {health.weaknesses.map((weakness, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                >
                  <span className="text-orange-500 mt-1">!</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recomendaciones */}
        <div>
          <h3 className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-semibold mb-3">
            <Target className="w-5 h-5" />
            Recomendaciones Prioritarias
          </h3>
          <div className="space-y-3">
            {health.recommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-start gap-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3"
              >
                <span className="flex-shrink-0 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-gray-700 dark:text-gray-300">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
