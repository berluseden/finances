import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { LogIn, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      console.log('[LoginPage] User already logged in, redirecting to dashboard');
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[LoginPage] Form submitted');
    console.log('[LoginPage] Email:', email);
    console.log('[LoginPage] Password length:', password.length);
    
    setError('');
    setLoading(true);

    try {
      console.log('[LoginPage] Calling signIn...');
      await signIn(email, password);
      
      console.log('[LoginPage] ✅ Sign in successful, waiting for auth state change...');
      // Navigation will happen automatically via useEffect when currentUser updates
    } catch (err: any) {
      console.error('[LoginPage] ❌ Login error:', err);
      
      // Use the error message from AuthContext if available
      const errorMessage = err.message || 'Error al iniciar sesión. Por favor, intenta nuevamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
            <Input
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={6}
              disabled={loading}
            />
            
            {error && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              isLoading={loading}
              disabled={loading || !email || !password}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              🔒 Acceso restringido
            </p>
            <p className="text-center text-xs text-muted-foreground mt-1">
              Solo administradores pueden crear usuarios
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
