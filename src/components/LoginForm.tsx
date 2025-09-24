import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, LogIn, Shield, User } from 'lucide-react';
import { AuthService, User as AuthUser } from '@/lib/auth';

interface LoginFormProps {
  onLogin: (user: AuthUser) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = AuthService.login(credentials.username, credentials.password);
      
      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        setError(result.error || 'Error de autenticación');
      }
    } catch (err) {
      setError('Error interno del sistema');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: string) => {
    let demoCredentials = { username: '', password: '' };
    
    switch (role) {
      case 'admin':
        demoCredentials = { username: 'admin', password: '@Ruth080703' };
        break;
      case 'supervisor':
        demoCredentials = { username: 'supervisor', password: 'supervisor123' };
        break;
      case 'technician':
        demoCredentials = { username: 'tecnico', password: 'tecnico123' };
        break;
      case 'user':
        demoCredentials = { username: 'usuario', password: 'usuario123' };
        break;
    }
    
    setCredentials(demoCredentials);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Sistema RCM3
          </h1>
          <p className="text-muted-foreground">
            Iniciar Sesión - Mantenimiento Centrado en Confiabilidad
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LogIn className="h-5 w-5" />
              <span>Iniciar Sesión</span>
            </CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu contraseña"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cuentas de Demostración</CardTitle>
            <CardDescription className="text-xs">
              Haz clic para usar credenciales de prueba
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('admin')}
                className="text-xs"
              >
                <Shield className="h-3 w-3 mr-1" />
                Administrador
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('supervisor')}
                className="text-xs"
              >
                <User className="h-3 w-3 mr-1" />
                Supervisor
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('technician')}
                className="text-xs"
              >
                <User className="h-3 w-3 mr-1" />
                Técnico
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('user')}
                className="text-xs"
              >
                <User className="h-3 w-3 mr-1" />
                Usuario
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Registration Link */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h4 className="font-semibold text-green-800">¿No tienes cuenta?</h4>
              <p className="text-sm text-green-700">
                Solicita acceso a tu administrador o usa el enlace de registro
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-green-700 border-green-300 hover:bg-green-100"
                onClick={() => window.open('/register', '_blank')}
              >
                Solicitar Acceso
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Sistema RCM3 v2.0 - Mantenimiento Centrado en Confiabilidad</p>
          <p>© 2024 - Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
}