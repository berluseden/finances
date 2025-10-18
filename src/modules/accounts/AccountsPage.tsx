import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export function AccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cuentas y Tarjetas</h1>
        <Link to="/accounts/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cuenta
          </Button>
        </Link>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Gestión de cuentas, tarjetas, préstamos y servicios. Implementación completa en progreso.
      </p>
    </div>
  );
}
