import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  Target,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { Budget, Currency } from '@/types/models';
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from './hooks/useBudgets';

const categoryNames: Record<string, string> = {
  'alimentacion': 'Alimentación',
  'transporte': 'Transporte',
  'servicios': 'Servicios',
  'entretenimiento': 'Entretenimiento',
  'otros': 'Otros',
};

export function BudgetsPage() {
  const { data: budgets = [] } = useBudgets();
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const currentBudget = budgets.find(b => b.month === selectedMonth);

  const handleCreateBudget = () => {
    const newBudget: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      month: selectedMonth,
      totalPlannedDOP: 0,
      totalPlannedUSD: 0,
      totalActualDOP: 0,
      totalActualUSD: 0,
      categoryBudgets: {},
    };
    
    createBudgetMutation.mutate(newBudget, {
      onSuccess: () => {
        setShowForm(true);
      }
    });
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteBudgetMutation.mutate(id);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage <= 75) return 'bg-green-500';
    if (percentage <= 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage <= 75) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (percentage <= 90) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <TrendingUp className="w-4 h-4 text-red-500" />;
  };

  if (showForm && editingBudget) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Editar Presupuesto
            </h1>
            <p className="text-muted-foreground mt-1">
              Configura los límites de gasto por categoría para {selectedMonth}
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Volver
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Total Planeado DOP</label>
                  <Input
                    type="number"
                    value={editingBudget.totalPlannedDOP}
                    onChange={(e) => setEditingBudget({
                      ...editingBudget,
                      totalPlannedDOP: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Planeado USD</label>
                  <Input
                    type="number"
                    value={editingBudget.totalPlannedUSD}
                    onChange={(e) => setEditingBudget({
                      ...editingBudget,
                      totalPlannedUSD: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Presupuestos por Categoría</h3>
                <div className="space-y-4">
                  {Object.entries(categoryNames).map(([key, name]) => {
                    const categoryBudget = editingBudget.categoryBudgets[key] || { planned: 0, actual: 0, currency: 'DOP' as Currency };

                    return (
                      <div key={key} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Planeado"
                            value={categoryBudget.planned}
                            onChange={(e) => {
                              const newBudgets = { ...editingBudget.categoryBudgets };
                              newBudgets[key] = {
                                ...categoryBudget,
                                planned: parseFloat(e.target.value) || 0
                              };
                              setEditingBudget({
                                ...editingBudget,
                                categoryBudgets: newBudgets
                              });
                            }}
                            className="w-32"
                          />
                          <Select
                            value={categoryBudget.currency}
                            onChange={(e) => {
                              const newBudgets = { ...editingBudget.categoryBudgets };
                              newBudgets[key] = {
                                ...categoryBudget,
                                currency: e.target.value as Currency
                              };
                              setEditingBudget({
                                ...editingBudget,
                                categoryBudgets: newBudgets
                              });
                            }}
                            options={[
                              { value: 'DOP', label: 'DOP' },
                              { value: 'USD', label: 'USD' },
                            ]}
                            className="w-20"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => {
                  updateBudgetMutation.mutate({
                    id: editingBudget.id,
                    month: editingBudget.month,
                    totalPlannedDOP: editingBudget.totalPlannedDOP,
                    totalPlannedUSD: editingBudget.totalPlannedUSD,
                    totalActualDOP: editingBudget.totalActualDOP,
                    totalActualUSD: editingBudget.totalActualUSD,
                    categoryBudgets: editingBudget.categoryBudgets,
                  }, {
                    onSuccess: () => {
                      setShowForm(false);
                      setEditingBudget(null);
                    }
                  });
                }}>
                  Guardar Cambios
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Presupuestos
          </h1>
          <p className="text-muted-foreground mt-1">
            Controla tus gastos mensuales por categoría
          </p>
        </div>
      </div>

      {/* Month Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mes</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
            {currentBudget ? (
              <Button variant="outline" onClick={() => handleEdit(currentBudget)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar Presupuesto
              </Button>
            ) : (
              <Button onClick={handleCreateBudget}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Presupuesto
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Budget Overview */}
      {currentBudget && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Planeado</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(currentBudget.totalPlannedDOP, 'DOP')}
                    </p>
                    {currentBudget.totalPlannedUSD > 0 && (
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {formatCurrency(currentBudget.totalPlannedUSD, 'USD')}
                      </p>
                    )}
                  </div>
                  <Target className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Gastado</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {formatCurrency(currentBudget.totalActualDOP, 'DOP')}
                    </p>
                    {currentBudget.totalActualUSD > 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {formatCurrency(currentBudget.totalActualUSD, 'USD')}
                      </p>
                    )}
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Disponible</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {formatCurrency(currentBudget.totalPlannedDOP - currentBudget.totalActualDOP, 'DOP')}
                    </p>
                    {currentBudget.totalPlannedUSD > 0 && (
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        {formatCurrency(currentBudget.totalPlannedUSD - currentBudget.totalActualUSD, 'USD')}
                      </p>
                    )}
                  </div>
                  <Calendar className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Desglose por Categoría</CardTitle>
              <CardDescription>
                Seguimiento del progreso de cada categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(currentBudget.categoryBudgets).map(([key, budget]) => {
                  const percentage = budget.planned > 0 ? (budget.actual / budget.planned) * 100 : 0;
                  const remaining = budget.planned - budget.actual;

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(percentage)}
                          <span className="font-medium">{categoryNames[key] || key}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">
                            {formatCurrency(budget.actual, budget.currency)} / {formatCurrency(budget.planned, budget.currency)}
                          </span>
                          <p className="text-sm text-muted-foreground">
                            {percentage.toFixed(1)}% usado
                          </p>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>

                      {remaining > 0 ? (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Quedan {formatCurrency(remaining, budget.currency)} disponibles
                        </p>
                      ) : (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          Excedido por {formatCurrency(Math.abs(remaining), budget.currency)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Budget History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Presupuestos</CardTitle>
          <CardDescription>
            Presupuestos de meses anteriores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgets
              .filter(b => b.month !== selectedMonth)
              .sort((a, b) => b.month.localeCompare(a.month))
              .map((budget) => {
                const totalSpent = budget.totalActualDOP + budget.totalActualUSD;
                const totalPlanned = budget.totalPlannedDOP + budget.totalPlannedUSD;
                const percentage = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;

                return (
                  <div key={budget.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">
                        {new Date(budget.month + '-01').toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(totalSpent, 'DOP')} gastado de {formatCurrency(totalPlanned, 'DOP')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-semibold">{percentage.toFixed(1)}%</span>
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(percentage)}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(budget)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(budget.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}