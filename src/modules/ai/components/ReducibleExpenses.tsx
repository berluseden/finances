import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { TrendingDown, Sparkles, DollarSign, Lightbulb } from 'lucide-react';
import { useReducibleExpenses } from '../hooks/useAIInsights';
import { formatCurrency } from '@/lib/currency';
import type { StatementData } from '@/lib/openai';

interface ReducibleExpensesProps {
  statements: StatementData[];
}

export function ReducibleExpenses({ statements }: ReducibleExpensesProps) {
  const { data: expenses, isLoading } = useReducibleExpenses(statements);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 animate-spin text-purple-500" />
            <p className="text-gray-600 dark:text-gray-400">
              Identificando oportunidades de ahorro...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-green-500" />
            Análisis de Gastos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            Sube más estados de cuenta para obtener recomendaciones de ahorro personalizadas.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalPotentialSavings = expenses.reduce(
    (sum, exp) => sum + exp.potentialSavings,
    0
  );

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          Oportunidades de Ahorro
        </CardTitle>
        <p className="text-white/80 text-sm">
          Gastos que puedes reducir para mejorar tu situación financiera
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Resumen de ahorro potencial */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                Ahorro Anual Potencial
              </p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(totalPotentialSavings, 'DOP')}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-500 opacity-50" />
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            ¡Imagina lo que podrías hacer con este dinero extra!
          </p>
        </div>

        {/* Lista de gastos reducibles */}
        <div className="space-y-4">
          {expenses.map((expense, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {expense.category}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Gasto actual mensual: {formatCurrency(expense.currentSpending, 'DOP')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ahorro mensual
                  </p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    -{formatCurrency(expense.suggestedReduction, 'DOP')}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Reducción sugerida</span>
                  <span>
                    {((expense.suggestedReduction / expense.currentSpending) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                    style={{
                      width: `${(expense.suggestedReduction / expense.currentSpending) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Consejos para reducir este gasto:
                </p>
                <ul className="space-y-1">
                  {expense.tips.map((tip, tipIndex) => (
                    <li
                      key={tipIndex}
                      className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2"
                    >
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  💰 Ahorro anual si reduces este gasto:{' '}
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(expense.potentialSavings, 'DOP')}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Motivación final */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
            <span>
              Pequeños cambios en tus hábitos de consumo pueden generar grandes ahorros a largo plazo.
              ¡No tienes que eliminar todo, solo optimizar! 🎯
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
