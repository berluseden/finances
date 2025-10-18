import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAccounts } from '@/modules/accounts/hooks/useAccounts';
import { useCategories } from '@/modules/categories/hooks/useCategories';
import { useCreateTransaction } from './hooks/useTransactions';
import { TransactionFormData, Currency, TransactionType } from '@/types/models';
import { formatCurrency } from '@/lib/currency';

interface TransactionFormProps {
  transaction?: any; // Para edición futura
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransactionForm({ transaction, onSuccess, onCancel }: TransactionFormProps) {
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const createMutation = useCreateTransaction();

  const [formData, setFormData] = useState<TransactionFormData>({
    accountId: '',
    date: new Date(),
    description: '',
    amount: 0,
    currency: 'DOP',
    type: 'charge',
    categoryId: '',
    note: '',
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // Cargar datos si es edición
  useEffect(() => {
    if (transaction) {
      setFormData({
        accountId: transaction.accountId,
        date: transaction.date.toDate(),
        description: transaction.description,
        amount: transaction.amount,
        currency: transaction.currency,
        type: transaction.type,
        categoryId: transaction.categoryId || '',
        note: transaction.note || '',
      });
    }
  }, [transaction]);

  // Auto-seleccionar cuenta si solo hay una
  useEffect(() => {
    if (accounts && accounts.length === 1 && !formData.accountId) {
      setFormData(prev => ({ ...prev, accountId: accounts[0].id }));
    }
  }, [accounts, formData.accountId]);

  // Auto-seleccionar moneda basada en la cuenta
  useEffect(() => {
    if (formData.accountId && accounts) {
      const selectedAccount = accounts.find(acc => acc.id === formData.accountId);
      if (selectedAccount) {
        setFormData(prev => ({ ...prev, currency: selectedAccount.currencyPrimary }));
      }
    }
  }, [formData.accountId, accounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        ...formData,
        receiptFile: receiptFile || undefined,
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const selectedAccount = accounts?.find(acc => acc.id === formData.accountId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Account */}
        <div>
          <label className="block text-sm font-medium mb-1">Cuenta *</label>
          <Select
            value={formData.accountId}
            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            options={[
              { value: '', label: 'Seleccionar cuenta' },
              ...(accounts?.map(account => ({
                value: account.id,
                label: `${account.name} (${account.bank})`
              })) || [])
            ]}
            required
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

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Descripción *</label>
          <Input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ej: Compra en supermercado, Pago de luz, etc."
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
          {selectedAccount && (
            <p className="text-xs text-muted-foreground mt-1">
              Moneda de la cuenta: {selectedAccount.currencyPrimary}
            </p>
          )}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Tipo *</label>
          <Select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
            options={[
              { value: 'charge', label: 'Cargo (Gasto)' },
              { value: 'payment', label: 'Pago (Ingreso)' },
              { value: 'fee', label: 'Comisión/Cargo' },
              { value: 'interest', label: 'Interés' },
            ]}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <Select
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            options={[
              { value: '', label: 'Sin categoría' },
              ...(categories?.map(category => ({
                value: category.id,
                label: category.name
              })) || [])
            ]}
          />
        </div>

        {/* Receipt */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Recibo (Opcional)</label>
          <Input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Sube una imagen o PDF del recibo
          </p>
        </div>

        {/* Note */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Nota</label>
          <Input
            type="text"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="Nota adicional (opcional)"
          />
        </div>
      </div>

      {/* Preview */}
      {formData.amount > 0 && (
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Vista Previa</h4>
          <div className="flex justify-between items-center">
            <span>{formData.description || 'Sin descripción'}</span>
            <span className={`font-bold ${
              formData.type === 'payment' ? 'text-green-600' : 'text-red-600'
            }`}>
              {formData.type === 'payment' ? '+' : '-'}
              {formatCurrency(formData.amount, formData.currency)}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Guardando...' : (transaction ? 'Actualizar' : 'Crear')} Transacción
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </div>

      {createMutation.isError && (
        <p className="text-sm text-red-600">
          Error al guardar la transacción. Inténtalo de nuevo.
        </p>
      )}
    </form>
  );
}