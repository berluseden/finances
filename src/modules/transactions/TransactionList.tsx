import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useTransactions, useDeleteTransaction } from './hooks/useTransactions';
import { useAccounts } from '@/modules/accounts/hooks/useAccounts';
import { Transaction, TransactionType, Currency } from '@/types/models';
import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import {
  Edit,
  Trash2,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Receipt,
  Calendar,
  CreditCard
} from 'lucide-react';

interface TransactionListProps {
  onEdit?: (transaction: Transaction) => void;
  showFilters?: boolean;
  limit?: number;
}

export function TransactionList({ onEdit, showFilters = true, limit }: TransactionListProps) {
  const { data: transactions, isLoading } = useTransactions();
  const { data: accounts } = useAccounts();
  const deleteMutation = useDeleteTransaction();

  const [filters, setFilters] = useState({
    accountId: '',
    type: '' as TransactionType | '',
    currency: '' as Currency | '',
    startDate: '',
    endDate: '',
  });

  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Aplicar filtros
  const filteredTransactions = transactions?.filter(transaction => {
    if (filters.accountId && transaction.accountId !== filters.accountId) return false;
    if (filters.type && transaction.type !== filters.type) return false;
    if (filters.currency && transaction.currency !== filters.currency) return false;

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      if (transaction.date.toDate() < startDate) return false;
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      if (transaction.date.toDate() > endDate) return false;
    }

    return true;
  }) || [];

  // Aplicar ordenamiento
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortBy) {
      case 'date':
        aValue = a.date.toMillis();
        bValue = b.date.toMillis();
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'description':
        aValue = a.description.toLowerCase();
        bValue = b.description.toLowerCase();
        break;
      default:
        return 0;
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Aplicar límite si se especifica
  const displayTransactions = limit ? sortedTransactions.slice(0, limit) : sortedTransactions;

  const handleDelete = async (transactionId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      try {
        await deleteMutation.mutateAsync(transactionId);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const getAccountName = (accountId: string) => {
    return accounts?.find(acc => acc.id === accountId)?.name || 'Cuenta desconocida';
  };

  const getTypeColor = (type: TransactionType) => {
    switch (type) {
      case 'payment':
        return 'text-green-600 dark:text-green-400';
      case 'charge':
        return 'text-red-600 dark:text-red-400';
      case 'fee':
        return 'text-orange-600 dark:text-orange-400';
      case 'interest':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'payment':
        return <ArrowUp className="w-4 h-4" />;
      case 'charge':
        return <ArrowDown className="w-4 h-4" />;
      case 'fee':
        return <CreditCard className="w-4 h-4" />;
      case 'interest':
        return <Calendar className="w-4 h-4" />;
      default:
        return <ArrowUpDown className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Select
                label="Cuenta"
                value={filters.accountId}
                onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
                options={[
                  { value: '', label: 'Todas las cuentas' },
                  ...(accounts?.map(account => ({
                    value: account.id,
                    label: account.name
                  })) || [])
                ]}
              />

              <Select
                label="Tipo"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as TransactionType })}
                options={[
                  { value: '', label: 'Todos los tipos' },
                  { value: 'charge', label: 'Cargos' },
                  { value: 'payment', label: 'Pagos' },
                  { value: 'fee', label: 'Comisiones' },
                  { value: 'interest', label: 'Intereses' },
                ]}
              />

              <Select
                label="Moneda"
                value={filters.currency}
                onChange={(e) => setFilters({ ...filters, currency: e.target.value as Currency })}
                options={[
                  { value: '', label: 'Todas las monedas' },
                  { value: 'DOP', label: 'DOP' },
                  { value: 'USD', label: 'USD' },
                ]}
              />

              <div>
                <label className="block text-sm font-medium mb-1">Fecha Desde</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fecha Hasta</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <Select
                label="Ordenar por"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'description')}
                options={[
                  { value: 'date', label: 'Fecha' },
                  { value: 'amount', label: 'Monto' },
                  { value: 'description', label: 'Descripción' },
                ]}
              />

              <Select
                label="Orden"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                options={[
                  { value: 'desc', label: 'Descendente' },
                  { value: 'asc', label: 'Ascendente' },
                ]}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <div className="space-y-2">
        {displayTransactions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ArrowUpDown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay transacciones</h3>
              <p className="text-muted-foreground">
                {transactions?.length === 0
                  ? 'Crea tu primera transacción para empezar a rastrear tus finanzas.'
                  : 'No se encontraron transacciones con los filtros aplicados.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          displayTransactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getTypeColor(transaction.type).replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')}20`}>
                      {getTypeIcon(transaction.type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{transaction.description}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(transaction.date.toDate())}</span>
                        <span>•</span>
                        <span>{getAccountName(transaction.accountId)}</span>
                        {transaction.receiptPath && (
                          <>
                            <span>•</span>
                            <Receipt className="w-3 h-3" />
                          </>
                        )}
                      </div>
                      {transaction.note && (
                        <p className="text-sm text-muted-foreground mt-1">{transaction.note}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-bold text-lg ${getTypeColor(transaction.type)}`}>
                        {transaction.type === 'payment' ? '+' : transaction.type === 'charge' ? '-' : ''}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {transaction.type}
                      </p>
                    </div>

                    {onEdit && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(transaction)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {displayTransactions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {displayTransactions.length} transacción{displayTransactions.length !== 1 ? 'es' : ''}
                {limit && filteredTransactions.length > limit && ` (mostrando ${limit} de ${filteredTransactions.length})`}
              </span>
              <div className="flex gap-4 text-sm">
                <span>
                  Ingresos: <span className="text-green-600 font-medium">
                    {formatCurrency(
                      displayTransactions
                        .filter(t => t.type === 'payment')
                        .reduce((sum, t) => sum + t.amount, 0),
                      'DOP'
                    )}
                  </span>
                </span>
                <span>
                  Gastos: <span className="text-red-600 font-medium">
                    {formatCurrency(
                      displayTransactions
                        .filter(t => t.type === 'charge')
                        .reduce((sum, t) => sum + t.amount, 0),
                      'DOP'
                    )}
                  </span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}