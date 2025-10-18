import { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Timestamp } from 'firebase/firestore';
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { Currency, RecurringPayment } from '@/types/models';

// Mock data for now - in a real app this would come from a hook
const mockRecurringPayments: RecurringPayment[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'Internet',
    day: 15,
    amount: 2500,
    currency: 'DOP',
    categoryId: 'services',
    bank: 'Claro',
    active: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '2',
    userId: 'user1',
    name: 'Electricidad',
    day: 10,
    amount: 1800,
    currency: 'DOP',
    categoryId: 'services',
    bank: 'EDE Este',
    active: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '3',
    userId: 'user1',
    name: 'Alquiler',
    day: 1,
    amount: 15000,
    currency: 'DOP',
    categoryId: 'rent',
    bank: 'Banco Popular',
    active: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

export function RecurringPage() {
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>(mockRecurringPayments);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    day: 1,
    amount: 0,
    currency: 'DOP' as Currency,
    categoryId: '',
    bank: '',
    active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPayment) {
      // Update existing payment
      setRecurringPayments(payments =>
        payments.map(payment =>
          payment.id === editingPayment.id
            ? { ...payment, ...formData, updatedAt: Timestamp.now() }
            : payment
        )
      );
      toast.success('Pago recurrente actualizado');
    } else {
      // Create new payment
      const newPayment: RecurringPayment = {
        id: Date.now().toString(),
        userId: 'user1', // In real app, get from auth
        ...formData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      setRecurringPayments([...recurringPayments, newPayment]);
      toast.success('Pago recurrente creado');
    }

    // Reset form
    setFormData({
      name: '',
      day: 1,
      amount: 0,
      currency: 'DOP',
      categoryId: '',
      bank: '',
      active: true,
    });
    setShowForm(false);
    setEditingPayment(null);
  };

  const handleEdit = (payment: RecurringPayment) => {
    setEditingPayment(payment);
    setFormData({
      name: payment.name,
      day: payment.day,
      amount: payment.amount,
      currency: payment.currency,
      categoryId: payment.categoryId || '',
      bank: payment.bank || '',
      active: payment.active,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setRecurringPayments(payments => payments.filter(payment => payment.id !== id));
    toast.success('Pago recurrente eliminado');
  };

  const toggleActive = (id: string) => {
    setRecurringPayments(payments =>
      payments.map(payment =>
        payment.id === id
          ? { ...payment, active: !payment.active, updatedAt: Timestamp.now() }
          : payment
      )
    );
    const payment = recurringPayments.find(p => p.id === id);
    if (payment) {
      toast.success(payment.active ? 'Pago pausado' : 'Pago activado');
    }
  };

  const totalMonthlyAmount = recurringPayments
    .filter(payment => payment.active)
    .reduce((total, payment) => total + payment.amount, 0);

  const getNextPaymentDate = (day: number): Date => {
    const today = new Date();
    const currentDay = today.getDate();

    if (day >= currentDay) {
      // This month
      return new Date(today.getFullYear(), today.getMonth(), day);
    } else {
      // Next month
      return new Date(today.getFullYear(), today.getMonth() + 1, day);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="w-8 h-8" />
            Pagos Recurrentes
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus pagos mensuales automáticos
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Pago Recurrente
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Mensual</p>
              <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                {formatCurrency(totalMonthlyAmount, 'DOP')}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {recurringPayments.filter(p => p.active).length} pagos activos
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>
              {editingPayment ? 'Editar Pago Recurrente' : 'Nuevo Pago Recurrente'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Internet, Luz, Alquiler"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Día del Mes</label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Monto</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>

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

                <div>
                  <label className="block text-sm font-medium mb-1">Banco/Empresa</label>
                  <Input
                    type="text"
                    value={formData.bank}
                    onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                    placeholder="Ej: Banco Popular, Claro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <Select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    options={[
                      { value: '', label: 'Seleccionar categoría' },
                      { value: 'services', label: 'Servicios' },
                      { value: 'rent', label: 'Alquiler' },
                      { value: 'insurance', label: 'Seguros' },
                      { value: 'loans', label: 'Préstamos' },
                    ]}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                <label htmlFor="active" className="text-sm font-medium">
                  Activo
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingPayment ? 'Actualizar' : 'Crear'} Pago Recurrente
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPayment(null);
                    setFormData({
                      name: '',
                      day: 1,
                      amount: 0,
                      currency: 'DOP',
                      categoryId: '',
                      bank: '',
                      active: true,
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Payments List */}
      <div className="grid gap-4">
        {recurringPayments.map((payment) => {
          const nextPaymentDate = getNextPaymentDate(payment.day);
          const isOverdue = nextPaymentDate < new Date() && payment.active;

          return (
            <Card key={payment.id} className={`${!payment.active ? 'opacity-60' : ''} ${isOverdue ? 'border-red-200 dark:border-red-800' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${payment.active ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <Clock className={`w-6 h-6 ${payment.active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        {payment.name}
                        {!payment.active && (
                          <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                            Inactivo
                          </span>
                        )}
                        {isOverdue && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Día {payment.day}
                        </span>
                        {payment.bank && (
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4" />
                            {payment.bank}
                          </span>
                        )}
                        <span>
                          Próximo: {nextPaymentDate.toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        mensual
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(payment.id)}
                      >
                        {payment.active ? 'Pausar' : 'Activar'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(payment)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentToDelete(payment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {recurringPayments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay pagos recurrentes</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primer pago recurrente para automatizar tus finanzas mensuales.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Pago Recurrente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!paymentToDelete}
        title="Eliminar Pago Recurrente"
        message="¿Estás seguro que deseas eliminar este pago recurrente? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (paymentToDelete) {
            handleDelete(paymentToDelete);
          }
        }}
        onCancel={() => setPaymentToDelete(null)}
      />
    </div>
  );
}
