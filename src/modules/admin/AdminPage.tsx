import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/modules/auth/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import { createDocument } from '@/firebase/firestore';
import { UserPlus, Users, CheckCircle, AlertCircle, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { formatDate } from '@/lib/date';
import type { UserRole } from '@/types/models';
import { useUsers, useUpdateUserRole, useDeleteUser } from './hooks/useUsers';

export function AdminPage() {
  const { isAdmin, currentUser } = useAuth();
  const { data: users, isLoading: loadingUsers } = useUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
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
          {loadingUsers && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando usuarios...</p>
            </div>
          )}

          {!loadingUsers && users && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Usuario</th>
                    <th className="text-left p-3 font-semibold">Email</th>
                    <th className="text-left p-3 font-semibold">Rol</th>
                    <th className="text-left p-3 font-semibold">Fecha Creación</th>
                    <th className="text-center p-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900' : 'bg-blue-100 dark:bg-blue-900'
                          }`}>
                            {user.role === 'admin' ? (
                              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            ) : (
                              <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <span className="font-medium">{user.displayName}</span>
                          {user.id === currentUser?.id && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              Tú
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{user.email}</td>
                      <td className="p-3">
                        <Select
                          value={user.role}
                          onChange={(e) => {
                            if (user.id === currentUser?.id) {
                              toast.error('No puedes cambiar tu propio rol');
                              return;
                            }
                            updateRole.mutate({ 
                              userId: user.id, 
                              role: e.target.value as UserRole 
                            });
                          }}
                          options={[
                            { value: 'user', label: 'Usuario' },
                            { value: 'admin', label: 'Administrador' },
                          ]}
                          disabled={user.id === currentUser?.id}
                          className="w-40"
                        />
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {formatDate(user.createdAt.toDate())}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUserToDelete(user.id)}
                            disabled={user.id === currentUser?.id}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50"
                            title={user.id === currentUser?.id ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loadingUsers && (!users || users.length === 0) && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay usuarios registrados aún.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        title="Eliminar Usuario"
        message="¿Estás seguro que deseas eliminar este usuario? Esta acción eliminará el documento de Firestore pero el usuario seguirá existiendo en Firebase Auth. Solo se recomienda hacer esto si tienes acceso al Admin SDK de Firebase."
        confirmLabel="Eliminar de Firestore"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (userToDelete) {
            deleteUser.mutate(userToDelete);
            setUserToDelete(null);
          }
        }}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
}
