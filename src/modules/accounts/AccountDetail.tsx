import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAccount } from './hooks/useAccounts';
import { useStatements, useDeleteStatement } from './hooks/useStatements';
import { StatementUpload } from './StatementUpload';
import { Upload, FileText, Calendar, CreditCard, DollarSign, AlertCircle, Eye, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/date';

export function AccountDetail() {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const { data: account, isLoading, error } = useAccount(accountId!);
  const { data: statements } = useStatements(accountId!);
  const [showUpload, setShowUpload] = useState(false);
  const [statementToDelete, setStatementToDelete] = useState<string | null>(null);
  
  const deleteStatement = useDeleteStatement();

  const handleDeleteStatement = async (statementId: string) => {
    try {
      await deleteStatement.mutateAsync(statementId);
      toast.success('Estado de cuenta eliminado');
    } catch (error) {
      console.error('Error deleting statement:', error);
      toast.error('Error al eliminar el estado de cuenta');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando cuenta...</p>
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <h3 className="text-lg font-semibold">Cuenta no encontrada</h3>
              <p className="text-muted-foreground">
                La cuenta que buscas no existe o no tienes permisos para verla.
              </p>
              <Link to="/accounts">
                <Button variant="outline">Volver a Cuentas</Button>
              </Link>
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
          <h1 className="text-3xl font-bold">{account.name}</h1>
          <p className="text-muted-foreground">{account.bank}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowUpload(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Subir Estado de Cuenta
          </Button>
          <Link to="/accounts">
            <Button variant="outline">Volver</Button>
          </Link>
        </div>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Actual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(account.balancePrimary, account.currencyPrimary)}
            </div>
            {account.isMultiCurrency && account.balanceSecondary !== undefined && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(account.balanceSecondary, account.currencySecondary!)}
              </p>
            )}
          </CardContent>
        </Card>

        {account.type === 'credit' && account.limitPrimary && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Límite Disponible</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(account.limitPrimary - account.balancePrimary, account.currencyPrimary)}
              </div>
              <p className="text-xs text-muted-foreground">
                de {formatCurrency(account.limitPrimary, account.currencyPrimary)}
              </p>
            </CardContent>
          </Card>
        )}

        {account.type === 'credit' && account.cutDay && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximo Corte</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Día {account.cutDay}
              </div>
              <p className="text-xs text-muted-foreground">
                Vence en {account.dueDaysOffset} días
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Statements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Estados de Cuenta
          </CardTitle>
          <CardDescription>
            Historial de estados de cuenta subidos para esta tarjeta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!statements || statements.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay estados de cuenta</h3>
              <p className="text-muted-foreground mb-4">
                Sube tu primer estado de cuenta para ver las transacciones y saber qué debes.
              </p>
              <Button onClick={() => setShowUpload(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Subir Primer Estado
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {statements.length} estado{statements.length !== 1 ? 's' : ''} de cuenta
                </p>
                <Button onClick={() => setShowUpload(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Nuevo
                </Button>
              </div>

              <div className="space-y-3">
                {statements.map((statement) => (
                  <div
                    key={statement.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-medium">
                          Corte: {statement.cutDate ? formatDate(statement.cutDate.toDate()) : 
                            <span className="text-muted-foreground italic">Sin fecha de corte</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Vence: {statement.dueDate ? formatDate(statement.dueDate.toDate()) : 
                            <span className="italic">Sin fecha de vencimiento</span>}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {statement.closingBalanceDOP && (
                        <p className="font-semibold text-red-600">
                          {formatCurrency(statement.closingBalanceDOP, 'DOP')}
                        </p>
                      )}
                      {statement.closingBalanceUSD && (
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(statement.closingBalanceUSD, 'USD')}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/transactions?accountId=${account.id}&statementId=${statement.id}`)}
                          title="Ver transacciones de este estado de cuenta"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        {statement.statementPdfPath && (
                          <a
                            href={statement.statementPdfPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abrir PDF del estado de cuenta"
                          >
                            <Button size="sm" variant="ghost">
                              PDF
                            </Button>
                          </a>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setStatementToDelete(statement.id)}
                          title="Eliminar estado de cuenta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUpload && (
        <StatementUpload
          accountId={accountId!}
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            // Refetch statements
            window.location.reload();
          }}
        />
      )}

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo</label>
              <p className="capitalize">{account.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Multimoneda</label>
              <p>{account.isMultiCurrency ? 'Sí' : 'No'}</p>
            </div>
            {account.cutDay && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Día de Corte</label>
                <p>{account.cutDay}</p>
              </div>
            )}
            {account.dueDaysOffset && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Días para Vencimiento</label>
                <p>{account.dueDaysOffset}</p>
              </div>
            )}
          </div>
          {account.notes && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notas</label>
              <p>{account.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!statementToDelete}
        title="Eliminar Estado de Cuenta"
        message="¿Estás seguro que deseas eliminar este estado de cuenta? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (statementToDelete) {
            handleDeleteStatement(statementToDelete);
          }
        }}
        onCancel={() => setStatementToDelete(null)}
      />
    </div>
  );
}