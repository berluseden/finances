import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTransactions } from './hooks/useTransactions';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { Plus, Receipt, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import type { Transaction } from '@/types/models';

export function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { data: transactions } = useTransactions();

  // Calcular estadísticas
  const stats = transactions?.reduce((acc, transaction) => {
    if (transaction.type === 'charge') {
      acc.totalCharges += transaction.amount;
      acc.chargeCount++;
    } else if (transaction.type === 'payment') {
      acc.totalPayments += transaction.amount;
      acc.paymentCount++;
    }
    return acc;
  }, { totalCharges: 0, totalPayments: 0, chargeCount: 0, paymentCount: 0 });

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {editingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {editingTransaction ? 'Modifica los detalles de la transacción' : 'Registra un nuevo movimiento financiero'}
            </p>
          </div>
          <Button variant="outline" onClick={handleFormCancel}>
            Volver
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <TransactionForm
              transaction={editingTransaction || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Transacciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus ingresos, gastos y movimientos financieros
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Transacción
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Cargos</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {formatCurrency(stats?.totalCharges || 0, 'DOP')}
                </p>
                <p className="text-xs text-red-500 dark:text-red-400">
                  {stats?.chargeCount || 0} transacciones
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Pagos</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(stats?.totalPayments || 0, 'DOP')}
                </p>
                <p className="text-xs text-green-500 dark:text-green-400">
                  {stats?.paymentCount || 0} transacciones
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Balance Neto</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency((stats?.totalPayments || 0) - (stats?.totalCharges || 0), 'DOP')}
                </p>
                <p className="text-xs text-blue-500 dark:text-blue-400">
                  Pagos - Cargos
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Transacciones</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {transactions?.length || 0}
                </p>
                <p className="text-xs text-purple-500 dark:text-purple-400">
                  Registradas
                </p>
              </div>
              <Receipt className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <TransactionList onEdit={handleEdit} />
    </div>
  );
}