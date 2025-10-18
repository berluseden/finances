import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAccounts } from '@/modules/accounts/hooks/useAccounts';
import { useTransactions } from '@/modules/transactions/hooks/useTransactions';
import { useRecurringPayments } from '@/modules/recurring/hooks/useRecurringPayments';
import { useBudgetProgress } from '@/modules/budgets/hooks/useBudgets';
import { FinancialAlerts } from '@/modules/ai/components/FinancialAlerts';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle,
  FileText,
  Plus,
  ArrowUpRight,
  PiggyBank,
  Target,
  Sparkles,
  Brain,
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { data: accounts } = useAccounts();
  const { data: transactions } = useTransactions();
  const { data: recurringPayments } = useRecurringPayments();
  const budgetProgress = useBudgetProgress();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Calcular estadísticas generales
  const totalBalance = accounts?.reduce((total, account) => ({
    DOP: total.DOP + (account.currencyPrimary === 'DOP' ? account.balancePrimary : 0) + 
         (account.isMultiCurrency && account.currencySecondary === 'DOP' && account.balanceSecondary ? account.balanceSecondary : 0),
    USD: total.USD + (account.currencyPrimary === 'USD' ? account.balancePrimary : 0) + 
         (account.isMultiCurrency && account.currencySecondary === 'USD' && account.balanceSecondary ? account.balanceSecondary : 0),
  }), { DOP: 0, USD: 0 });

  // Calcular crédito disponible total
  const totalCreditAvailable = accounts?.filter(a => a.type === 'credit').reduce((total, account) => {
    const available = (account.limitPrimary || 0) - account.balancePrimary;
    return total + (account.currencyPrimary === 'DOP' ? available : 0);
  }, 0) || 0;

  // Transacciones recientes (últimas 5)
  const recentTransactions = transactions?.slice(0, 5) || [];

  // Calcular gastos del mes: saldos de cuentas + pagos recurrentes activos
  const monthlyExpensesFromAccounts = accounts?.reduce((total, account) => {
    const balanceDOP = account.currencyPrimary === 'DOP' ? account.balancePrimary : 0;
    const balanceUSD = account.currencyPrimary === 'USD' ? account.balancePrimary * 59 : 0;
    const balanceSecDOP = account.isMultiCurrency && account.currencySecondary === 'DOP' ? (account.balanceSecondary || 0) : 0;
    const balanceSecUSD = account.isMultiCurrency && account.currencySecondary === 'USD' ? (account.balanceSecondary || 0) * 59 : 0;
    return total + balanceDOP + balanceUSD + balanceSecDOP + balanceSecUSD;
  }, 0) || 0;

  const monthlyExpensesFromRecurring = recurringPayments?.filter(p => p.active).reduce((total, payment) => {
    const amountInDOP = payment.currency === 'USD' ? payment.amount * 59 : payment.amount;
    return total + amountInDOP;
  }, 0) || 0;

  const monthlyExpenses = monthlyExpensesFromAccounts + monthlyExpensesFromRecurring;

  // Calcular gastos del mes actual por transacciones (si existen)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpensesFromTransactions = transactions?.filter(t => {
    const transactionDate = t.date.toDate();
    return transactionDate.getMonth() === currentMonth &&
           transactionDate.getFullYear() === currentYear &&
           t.type === 'charge';
  }).reduce((total, t) => total + (t.currency === 'DOP' ? t.amount : 0), 0) || 0;

  // Calcular ingresos del mes
  const monthlyIncome = transactions?.filter(t => {
    const transactionDate = t.date.toDate();
    return transactionDate.getMonth() === currentMonth &&
           transactionDate.getFullYear() === currentYear &&
           t.type === 'payment';
  }).reduce((total, t) => total + (t.currency === 'DOP' ? t.amount : 0), 0) || 0;

  // Obtener saludo según hora del día
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '¡Buenos días!';
    if (hour < 18) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  };

  // Balance neto del mes
  const monthlyBalance = monthlyIncome - (monthlyExpenses + monthlyExpensesFromTransactions);
  const savingsRate = monthlyIncome > 0 ? ((monthlyBalance / monthlyIncome) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Hero Header con animación */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white opacity-10 rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 -right-4 w-72 h-72 bg-white opacity-10 rounded-full mix-blend-overlay filter blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {getGreeting()} 👋
            </h1>
            <p className="text-white/90 text-lg">
              {currentTime.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            {monthlyBalance > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Ahorrando {savingsRate}% este mes
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <p className="text-white/80 text-sm font-medium mb-1">Balance Total</p>
              <p className="text-4xl font-bold">
                {formatCurrency(totalBalance?.DOP || 0, 'DOP')}
              </p>
              {totalBalance?.USD && totalBalance.USD > 0 && (
                <p className="text-white/90 text-lg mt-1">
                  + {formatCurrency(totalBalance.USD, 'USD')}
                </p>
              )}
            </div>
            <Link to="/calendar">
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                <Calendar className="w-4 h-4 mr-2" />
                Ver Calendario
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid con diseño moderno */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ingresos */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardContent className="p-6">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                  +12%
                </span>
              </div>
              <p className="text-sm opacity-90 font-medium">Ingresos del Mes</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(monthlyIncome, 'DOP')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gastos */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                  -8%
                </span>
              </div>
              <p className="text-sm opacity-90 font-medium">Gastos del Mes</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(monthlyExpenses, 'DOP')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Crédito Disponible */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm opacity-90 font-medium">Crédito Disponible</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(totalCreditAvailable, 'DOP')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cuentas */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <PiggyBank className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm opacity-90 font-medium">Cuentas Activas</p>
              <p className="text-3xl font-bold mt-1">
                {accounts?.length || 0}
              </p>
              <p className="text-xs opacity-75 mt-1">
                {accounts?.filter(a => a.type === 'credit').length || 0} tarjetas de crédito
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance del mes */}
      {monthlyIncome > 0 && (
        <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Balance Neto del Mes</p>
                <p className={`text-4xl font-bold ${monthlyBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {monthlyBalance >= 0 ? '+' : ''}{formatCurrency(monthlyBalance, 'DOP')}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tasa de ahorro: <span className="font-semibold text-purple-600 dark:text-purple-400">{savingsRate}%</span>
                </p>
              </div>
              <div className="hidden md:block">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-purple-200 dark:text-purple-800"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-purple-600 dark:text-purple-400"
                      strokeWidth="10"
                      strokeDasharray={`${2.51 * Number(savingsRate)} 251.2`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{savingsRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Accounts Overview */}
          {accounts && accounts.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Mis Cuentas
                    </CardTitle>
                    <CardDescription>
                      Vista rápida de tus cuentas principales
                    </CardDescription>
                  </div>
                  <Link to="/accounts">
                    <Button variant="outline" size="sm">
                      Ver Todas
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accounts.slice(0, 4).map((account) => {
                    const available = account.type === 'credit' && account.limitPrimary 
                      ? account.limitPrimary - account.balancePrimary 
                      : 0;
                    const usagePercent = account.type === 'credit' && account.limitPrimary 
                      ? ((account.balancePrimary / account.limitPrimary) * 100).toFixed(0)
                      : 0;

                    return (
                      <Link key={account.id} to={`/accounts/${account.id}`}>
                        <div className="p-4 border-2 rounded-lg hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all duration-200 cursor-pointer group">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {account.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{account.bank}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              account.type === 'credit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                              account.type === 'debit' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                              {account.type === 'credit' ? 'Crédito' : 
                               account.type === 'debit' ? 'Débito' : 
                               account.type}
                            </span>
                          </div>
                          
                          <p className="text-2xl font-bold mb-1">
                            {formatCurrency(account.balancePrimary, account.currencyPrimary)}
                          </p>
                          
                          {account.type === 'credit' && account.limitPrimary && (
                            <>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
                                <div 
                                  className={`h-1.5 rounded-full transition-all ${
                                    Number(usagePercent) > 80 ? 'bg-red-500' :
                                    Number(usagePercent) > 50 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${usagePercent}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Disponible: {formatCurrency(available, account.currencyPrimary)}</span>
                                <span>{usagePercent}%</span>
                              </div>
                            </>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Transacciones Recientes
                  </CardTitle>
                  <CardDescription>
                    Tus últimos movimientos financieros
                  </CardDescription>
                </div>
                <Link to="/transactions">
                  <Button variant="outline" size="sm">
                    Ver Todas
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {!recentTransactions || recentTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay transacciones</h3>
                  <p className="text-muted-foreground mb-4">
                    Crea tu primera transacción para empezar a rastrear tus finanzas.
                  </p>
                  <Link to="/transactions">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Transacción
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => {
                    const account = accounts?.find(a => a.id === transaction.accountId);
                    const isCharge = transaction.type === 'charge';

                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border-2 rounded-xl hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${
                            isCharge 
                              ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white' 
                              : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                          }`}>
                            {isCharge ? (
                              <TrendingDown className="w-5 h-5" />
                            ) : (
                              <TrendingUp className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {transaction.description}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{formatDate(transaction.date.toDate())}</span>
                              {account && (
                                <>
                                  <span>•</span>
                                  <span className="font-medium">{account.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${
                            isCharge ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                          }`}>
                            {isCharge ? '-' : '+'}{formatCurrency(transaction.amount, transaction.currency)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/accounts/new">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Cuenta
                </Button>
              </Link>
              <Link to="/transactions">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Nueva Transacción
                </Button>
              </Link>
              <Link to="/accounts">
                <Button className="w-full justify-start" variant="outline">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Ver Cuentas
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Upcoming Payments */}
          <Card className="border-2 border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                Próximos Vencimientos
              </CardTitle>
              <CardDescription>Ve al calendario para ver todas las fechas importantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  ¡Todo al día! No hay vencimientos próximos.
                </p>
                <Link to="/calendar">
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver Calendario Completo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Goal */}
          <Card className="relative overflow-hidden border-0 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Meta del Mes</p>
                  {budgetProgress.totalPlanned > 0 ? (
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {formatCurrency(budgetProgress.totalPlanned, 'DOP')}
                    </p>
                  ) : (
                    <Link to="/budgets">
                      <p className="text-lg font-semibold text-purple-600 dark:text-purple-400 mt-1 hover:underline">
                        Configura tu presupuesto →
                      </p>
                    </Link>
                  )}
                </div>
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
                  <Target className="w-8 h-8 text-white" />
                </div>
              </div>
              {budgetProgress.totalPlanned > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Progreso</span>
                    <span className={`font-bold ${
                      budgetProgress.isOverBudget 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-purple-600 dark:text-purple-400'
                    }`}>
                      {budgetProgress.percentage}%
                    </span>
                  </div>
                  <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${
                        budgetProgress.isOverBudget
                          ? 'bg-gradient-to-r from-red-500 to-red-600'
                          : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                      }`}
                      style={{ width: `${Math.min(budgetProgress.percentage, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  {budgetProgress.remaining > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Te quedan <span className="font-semibold text-purple-600 dark:text-purple-400">{formatCurrency(budgetProgress.remaining, 'DOP')}</span> para alcanzar tu meta
                    </p>
                  ) : (
                    <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                      ⚠️ Presupuesto excedido por {formatCurrency(Math.abs(budgetProgress.remaining), 'DOP')}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Financial Alerts */}
          <FinancialAlerts />

          {/* Quick AI Access */}
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Análisis con IA
              </CardTitle>
              <CardDescription className="text-white/80">
                Obtén insights inteligentes sobre tus finanzas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                La IA está lista para ayudarte a tomar mejores decisiones financieras.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      Plan de Pagos Inteligente
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Descubre qué pagar primero y cuánto
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      Oportunidades de Ahorro
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Identifica gastos que puedes reducir
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Target className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      Score de Salud Financiera
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Evalúa tu situación y recibe consejos
                    </p>
                  </div>
                </div>
              </div>
              <Link to="/ai-insights">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                  <Brain className="w-4 h-4 mr-2" />
                  Ver Análisis Completo
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
