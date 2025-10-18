import { useState } from 'react';
import { useAuth } from '@/modules/auth/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import { createDocument } from '@/firebase/firestore';
import { UserPlus, Users, CheckCircle, AlertCircle } from 'lucide-react';
import type { UserRole } from '@/types/models';

export function AdminPage() {
  const { isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'user' as UserRole,
  });

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <h3 className="text-lg font-semibold">Acceso Denegado</h3>
              <p className="text-muted-foreground">
                No tienes permisos para acceder a esta página. Solo los administradores pueden gestionar usuarios.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    console.log('[AdminPage] Creating user:', formData.email);

    try {
      // Crear usuario en Firebase Auth
      console.log('[AdminPage] Step 1: Creating Firebase Auth user...');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const userId = userCredential.user.uid;
      console.log('[AdminPage] ✅ Firebase Auth user created:', userId);
      
      // Crear documento de usuario en Firestore
      console.log('[AdminPage] Step 2: Creating Firestore document...');
      await createDocument('users', {
        id: userId,
        email: formData.email,
        displayName: formData.displayName,
        role: formData.role,
      });
      
      console.log('[AdminPage] ✅ Firestore document created');

      setSuccess(`✅ Usuario ${formData.email} creado exitosamente (${formData.role})`);
      setFormData({ email: '', password: '', displayName: '', role: 'user' });
      setShowForm(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      console.error('[AdminPage] ❌ Error creating user:', err);
      
      if (err.code === 'auth/email-already-in-use') {
        setError('❌ Este email ya está registrado');
      } else if (err.code === 'auth/weak-password') {
        setError('❌ La contraseña es muy débil (mínimo 6 caracteres)');
      } else if (err.code === 'auth/invalid-email') {
        setError('❌ Email inválido');
      } else {
        setError(`❌ Error al crear usuario: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setError('');
    setSuccess('');
    setFormData({ email: '', password: '', displayName: '', role: 'user' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administración</h1>
          <p className="text-muted-foreground mt-1">Gestión de usuarios del sistema</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {success && (
        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Usuario</CardTitle>
            <CardDescription>
              Complete los datos del nuevo usuario. Se creará automáticamente en Firebase Auth y Firestore.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <Input
                type="text"
                label="Nombre completo"
                placeholder="Juan Pérez"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
                disabled={loading}
              />
              
              <Input
                type="email"
                label="Email"
                placeholder="usuario@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
                autoComplete="off"
              />
              
              <Input
                type="password"
                label="Contraseña"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                disabled={loading}
                autoComplete="new-password"
              />
              
              <Select
                label="Rol"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                options={[
                  { value: 'user', label: 'Usuario' },
                  { value: 'admin', label: 'Administrador' },
                ]}
                disabled={loading}
              />

              {error && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  isLoading={loading}
                  disabled={loading}
                >
                  {loading ? 'Creando usuario...' : 'Crear Usuario'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuarios del Sistema
          </CardTitle>
          <CardDescription>
            Lista de usuarios registrados en la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            La lista de usuarios se implementará próximamente con TanStack Query
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
