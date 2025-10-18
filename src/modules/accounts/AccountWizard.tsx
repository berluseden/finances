import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { AccountType, Currency } from '@/types/models';

export function AccountWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    bank: '',
    name: '',
    type: 'credit' as AccountType,
    isMultiCurrency: false,
    currencyPrimary: 'DOP' as Currency,
    balancePrimary: 0,
    currencySecondary: 'USD' as Currency,
    balanceSecondary: 0,
    exchangeRate: 0,
    cutDay: 1,
    dueDaysOffset: 20,
    limitPrimary: 0,
    notes: '',
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    console.log('Account data:', formData);
    navigate('/accounts');
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
                  <Input
                    type="number"
                    label="Saldo"
                    value={formData.balancePrimary}
                    onChange={(e) =>
                      setFormData({ ...formData, balancePrimary: parseFloat(e.target.value) })
                    }
                  />
                </>
              ) : (
                <>
                  <Input
                    type="number"
                    label="Saldo en DOP"
                    value={formData.balancePrimary}
                    onChange={(e) =>
                      setFormData({ ...formData, balancePrimary: parseFloat(e.target.value) })
                    }
                  />
                  <Input
                    type="number"
                    label="Saldo en USD"
                    value={formData.balanceSecondary}
                    onChange={(e) =>
                      setFormData({ ...formData, balanceSecondary: parseFloat(e.target.value) })
                    }
                  />
                  <Input
                    type="number"
                    label="Tasa de cambio (manual)"
                    value={formData.exchangeRate}
                    onChange={(e) =>
                      setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) })
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
              <Input
                type="number"
                label="Límite de crédito"
                value={formData.limitPrimary}
                onChange={(e) =>
                  setFormData({ ...formData, limitPrimary: parseFloat(e.target.value) })
                }
              />
              <Input
                label="Notas (opcional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Información adicional"
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
                  <strong>Tipo:</strong> {formData.type}
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
              <Button onClick={handleSubmit} className="ml-auto">
                Guardar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
