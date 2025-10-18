import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useAccounts } from './hooks/useAccounts';
import { Plus, CreditCard, Building, FileText, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

export function AccountsPage() {
  const { data: accounts, isLoading, error } = useAccounts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando cuentas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <h3 className="text-lg font-semibold">Error al cargar cuentas</h3>
              <p className="text-muted-foreground">
                {error.message}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cuentas y Tarjetas</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus tarjetas de crédito, débitos, préstamos y servicios
          </p>
        </div>
        <Link to="/accounts/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cuenta
          </Button>
        </Link>
      </div>

      {!accounts || accounts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tienes cuentas registradas</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primera cuenta para empezar a gestionar tus finanzas.
              </p>
              <Link to="/accounts/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Cuenta
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <Card key={account.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {account.type === 'credit' && <CreditCard className="w-5 h-5 text-blue-500" />}
                    {account.type === 'debit' && <CreditCard className="w-5 h-5 text-green-500" />}
                    {account.type === 'loan' && <Building className="w-5 h-5 text-orange-500" />}
                    {account.type === 'service' && <FileText className="w-5 h-5 text-purple-500" />}
                    {account.type === 'rent' && <Building className="w-5 h-5 text-red-500" />}
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                  </div>
                  <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
                    {account.type}
                  </span>
                </div>
                <CardDescription>{account.bank}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(account.balancePrimary, account.currencyPrimary)}
                    </p>
                    {account.isMultiCurrency && account.balanceSecondary !== undefined && (
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(account.balanceSecondary, account.currencySecondary!)}
                      </p>
                    )}
                  </div>

                  {account.type === 'credit' && account.limitPrimary && (
                    <div>
                      <p className="text-sm text-muted-foreground">Disponible</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(account.limitPrimary - account.balancePrimary, account.currencyPrimary)}
                      </p>
                    </div>
                  )}

                  <div className="pt-3">
                    <Link to={`/accounts/${account.id}`}>
                      <Button variant="outline" className="w-full">
                        Ver Detalles
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
