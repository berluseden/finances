import { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IncomeForm } from './IncomeForm';
import {
  useIncome,
  useRecurringIncome,
  useCurrentMonthIncome,
  useProjectedMonthlyIncome,
  useUpcomingRecurringIncome,
  useDeleteIncome,
} from './hooks/useIncome';
import {
  Plus,
  DollarSign,
  TrendingUp,
  Calendar,
  Repeat,
  Edit,
  Trash2,
  Briefcase,
  Laptop,
  Gift,
  Building2,
  Wallet,
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { formatDate, formatRelative } from '@/lib/date';
import type { Income } from '@/types/models';

export function IncomePage() {
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [incomeToDelete, setIncomeToDelete] = useState<string | null>(null);

  const { data: allIncome = [], isLoading } = useIncome();
  const { data: recurringIncome = [] } = useRecurringIncome();
  const { data: monthlyData } = useCurrentMonthIncome();
  const projected = useProjectedMonthlyIncome();
  const upcomingIncome = useUpcomingRecurringIncome();
  const deleteIncome = useDeleteIncome();

  const handleDelete = async (id: string) => {
    try {
      await deleteIncome.mutateAsync(id);
      toast.success('Ingreso eliminado');
    } catch (error) {
      console.error('Error deleting income:', error);
      toast.error('Error al eliminar el ingreso');
    }
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setShowForm(true);
  };

  const getIncomeIcon = (type: string) => {
    const icons: Record<string, any> = {
      salary: Briefcase,
      freelance: Laptop,
      bonus: Gift,
      investment: TrendingUp,
      business: Building2,
      other: Wallet,
    };
    return icons[type] || Wallet;
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {editingIncome ? 'Editar Ingreso' : 'Nuevo Ingreso'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {editingIncome
                ? 'Modifica los detalles del ingreso'
                : 'Registra un nuevo ingreso o fuente de ingresos recurrente'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setShowForm(false);
              setEditingIncome(null);
            }}
          >
            Volver
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <IncomeForm
              income={editingIncome || undefined}
              onSuccess={() => {
                setShowForm(false);
                setEditingIncome(null);
                toast.success(editingIncome ? 'Ingreso actualizado' : 'Ingreso creado exitosamente');
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingIncome(null);
              }}
            />
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            💰 Ingresos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus fuentes de ingresos y proyecciones mensuales
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Ingreso
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Este Mes
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(monthlyData?.totalDOP || 0, 'DOP')}
                </p>
                <p className="text-xs text-green-500 dark:text-green-400">
                  {monthlyData?.count || 0} ingresos recibidos
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-900 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Proyectado Mensual
                </p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(projected.projectedDOP, 'DOP')}
                </p>
                <p className="text-xs text-emerald-500 dark:text-emerald-400">
                  {projected.sources} fuentes recurrentes
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-950 dark:to-cyan-900 border-teal-200 dark:border-teal-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
                  Ingresos Recurrentes
                </p>
                <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                  {recurringIncome.length}
                </p>
                <p className="text-xs text-teal-500 dark:text-teal-400">Configurados</p>
              </div>
              <Repeat className="w-8 h-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-950 dark:to-blue-900 border-cyan-200 dark:border-cyan-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
                  Total Registrados
                </p>
                <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">
                  {allIncome.length}
                </p>
                <p className="text-xs text-cyan-500 dark:text-cyan-400">Histórico</p>
              </div>
              <Wallet className="w-8 h-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Ingresos Recurrentes */}
      {upcomingIncome && upcomingIncome.length > 0 && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Calendar className="w-5 h-5" />
              Próximos Ingresos Recurrentes
            </CardTitle>
            <CardDescription>Ingresos esperados en los próximos días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingIncome.slice(0, 5).map((income) => {
                const Icon = getIncomeIcon(income.type);
                return (
                  <div
                    key={income.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">
                          {income.source}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          📅 {formatDate(income.nextDate)} •{' '}
                          {income.daysUntil === 0
                            ? '¡Hoy!'
                            : income.daysUntil === 1
                            ? 'Mañana'
                            : `En ${income.daysUntil} días`}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-lg text-green-600 dark:text-green-400">
                      +{formatCurrency(income.amount, income.currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Ingresos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Todos los Ingresos
          </CardTitle>
          <CardDescription>Historial completo de ingresos recibidos</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando ingresos...</p>
            </div>
          ) : allIncome.length === 0 ? (
            <div className="py-12 text-center">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay ingresos registrados</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primer ingreso para empezar a rastrear tus fuentes de ingresos
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Ingreso
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {allIncome.map((income) => {
                const Icon = getIncomeIcon(income.type);
                return (
                  <div
                    key={income.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{income.source}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatDate(income.date.toDate())}</span>
                          <span>•</span>
                          <span>{formatRelative(income.date)}</span>
                          {income.recurring && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 dark:text-green-400">
                                🔄 Recurrente (Día {income.recurringDay})
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg text-green-600 dark:text-green-400">
                        +{formatCurrency(income.amount, income.currency)}
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(income)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setIncomeToDelete(income.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!incomeToDelete}
        title="Eliminar Ingreso"
        message="¿Estás seguro que deseas eliminar este ingreso? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (incomeToDelete) {
            handleDelete(incomeToDelete);
          }
        }}
        onCancel={() => setIncomeToDelete(null)}
      />
    </div>
  );
}
