import { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths, 
  subMonths,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useAccounts } from '@/modules/accounts/hooks/useAccounts';
import { useTransactions } from '@/modules/transactions/hooks/useTransactions';
import { useActiveRecurringPayments } from '@/modules/recurring/hooks/useRecurringPayments';
import {
  Calendar as CalendarIcon,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import { Currency, AccountType } from '@/types/models';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'cut' | 'due' | 'recurring' | 'paid';
  accountId?: string;
  accountName?: string;
  amount?: number;
  currency?: Currency;
  isPaid?: boolean;
}

export function CalendarPage() {
  const { data: accounts } = useAccounts();
  const { data: transactions } = useTransactions();
  const { data: recurringPayments } = useActiveRecurringPayments();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<AccountType | 'all'>('all');

  // Generar días del mes para el calendario
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { locale: es });
    const endDate = endOfWeek(monthEnd, { locale: es });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentDate]);

  // Generar eventos del calendario
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Mostrar eventos de 3 meses atrás hasta 3 meses adelante
    for (let monthOffset = -3; monthOffset <= 3; monthOffset++) {
      const targetDate = new Date(currentYear, currentMonth + monthOffset, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();

      accounts?.forEach(account => {
        // Filtrar por cuenta seleccionada
        if (selectedAccount !== 'all' && account.id !== selectedAccount) return;
        if (selectedType !== 'all' && account.type !== selectedType) return;

        // Evento de corte (cut day)
        if (account.cutDay) {
          const cutDate = new Date(year, month, account.cutDay);
          events.push({
            id: `cut-${account.id}-${year}-${month}`,
            title: `Corte: ${account.name}`,
            date: cutDate,
            type: 'cut',
            accountId: account.id,
            accountName: account.name,
          });
        }

        // Evento de vencimiento (due date)
        if (account.cutDay && account.dueDaysOffset) {
          const dueDay = account.cutDay + account.dueDaysOffset;
          const dueDate = new Date(year, month, dueDay);
          
          // Ajustar si el día excede el mes
          if (dueDay > 31) {
            dueDate.setMonth(month + 1);
            dueDate.setDate(dueDay - 31);
          }

          // Verificar si ya está pagado
          const isPaid = transactions?.some(t =>
            t.accountId === account.id &&
            t.type === 'payment' &&
            Math.abs(t.date.toDate().getTime() - dueDate.getTime()) < 86400000
          );

          events.push({
            id: `due-${account.id}-${year}-${month}`,
            title: `Vence: ${account.name}`,
            date: dueDate,
            type: isPaid ? 'paid' : 'due',
            accountId: account.id,
            accountName: account.name,
            amount: account.balancePrimary,
            currency: account.currencyPrimary,
            isPaid,
          });
        }
      });

      // Agregar pagos recurrentes
      recurringPayments?.forEach(payment => {
        if (!payment.active) return;
        
        const recurringDate = new Date(year, month, payment.day);
        
        // Verificar si hay transacciones en esa fecha con un monto similar
        const isPaid = transactions?.some(t => {
          const isSameDate = Math.abs(t.date.toDate().getTime() - recurringDate.getTime()) < 86400000;
          const isSimilarAmount = Math.abs(t.amount - payment.amount) < 0.01;
          const isSameCurrency = t.currency === payment.currency;
          return isSameDate && isSimilarAmount && isSameCurrency;
        });

        events.push({
          id: `recurring-${payment.id}-${year}-${month}`,
          title: payment.name,
          date: recurringDate,
          type: isPaid ? 'paid' : 'recurring',
          amount: payment.amount,
          currency: payment.currency,
          isPaid,
        });
      });
    }

    return events;
  }, [accounts, transactions, recurringPayments, currentDate, selectedAccount, selectedType]);

  // Obtener eventos para un día específico
  const getEventsForDay = (day: Date) => {
    return calendarEvents.filter(event => isSameDay(event.date, day));
  };

  // Navegación del calendario
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Días de la semana
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            <CalendarIcon className="w-8 h-8 text-purple-600" />
            Calendario Financiero
          </h1>
          <p className="text-muted-foreground mt-1">
            Eventos de corte, vencimientos y pagos recurrentes
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-600" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select
              label="Cuenta"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              options={[
                { value: 'all', label: 'Todas las cuentas' },
                ...(accounts?.map(account => ({
                  value: account.id,
                  label: account.name
                })) || [])
              ]}
              className="w-48"
            />

            <Select
              label="Tipo de Cuenta"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as AccountType | 'all')}
              options={[
                { value: 'all', label: 'Todos los tipos' },
                { value: 'credit', label: 'Tarjeta de Crédito' },
                { value: 'debit', label: 'Cuenta Débito' },
                { value: 'loan', label: 'Préstamo' },
                { value: 'service', label: 'Servicio' },
                { value: 'rent', label: 'Alquiler' }
              ]}
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card className="border-purple-200 dark:border-purple-800 overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-2xl font-bold capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
                className="hover:bg-purple-50 dark:hover:bg-purple-950 hover:border-purple-300"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="hover:bg-purple-50 dark:hover:bg-purple-950 hover:border-purple-300 min-w-[60px]"
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
                className="hover:bg-purple-50 dark:hover:bg-purple-950 hover:border-purple-300"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Mensaje si no hay cuentas */}
          {(!accounts || accounts.length === 0) && (
            <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
              <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay cuentas configuradas</h3>
              <p className="text-muted-foreground mb-4">
                Crea cuentas con días de corte y vencimiento para ver eventos en el calendario
              </p>
              <Button onClick={() => window.location.href = '/accounts/new'}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Cuenta
              </Button>
            </div>
          )}

          {accounts && accounts.length > 0 && (
            <>
              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs sm:text-sm font-semibold text-muted-foreground py-2 bg-muted/30 rounded"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isDayToday = isToday(day);
                  const hasCutEvent = dayEvents.some(e => e.type === 'cut');
                  const hasDueEvent = dayEvents.some(e => e.type === 'due');
                  const hasPaidEvent = dayEvents.some(e => e.type === 'paid');
                  const hasRecurringEvent = dayEvents.some(e => e.type === 'recurring');

                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] sm:min-h-[120px] p-2 border-2 rounded-lg transition-all cursor-pointer ${
                        isCurrentMonth
                          ? 'bg-background border-border hover:border-purple-300 dark:hover:border-purple-700'
                          : 'bg-muted/30 border-muted'
                      } ${
                        isDayToday
                          ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950/20'
                          : hasDueEvent && isCurrentMonth
                          ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800'
                          : hasCutEvent && isCurrentMonth
                          ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-800'
                          : hasRecurringEvent && isCurrentMonth
                          ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800'
                          : hasPaidEvent && isCurrentMonth
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800'
                          : ''
                      } hover:shadow-md`}
                    >
                      <div
                        className={`text-sm font-semibold mb-1 ${
                          isDayToday
                            ? 'flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white dark:bg-purple-500'
                            : isCurrentMonth
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {format(day, 'd')}
                      </div>

                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded flex items-center gap-1 transition-transform hover:scale-105 ${
                              event.type === 'cut'
                                ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-800'
                                : event.type === 'due'
                                ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-800'
                                : event.type === 'paid'
                                ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-800'
                                : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-800'
                            }`}
                            title={`${event.title}${event.amount ? ` - ${formatCurrency(event.amount, event.currency!)}` : ''}`}
                          >
                            {event.type === 'cut' && <CreditCard className="w-3 h-3 flex-shrink-0" />}
                            {event.type === 'due' && <AlertTriangle className="w-3 h-3 flex-shrink-0" />}
                            {event.type === 'paid' && <CheckCircle className="w-3 h-3 flex-shrink-0" />}
                            {event.type === 'recurring' && <Clock className="w-3 h-3 flex-shrink-0" />}
                            <span className="truncate flex-1">{event.accountName || event.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center font-medium bg-muted/50 rounded py-0.5">
                            +{dayEvents.length - 2} más
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle>Leyenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm">Día de Corte</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Fecha de Vencimiento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Pago Realizado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm">Pago Recurrente</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events Summary */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Próximos Eventos</CardTitle>
              <CardDescription>
                Eventos importantes en los próximos 30 días
              </CardDescription>
            </div>
            <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
              {calendarEvents.filter(event => {
                const eventDate = new Date(event.date);
                const today = new Date();
                const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                return eventDate >= today && eventDate <= thirtyDaysFromNow;
              }).length} eventos
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {calendarEvents
              .filter(event => {
                const eventDate = new Date(event.date);
                const today = new Date();
                const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                return eventDate >= today && eventDate <= thirtyDaysFromNow;
              })
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 5)
              .map(event => (
                <div 
                  key={event.id} 
                  className={`flex items-center justify-between p-4 rounded-lg border-l-4 transition-all hover:shadow-md cursor-pointer ${
                    event.type === 'cut'
                      ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-950/30'
                      : event.type === 'due'
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-500 hover:bg-red-100 dark:hover:bg-red-950/30'
                      : event.type === 'paid'
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-500 hover:bg-green-100 dark:hover:bg-green-950/30'
                      : 'bg-purple-50 dark:bg-purple-950/20 border-purple-500 hover:bg-purple-100 dark:hover:bg-purple-950/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {event.type === 'cut' && <CreditCard className="w-5 h-5 text-yellow-500" />}
                    {event.type === 'due' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                    {event.type === 'paid' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {event.type === 'recurring' && <Clock className="w-5 h-5 text-purple-500" />}
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(event.date)}
                      </p>
                    </div>
                  </div>
                  {event.amount && (
                    <p className="font-semibold">
                      {formatCurrency(event.amount, event.currency!)}
                    </p>
                  )}
                </div>
              ))}
            {calendarEvents.filter(event => {
              const eventDate = new Date(event.date);
              const today = new Date();
              const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
              return eventDate >= today && eventDate <= thirtyDaysFromNow;
            }).length === 0 && (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No hay eventos próximos programados.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
