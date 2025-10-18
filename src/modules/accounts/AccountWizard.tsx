import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/modules/auth/AuthContext';
import { createDocument } from '@/firebase/firestore';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { AccountType, Currency } from '@/types/models';

export function AccountWizard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    bank: '',
    name: '',
    type: 'credit' as AccountType,
    isMultiCurrency: false,
    currencyPrimary: 'DOP' as Currency,
    balancePrimary: 0,
    currencySecondary: 'USD' as Currency,
    balanceSecondary: 0,
    exchangeRate: 58.5, // Valor por defecto razonable
    cutDay: 10, // Día por defecto
    dueDaysOffset: 25, // 25 días después del corte
    limitPrimary: 0,
    notes: '',
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      setError('Usuario no autenticado');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('[AccountWizard] Creating account:', formData);

      // Preparar datos para Firestore (eliminar campos undefined)
      const accountData: any = {
        userId: currentUser.id,
        bank: formData.bank,
        name: formData.name,
        type: formData.type,
        isMultiCurrency: formData.isMultiCurrency,
        currencyPrimary: formData.currencyPrimary,
        balancePrimary: formData.balancePrimary || 0,
      };

      // Solo agregar campos de moneda secundaria si es multicurrency
      if (formData.isMultiCurrency) {
        accountData.currencySecondary = formData.currencySecondary;
        accountData.balanceSecondary = formData.balanceSecondary || 0;
        accountData.exchangeRate = formData.exchangeRate || 0;
      }

      // Solo agregar campos de crédito si es tarjeta de crédito
      if (formData.type === 'credit') {
        accountData.cutDay = formData.cutDay;
        accountData.dueDaysOffset = formData.dueDaysOffset;
        accountData.limitPrimary = formData.limitPrimary || 0;
        
        if (formData.isMultiCurrency && formData.exchangeRate > 0) {
          accountData.limitSecondary = formData.limitPrimary / formData.exchangeRate;
        }
      }

      // Solo agregar notas si no está vacío
      if (formData.notes && formData.notes.trim()) {
        accountData.notes = formData.notes.trim();
      }

      await createDocument('accounts', accountData);

      console.log('[AccountWizard] ✅ Account created successfully');
      setSuccess(true);
      toast.success('¡Cuenta creada exitosamente!');

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate('/accounts');
      }, 1500);

    } catch (err: any) {
      console.error('[AccountWizard] ❌ Error creating account:', err);
      setError(`Error al crear la cuenta: ${err.message}`);
      toast.error('Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nueva Cuenta - Paso {step} de 4</CardTitle>
          <CardDescription>
            {step === 1 && 'Información básica'}
            {step === 2 && 'Configuración de moneda'}
            {step === 3 && 'Fechas de corte y vencimiento'}
            {step === 4 && 'Límites y confirmación'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <Input
                label="Banco o Institución"
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                placeholder="Ej: Banco Popular"
              />
              <Input
                label="Nombre de la cuenta"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Tarjeta Visa Principal"
              />
              <Select
                label="Tipo de cuenta"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as AccountType })}
                options={[
                  { value: 'credit', label: 'Tarjeta de Crédito' },
                  { value: 'debit', label: 'Tarjeta de Débito' },
                  { value: 'loan', label: 'Préstamo' },
                  { value: 'service', label: 'Servicio' },
                  { value: 'rent', label: 'Alquiler' },
                ]}
              />
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="multiCurrency"
                  checked={formData.isMultiCurrency}
                  onChange={(e) => setFormData({ ...formData, isMultiCurrency: e.target.checked })}
                />
                <label htmlFor="multiCurrency">¿Es cuenta multimoneda?</label>
              </div>
              {!formData.isMultiCurrency ? (
                <>
                  <Select
                    label="Moneda"
                    value={formData.currencyPrimary}
                    onChange={(e) =>
                      setFormData({ ...formData, currencyPrimary: e.target.value as Currency })
                    }
                    options={[
                      { value: 'DOP', label: 'DOP - Peso Dominicano' },
                      { value: 'USD', label: 'USD - Dólar Estadounidense' },
                    ]}
                  />
                  <div>
                    <Input
                      type="number"
                      label={formData.type === 'credit' ? 'Saldo actual (deuda)' : 'Saldo inicial'}
                      value={formData.balancePrimary}
                      onChange={(e) =>
                        setFormData({ ...formData, balancePrimary: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.type === 'credit' 
                        ? 'Monto que debes actualmente (opcional, puedes dejarlo en 0)' 
                        : 'Saldo disponible en la cuenta (opcional)'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Input
                      type="number"
                      label="Saldo en DOP"
                      value={formData.balancePrimary}
                      onChange={(e) =>
                        setFormData({ ...formData, balancePrimary: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.type === 'credit' ? 'Deuda actual en DOP' : 'Saldo en pesos'}
                    </p>
                  </div>
                  <div>
                    <Input
                      type="number"
                      label="Saldo en USD"
                      value={formData.balanceSecondary}
                      onChange={(e) =>
                        setFormData({ ...formData, balanceSecondary: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.type === 'credit' ? 'Deuda actual en USD' : 'Saldo en dólares'}
                    </p>
                  </div>
                  <Input
                    type="number"
                    label="Tasa de cambio (manual)"
                    value={formData.exchangeRate}
                    onChange={(e) =>
                      setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="Ej: 58.50"
                  />
                </>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <Input
                type="number"
                label="Día de corte"
                value={formData.cutDay}
                onChange={(e) => setFormData({ ...formData, cutDay: parseInt(e.target.value) })}
                min="1"
                max="31"
              />
              <Input
                type="number"
                label="Días hasta vencimiento"
                value={formData.dueDaysOffset}
                onChange={(e) =>
                  setFormData({ ...formData, dueDaysOffset: parseInt(e.target.value) })
                }
                min="1"
                max="60"
              />
              <p className="text-sm text-gray-600">
                Fecha de vencimiento estimada: {formData.cutDay + formData.dueDaysOffset} del mes
              </p>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <Input
                  type="number"
                  label={`Límite de crédito (${formData.currencyPrimary})`}
                  value={formData.limitPrimary}
                  onChange={(e) =>
                    setFormData({ ...formData, limitPrimary: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="Ej: 177000"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Límite máximo de crédito autorizado por el banco
                </p>
              </div>
              <Input
                label="Notas (opcional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Información adicional sobre la cuenta"
              />
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2">Resumen</h3>
                <p>
                  <strong>Banco:</strong> {formData.bank}
                </p>
                <p>
                  <strong>Cuenta:</strong> {formData.name}
                </p>
                <p>
                  <strong>Tipo:</strong> {formData.type === 'credit' ? 'Crédito' : formData.type}
                </p>
                <p>
                  <strong>Multimoneda:</strong> {formData.isMultiCurrency ? 'Sí' : 'No'}
                </p>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Atrás
              </Button>
            )}
            <Button variant="ghost" onClick={() => navigate('/accounts')}>
              Cancelar
            </Button>
            {step < 4 ? (
              <Button onClick={handleNext} className="ml-auto">
                Siguiente
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="ml-auto" isLoading={loading} disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ Cuenta creada exitosamente. Redirigiendo...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
