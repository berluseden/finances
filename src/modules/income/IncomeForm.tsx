import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useCreateIncome, useUpdateIncome } from './hooks/useIncome';
import type { Income, IncomeFormData, Currency, IncomeType } from '@/types/models';

interface IncomeFormProps {
  income?: Income;
  onSuccess: () => void;
  onCancel: () => void;
}

export function IncomeForm({ income, onSuccess, onCancel }: IncomeFormProps) {
  const createMutation = useCreateIncome();
  const updateMutation = useUpdateIncome();

  const [formData, setFormData] = useState<IncomeFormData>({
    source: '',
    type: 'salary',
    amount: 0,
    currency: 'DOP',
    date: new Date(),
    recurring: false,
    recurringDay: undefined,
    categoryId: '',
    notes: '',
  });

  // Cargar datos si es edición
  useEffect(() => {
    if (income) {
      setFormData({
        source: income.source,
        type: income.type,
        amount: income.amount,
        currency: income.currency,
        date: income.date.toDate(),
        recurring: income.recurring,
        recurringDay: income.recurringDay,
        categoryId: income.categoryId || '',
        notes: income.notes || '',
      });
    }
  }, [income]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (income) {
        await updateMutation.mutateAsync({
          incomeId: income.id,
          data: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving income:', error);
    }
  };

  const incomeTypeOptions = [
    { value: 'salary', label: '💼 Salario', icon: '💼' },
    { value: 'freelance', label: '💻 Freelance', icon: '💻' },
    { value: 'bonus', label: '🎁 Bono/Extra', icon: '🎁' },
    { value: 'investment', label: '📈 Inversión', icon: '📈' },
    { value: 'business', label: '🏢 Negocio', icon: '🏢' },
    { value: 'other', label: '💰 Otro', icon: '💰' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Fuente de Ingreso *</label>
          <Input
            type="text"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            placeholder="Ej: Salario Empresa ABC, Proyecto Freelance, Bono Anual..."
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Tipo *</label>
          <Select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as IncomeType })}
            options={incomeTypeOptions}
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium mb-1">Monto *</label>
          <Input
            type="number"
            step="0.01"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            required
          />
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium mb-1">Moneda</label>
          <Select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
            options={[
              { value: 'DOP', label: 'DOP (Peso Dominicano)' },
              { value: 'USD', label: 'USD (Dólar Americano)' },
            ]}
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium mb-1">Fecha *</label>
          <Input
            type="date"
            value={formData.date.toISOString().split('T')[0]}
            onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
            required
          />
        </div>

        {/* Recurring */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.recurring}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recurring: e.target.checked,
                  recurringDay: e.target.checked ? new Date().getDate() : undefined,
                })
              }
              className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
            <label htmlFor="recurring" className="flex-1 cursor-pointer">
              <span className="font-medium text-green-900 dark:text-green-100">
                🔄 Ingreso Recurrente Mensual
              </span>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Se recibirá automáticamente cada mes el mismo día
              </p>
            </label>
          </div>
        </div>

        {/* Recurring Day */}
        {formData.recurring && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              📅 Día del Mes que se Recibe *
            </label>
            <Input
              type="number"
              min="1"
              max="31"
              value={formData.recurringDay || ''}
              onChange={(e) =>
                setFormData({ ...formData, recurringDay: parseInt(e.target.value) || undefined })
              }
              placeholder="Ej: 15 (día 15 de cada mes)"
              required={formData.recurring}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Día del mes en que recibes este ingreso (1-31)
            </p>
          </div>
        )}

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Notas</label>
          <Input
            type="text"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Nota adicional (opcional)"
          />
        </div>
      </div>

      {/* Preview */}
      {formData.amount > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-medium mb-2 text-green-900 dark:text-green-100">
            Vista Previa
          </h4>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-green-900 dark:text-green-100">
                {incomeTypeOptions.find((t) => t.value === formData.type)?.icon}{' '}
                {formData.source || 'Sin fuente'}
              </span>
              {formData.recurring && (
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  🔄 Recurrente: Día {formData.recurringDay} de cada mes
                </p>
              )}
            </div>
            <span className="font-bold text-2xl text-green-600 dark:text-green-400">
              +{formData.currency === 'DOP' ? 'RD$' : '$'}
              {formData.amount.toLocaleString('es-DO', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          {createMutation.isPending || updateMutation.isPending
            ? 'Guardando...'
            : income
            ? 'Actualizar'
            : 'Crear'}{' '}
          Ingreso
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>

      {(createMutation.isError || updateMutation.isError) && (
        <p className="text-sm text-red-600">Error al guardar el ingreso. Inténtalo de nuevo.</p>
      )}
    </form>
  );
}
