import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Save, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Shield, 
  Database, 
  Palette, 
  Module,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { AuthService, User as UserType, moduleDefinitions } from '@/lib/auth';

interface SystemConfig {
  appName: string;
  appVersion: string;
  companyName: string;
  companyLogo: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  maintenanceMode: boolean;
  debugMode: boolean;
  autoBackup: boolean;
  backupFrequency: string;
  maxUsers: number;
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    expirationDays: number;
  };
}

interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  requiredRole: string;
  customSettings: Record<string, any>;
}

interface SystemSettingsProps {
  currentUser: UserType;
}

const countries = [
  { code: 'US', name: 'Estados Unidos', currency: 'USD', timezone: 'America/New_York' },
  { code: 'ES', name: 'España', currency: 'EUR', timezone: 'Europe/Madrid' },
  { code: 'MX', name: 'México', currency: 'MXN', timezone: 'America/Mexico_City' },
  { code: 'CO', name: 'Colombia', currency: 'COP', timezone: 'America/Bogota' },
  { code: 'DO', name: 'República Dominicana', currency: 'DOP', timezone: 'America/Santo_Domingo' },
  { code: 'AR', name: 'Argentina', currency: 'ARS', timezone: 'America/Buenos_Aires' },
  { code: 'PE', name: 'Perú', currency: 'PEN', timezone: 'America/Lima' },
  { code: 'CL', name: 'Chile', currency: 'CLP', timezone: 'America/Santiago' },
  { code: 'BR', name: 'Brasil', currency: 'BRL', timezone: 'America/Sao_Paulo' },
  { code: 'EC', name: 'Ecuador', currency: 'USD', timezone: 'America/Guayaquil' },
  { code: 'VE', name: 'Venezuela', currency: 'VES', timezone: 'America/Caracas' },
  { code: 'UY', name: 'Uruguay', currency: 'UYU', timezone: 'America/Montevideo' },
  { code: 'PY', name: 'Paraguay', currency: 'PYG', timezone: 'America/Asuncion' },
  { code: 'BO', name: 'Bolivia', currency: 'BOB', timezone: 'America/La_Paz' },
  { code: 'GT', name: 'Guatemala', currency: 'GTQ', timezone: 'America/Guatemala' },
  { code: 'CR', name: 'Costa Rica', currency: 'CRC', timezone: 'America/Costa_Rica' },
  { code: 'PA', name: 'Panamá', currency: 'PAB', timezone: 'America/Panama' },
  { code: 'NI', name: 'Nicaragua', currency: 'NIO', timezone: 'America/Managua' },
  { code: 'HN', name: 'Honduras', currency: 'HNL', timezone: 'America/Tegucigalpa' },
  { code: 'SV', name: 'El Salvador', currency: 'USD', timezone: 'America/El_Salvador' },
  { code: 'CU', name: 'Cuba', currency: 'CUP', timezone: 'America/Havana' },
  { code: 'PR', name: 'Puerto Rico', currency: 'USD', timezone: 'America/Puerto_Rico' }
];

const currencies = [
  { code: 'USD', name: 'Dólar Americano', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
  { code: 'DOP', name: 'Peso Dominicano', symbol: 'RD$' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$' },
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$' },
  { code: 'VES', name: 'Bolívar Venezolano', symbol: 'Bs.' },
  { code: 'UYU', name: 'Peso Uruguayo', symbol: '$U' },
  { code: 'PYG', name: 'Guaraní Paraguayo', symbol: '₲' },
  { code: 'BOB', name: 'Boliviano', symbol: 'Bs.' },
  { code: 'GTQ', name: 'Quetzal Guatemalteco', symbol: 'Q' },
  { code: 'CRC', name: 'Colón Costarricense', symbol: '₡' },
  { code: 'PAB', name: 'Balboa Panameño', symbol: 'B/.' },
  { code: 'NIO', name: 'Córdoba Nicaragüense', symbol: 'C$' },
  { code: 'HNL', name: 'Lempira Hondureño', symbol: 'L' },
  { code: 'CUP', name: 'Peso Cubano', symbol: '$' }
];

export default function SystemSettings({ currentUser }: SystemSettingsProps) {
  const [config, setConfig] = useState<SystemConfig>({
    appName: 'RCM3 Sistema de Mantenimiento',
    appVersion: '2.0.0',
    companyName: 'Mi Empresa',
    companyLogo: '',
    theme: 'light',
    language: 'es',
    timezone: 'America/Bogota',
    dateFormat: 'DD/MM/YYYY',
    currency: 'COP',
    maintenanceMode: false,
    debugMode: false,
    autoBackup: true,
    backupFrequency: 'daily',
    maxUsers: 100,
    sessionTimeout: 30,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: false,
      expirationDays: 90
    }
  });

  const [modules, setModules] = useState<ModuleConfig[]>([]);
  const [adminCredentials, setAdminCredentials] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    loadSystemConfig();
    loadModulesConfig();
  }, []);

  const loadSystemConfig = () => {
    const stored = localStorage.getItem('rcm3_system_config');
    if (stored) {
      setConfig({ ...config, ...JSON.parse(stored) });
    }
  };

  const loadModulesConfig = () => {
    const stored = localStorage.getItem('rcm3_modules_config');
    if (stored) {
      setModules(JSON.parse(stored));
    } else {
      // Initialize with default modules
      const defaultModules: ModuleConfig[] = moduleDefinitions.map(mod => ({
        id: mod.id,
        name: mod.name,
        description: mod.description,
        icon: mod.icon,
        isEnabled: true,
        requiredRole: mod.requiredRole,
        customSettings: {}
      }));
      setModules(defaultModules);
    }
  };

  const saveSystemConfig = () => {
    setSaveStatus('saving');
    try {
      localStorage.setItem('rcm3_system_config', JSON.stringify(config));
      localStorage.setItem('rcm3_modules_config', JSON.stringify(modules));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const updateAdminCredentials = () => {
    if (!adminCredentials.currentPassword || !adminCredentials.newUsername || !adminCredentials.newPassword) {
      alert('Por favor complete todos los campos');
      return;
    }

    if (adminCredentials.newPassword !== adminCredentials.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Verify current password
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser || currentUser.password !== adminCredentials.currentPassword) {
      alert('Contraseña actual incorrecta');
      return;
    }

    try {
      // Update admin user
      AuthService.updateUser(currentUser.id, {
        username: adminCredentials.newUsername,
        password: adminCredentials.newPassword
      });

      // Update current session
      const users = AuthService.getUsers();
      const updatedAdmin = users.find(u => u.id === currentUser.id);
      if (updatedAdmin) {
        localStorage.setItem('rcm3_auth_state', JSON.stringify({
          isAuthenticated: true,
          currentUser: updatedAdmin,
          error: null
        }));
      }

      alert('Credenciales actualizadas correctamente');
      setAdminCredentials({
        currentPassword: '',
        newUsername: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      alert('Error al actualizar credenciales');
    }
  };

  const addNewModule = () => {
    const newModule: ModuleConfig = {
      id: `custom_${Date.now()}`,
      name: 'Nuevo Módulo',
      description: 'Descripción del módulo personalizado',
      icon: 'Settings',
      isEnabled: true,
      requiredRole: 'Usuario',
      customSettings: {}
    };
    setModules([...modules, newModule]);
  };

  const updateModule = (moduleId: string, updates: Partial<ModuleConfig>) => {
    setModules(modules.map(mod => 
      mod.id === moduleId ? { ...mod, ...updates } : mod
    ));
  };

  const deleteModule = (moduleId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este módulo?')) {
      setModules(modules.filter(mod => mod.id !== moduleId));
    }
  };

  const exportConfig = () => {
    const exportData = {
      systemConfig: config,
      modulesConfig: modules,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rcm3-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        if (importData.systemConfig) setConfig(importData.systemConfig);
        if (importData.modulesConfig) setModules(importData.modulesConfig);
        alert('Configuración importada correctamente');
      } catch (error) {
        alert('Error al importar configuración');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configuración del Sistema</h2>
          <p className="text-muted-foreground">Administra todos los aspectos de la aplicación</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportConfig}>
            <Database className="h-4 w-4 mr-2" />
            Exportar Config
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Database className="h-4 w-4 mr-2" />
                Importar Config
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={importConfig}
            />
          </label>
          <Button onClick={saveSystemConfig} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Todo
              </>
            )}
          </Button>
        </div>
      </div>

      {saveStatus === 'saved' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Configuración guardada correctamente</AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Error al guardar la configuración</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="modules">Módulos</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="advanced">Avanzado</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>Configuración básica de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre de la Aplicación</Label>
                  <Input
                    value={config.appName}
                    onChange={(e) => setConfig({ ...config, appName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Versión</Label>
                  <Input
                    value={config.appVersion}
                    onChange={(e) => setConfig({ ...config, appVersion: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Nombre de la Empresa</Label>
                  <Input
                    value={config.companyName}
                    onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Idioma</Label>
                  <Select value={config.language} onValueChange={(value) => setConfig({ ...config, language: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>País</Label>
                  <Select 
                    value={config.timezone} 
                    onValueChange={(value) => {
                      const country = countries.find(c => c.timezone === value);
                      if (country) {
                        setConfig({ 
                          ...config, 
                          timezone: value,
                          currency: country.currency
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country.code} value={country.timezone}>
                          {country.name} ({country.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Moneda</Label>
                  <Select value={config.currency} onValueChange={(value) => setConfig({ ...config, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(curr => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.name} ({curr.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Credenciales de Administrador</CardTitle>
              <CardDescription>Cambia tu usuario y contraseña de administrador</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Contraseña Actual</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords ? 'text' : 'password'}
                      value={adminCredentials.currentPassword}
                      onChange={(e) => setAdminCredentials({ ...adminCredentials, currentPassword: e.target.value })}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Nuevo Usuario</Label>
                  <Input
                    value={adminCredentials.newUsername}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, newUsername: e.target.value })}
                    placeholder={currentUser.username}
                  />
                </div>
                <div>
                  <Label>Nueva Contraseña</Label>
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    value={adminCredentials.newPassword}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, newPassword: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Confirmar Contraseña</Label>
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    value={adminCredentials.confirmPassword}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
              
              <Button onClick={updateAdminCredentials}>
                <Shield className="h-4 w-4 mr-2" />
                Actualizar Credenciales
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Módulos</CardTitle>
                  <CardDescription>Administra los módulos disponibles en el sistema</CardDescription>
                </div>
                <Button onClick={addNewModule}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Módulo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modules.map(module => (
                  <div key={module.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Nombre del Módulo</Label>
                          <Input
                            value={module.name}
                            onChange={(e) => updateModule(module.id, { name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Rol Requerido</Label>
                          <Select 
                            value={module.requiredRole} 
                            onValueChange={(value) => updateModule(module.id, { requiredRole: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Usuario">Usuario</SelectItem>
                              <SelectItem value="Técnico">Técnico</SelectItem>
                              <SelectItem value="Supervisor">Supervisor</SelectItem>
                              <SelectItem value="Administrador">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={module.isEnabled}
                              onCheckedChange={(checked) => updateModule(module.id, { isEnabled: checked })}
                            />
                            <Label>Habilitado</Label>
                          </div>
                          {module.id.startsWith('custom_') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteModule(module.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Descripción</Label>
                      <Textarea
                        value={module.description}
                        onChange={(e) => updateModule(module.id, { description: e.target.value })}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Políticas de Seguridad</CardTitle>
              <CardDescription>Configuración de seguridad y contraseñas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Longitud Mínima de Contraseña</Label>
                  <Input
                    type="number"
                    value={config.passwordPolicy.minLength}
                    onChange={(e) => setConfig({
                      ...config,
                      passwordPolicy: { ...config.passwordPolicy, minLength: Number(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label>Tiempo de Sesión (minutos)</Label>
                  <Input
                    type="number"
                    value={config.sessionTimeout}
                    onChange={(e) => setConfig({ ...config, sessionTimeout: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Máximo de Usuarios</Label>
                  <Input
                    type="number"
                    value={config.maxUsers}
                    onChange={(e) => setConfig({ ...config, maxUsers: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Expiración de Contraseña (días)</Label>
                  <Input
                    type="number"
                    value={config.passwordPolicy.expirationDays}
                    onChange={(e) => setConfig({
                      ...config,
                      passwordPolicy: { ...config.passwordPolicy, expirationDays: Number(e.target.value) }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Requisitos de Contraseña</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.passwordPolicy.requireUppercase}
                      onCheckedChange={(checked) => setConfig({
                        ...config,
                        passwordPolicy: { ...config.passwordPolicy, requireUppercase: checked }
                      })}
                    />
                    <Label>Mayúsculas requeridas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.passwordPolicy.requireNumbers}
                      onCheckedChange={(checked) => setConfig({
                        ...config,
                        passwordPolicy: { ...config.passwordPolicy, requireNumbers: checked }
                      })}
                    />
                    <Label>Números requeridos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.passwordPolicy.requireSymbols}
                      onCheckedChange={(checked) => setConfig({
                        ...config,
                        passwordPolicy: { ...config.passwordPolicy, requireSymbols: checked }
                      })}
                    />
                    <Label>Símbolos requeridos</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>Personaliza la apariencia de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tema</Label>
                  <Select value={config.theme} onValueChange={(value: any) => setConfig({ ...config, theme: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                      <SelectItem value="auto">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Formato de Fecha</Label>
                  <Select value={config.dateFormat} onValueChange={(value) => setConfig({ ...config, dateFormat: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Logo de la Empresa (URL)</Label>
                <Input
                  value={config.companyLogo}
                  onChange={(e) => setConfig({ ...config, companyLogo: e.target.value })}
                  placeholder="https://ejemplo.com/logo.png"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración Avanzada</CardTitle>
              <CardDescription>Configuraciones técnicas del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.maintenanceMode}
                    onCheckedChange={(checked) => setConfig({ ...config, maintenanceMode: checked })}
                  />
                  <Label>Modo Mantenimiento</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.debugMode}
                    onCheckedChange={(checked) => setConfig({ ...config, debugMode: checked })}
                  />
                  <Label>Modo Debug</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.autoBackup}
                    onCheckedChange={(checked) => setConfig({ ...config, autoBackup: checked })}
                  />
                  <Label>Respaldo Automático</Label>
                </div>
              </div>

              <div>
                <Label>Frecuencia de Respaldo</Label>
                <Select value={config.backupFrequency} onValueChange={(value) => setConfig({ ...config, backupFrequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Cada Hora</SelectItem>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}