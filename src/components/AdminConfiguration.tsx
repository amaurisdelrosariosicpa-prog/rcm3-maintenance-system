import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Users, 
  Calculator,
  BarChart3,
  Copy,
  Download,
  Upload,
  Save,
  Plus,
  Trash2
} from 'lucide-react';

interface KPI {
  id: string;
  name: string;
  formula: string;
  description: string;
  unit: string;
  target: number;
  isActive: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Supervisor' | 'Técnico' | 'Usuario';
  department: string;
  isActive: boolean;
}

export default function AdminConfiguration() {
  // Cargar KPIs desde localStorage o usar valores por defecto
  const getInitialKPIs = (): KPI[] => {
    try {
      const stored = localStorage.getItem('admin_kpis');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading KPIs from localStorage:', error);
    }
    
    // Valores por defecto
    return [
      {
        id: 'mtbf',
        name: 'MTBF',
        formula: 'Horas Totales de Operación / Número de Fallas',
        description: 'Tiempo Medio Entre Fallas',
        unit: 'horas',
        target: 1000,
        isActive: true
      },
      {
        id: 'mttr',
        name: 'MTTR',
        formula: 'Tiempo Total de Reparación / Número de Reparaciones',
        description: 'Tiempo Medio de Reparación',
        unit: 'horas',
        target: 4,
        isActive: true
      },
      {
        id: 'availability',
        name: 'Disponibilidad',
        formula: 'MTBF / (MTBF + MTTR) * 100',
        description: 'Porcentaje de Disponibilidad del Equipo',
        unit: '%',
        target: 95,
        isActive: true
      },
      {
        id: 'oee',
        name: 'OEE',
        formula: 'Disponibilidad × Rendimiento × Calidad',
        description: 'Eficiencia General del Equipo',
        unit: '%',
        target: 85,
        isActive: true
      }
    ];
  };

  const [kpis, setKpis] = useState<KPI[]>(getInitialKPIs());

  const [users, setUsers] = useState<User[]>([
    {
      id: 'user-001',
      name: 'Administrador Principal',
      email: 'admin@empresa.com',
      role: 'Administrador',
      department: 'IT',
      isActive: true
    },
    {
      id: 'user-002',
      name: 'Carlos Rodriguez',
      email: 'carlos@empresa.com',
      role: 'Técnico',
      department: 'Mantenimiento Mecánico',
      isActive: true
    },
    {
      id: 'user-003',
      name: 'Ana Martinez',
      email: 'ana@empresa.com',
      role: 'Supervisor',
      department: 'Mantenimiento Eléctrico',
      isActive: true
    }
  ]);

  const [fmeaConfig, setFmeaConfig] = useState({
    severityWeight: 0.4,
    occurrenceWeight: 0.3,
    detectionWeight: 0.3,
    criticalRPN: 100,
    highRPN: 50,
    mediumRPN: 20
  });

  const [newKPI, setNewKPI] = useState<Partial<KPI>>({
    unit: 'número',
    target: 0,
    isActive: true
  });

  const [newUser, setNewUser] = useState<Partial<User>>({
    role: 'Usuario',
    isActive: true
  });

  const [showAddKPI, setShowAddKPI] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);

  const handleAddKPI = () => {
    if (!newKPI.name || !newKPI.formula) return;
    
    const kpi: KPI = {
      id: `kpi-${Date.now()}`,
      name: newKPI.name!,
      formula: newKPI.formula!,
      description: newKPI.description || '',
      unit: newKPI.unit!,
      target: newKPI.target || 0,
      isActive: newKPI.isActive || true
    };
    
    const updatedKpis = [...kpis, kpi];
    setKpis(updatedKpis);
    
    // Guardar en localStorage para persistencia
    localStorage.setItem('admin_kpis', JSON.stringify(updatedKpis));
    
    setNewKPI({ unit: 'número', target: 0, isActive: true });
    setShowAddKPI(false);
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    
    const user: User = {
      id: `user-${Date.now()}`,
      name: newUser.name!,
      email: newUser.email!,
      role: newUser.role as User['role'],
      department: newUser.department || '',
      isActive: newUser.isActive || true
    };
    
    setUsers([...users, user]);
    setNewUser({ role: 'Usuario', isActive: true });
    setShowAddUser(false);
  };

  const handleExportTemplate = () => {
    const template = {
      kpis,
      users: users.filter(u => u.role !== 'Administrador'),
      fmeaConfig,
      version: '2.0',
      createdAt: new Date().toISOString(),
      description: 'Plantilla RCM3 con configuraciones personalizadas'
    };
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rcm3-plantilla-completa.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateAppCopy = () => {
    // Create a complete copy of the application with all data
    const appCopy = {
      config: {
        appName: 'RCM3 Sistema de Mantenimiento - Copia',
        version: '2.0',
        createdAt: new Date().toISOString(),
        description: 'Copia completa del sistema RCM3'
      },
      data: {
        equipment: localStorage.getItem('rcm3_equipment'),
        workOrders: localStorage.getItem('rcm3_work_orders'),
        users: localStorage.getItem('rcm3_users'),
        companyConfig: localStorage.getItem('rcm3_company_config'),
        systemConfig: localStorage.getItem('rcm3_system_config'),
        modulesConfig: localStorage.getItem('rcm3_modules_config'),
        customFields: localStorage.getItem('rcm3_custom_fields')
      },
      kpis,
      users,
      fmeaConfig
    };
    
    const blob = new Blob([JSON.stringify(appCopy, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rcm3-app-copia-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Copia de la aplicación creada y descargada exitosamente. Incluye todos los datos, configuraciones y usuarios.');
  };

  const handleGenerateShareableLink = () => {
    // Generate a shareable link with encoded configuration
    const shareData = {
      kpis: kpis.filter(k => k.isActive),
      fmeaConfig,
      timestamp: new Date().toISOString()
    };
    
    const encodedData = btoa(JSON.stringify(shareData));
    const shareableUrl = `${window.location.origin}${window.location.pathname}?template=${encodedData}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableUrl).then(() => {
      alert(`Enlace compartible generado y copiado al portapapeles:\n\n${shareableUrl}\n\nEste enlace permite a otros usuarios importar tu configuración de KPIs y AMEF.`);
    }).catch(() => {
      // Fallback if clipboard API fails
      prompt('Enlace compartible generado. Copia este enlace:', shareableUrl);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configuración de Administrador</h2>
          <p className="text-muted-foreground">Gestiona parámetros del sistema, usuarios y plantillas</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Plantilla Completa
          </Button>
          <Button variant="outline" onClick={handleCreateAppCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Crear Copia de App
          </Button>
        </div>
      </div>

      <Tabs defaultValue="kpis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kpis">KPIs y Dashboard</TabsTrigger>
          <TabsTrigger value="fmea">Configuración AMEF</TabsTrigger>
          <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
          <TabsTrigger value="template">Plantilla Ejecutable</TabsTrigger>
        </TabsList>

        <TabsContent value="kpis" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Indicadores Clave de Rendimiento</h3>
            <Button onClick={() => setShowAddKPI(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo KPI
            </Button>
          </div>

          {showAddKPI && (
            <Card>
              <CardHeader>
                <CardTitle>Crear Nuevo KPI</CardTitle>
                <CardDescription>Define un nuevo indicador personalizado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre del KPI</Label>
                    <Input 
                      value={newKPI.name || ''}
                      onChange={(e) => setNewKPI({...newKPI, name: e.target.value})}
                      placeholder="Ej: Eficiencia Energética"
                    />
                  </div>
                  <div>
                    <Label>Unidad</Label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={newKPI.unit}
                      onChange={(e) => setNewKPI({...newKPI, unit: e.target.value})}
                    >
                      <option value="número">Número</option>
                      <option value="%">Porcentaje</option>
                      <option value="horas">Horas</option>
                      <option value="días">Días</option>
                      <option value="pesos">Pesos</option>
                      <option value="ratio">Ratio</option>
                    </select>
                  </div>
                  <div>
                    <Label>Valor Objetivo</Label>
                    <Input 
                      type="number"
                      value={newKPI.target || 0}
                      onChange={(e) => setNewKPI({...newKPI, target: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={newKPI.isActive}
                      onCheckedChange={(checked) => setNewKPI({...newKPI, isActive: checked})}
                    />
                    <Label>Activo en Dashboard</Label>
                  </div>
                </div>
                
                <div>
                  <Label>Fórmula de Cálculo</Label>
                  <Input 
                    value={newKPI.formula || ''}
                    onChange={(e) => setNewKPI({...newKPI, formula: e.target.value})}
                    placeholder="Ej: (Tiempo Productivo / Tiempo Total) * 100"
                  />
                </div>
                
                <div>
                  <Label>Descripción</Label>
                  <Textarea 
                    value={newKPI.description || ''}
                    onChange={(e) => setNewKPI({...newKPI, description: e.target.value})}
                    placeholder="Descripción del indicador y su propósito"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddKPI(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddKPI}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar KPI
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {kpis.map(kpi => (
              <Card key={kpi.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold">{kpi.name}</h4>
                        <Badge variant="outline">{kpi.unit}</Badge>
                        <Badge className="bg-blue-500">Meta: {kpi.target}</Badge>
                        {kpi.isActive && <Badge className="bg-green-500">Activo</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{kpi.description}</p>
                      <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                        {kpi.formula}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={kpi.isActive}
                        onCheckedChange={() => {
                          const updatedKpis = kpis.map(k => 
                            k.id === kpi.id ? { ...k, isActive: !k.isActive } : k
                          );
                          setKpis(updatedKpis);
                          // Guardar cambios en localStorage
                          localStorage.setItem('admin_kpis', JSON.stringify(updatedKpis));
                        }}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const newFormula = prompt('Modificar fórmula:', kpi.formula);
                          const newTarget = prompt('Modificar meta:', kpi.target.toString());
                          if (newFormula !== null || newTarget !== null) {
                            setKpis(kpis.map(k => 
                              k.id === kpi.id ? { 
                                ...k, 
                                formula: newFormula || k.formula,
                                target: newTarget ? parseFloat(newTarget) : k.target
                              } : k
                            ));
                          }
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fmea" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Análisis AMEF (FMEA)</CardTitle>
              <CardDescription>Ajusta los parámetros para el cálculo del Número de Prioridad de Riesgo (RPN)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Peso Severidad</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={fmeaConfig.severityWeight}
                    onChange={(e) => setFmeaConfig({
                      ...fmeaConfig,
                      severityWeight: parseFloat(e.target.value)
                    })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Importancia del impacto de la falla</p>
                </div>
                <div>
                  <Label>Peso Ocurrencia</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={fmeaConfig.occurrenceWeight}
                    onChange={(e) => setFmeaConfig({
                      ...fmeaConfig,
                      occurrenceWeight: parseFloat(e.target.value)
                    })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Frecuencia de ocurrencia de la falla</p>
                </div>
                <div>
                  <Label>Peso Detección</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={fmeaConfig.detectionWeight}
                    onChange={(e) => setFmeaConfig({
                      ...fmeaConfig,
                      detectionWeight: parseFloat(e.target.value)
                    })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Capacidad de detectar la falla</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>RPN Crítico (≥)</Label>
                  <Input 
                    type="number"
                    value={fmeaConfig.criticalRPN}
                    onChange={(e) => setFmeaConfig({
                      ...fmeaConfig,
                      criticalRPN: parseInt(e.target.value)
                    })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Requiere acción inmediata</p>
                </div>
                <div>
                  <Label>RPN Alto (≥)</Label>
                  <Input 
                    type="number"
                    value={fmeaConfig.highRPN}
                    onChange={(e) => setFmeaConfig({
                      ...fmeaConfig,
                      highRPN: parseInt(e.target.value)
                    })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Requiere atención prioritaria</p>
                </div>
                <div>
                  <Label>RPN Medio (≥)</Label>
                  <Input 
                    type="number"
                    value={fmeaConfig.mediumRPN}
                    onChange={(e) => setFmeaConfig({
                      ...fmeaConfig,
                      mediumRPN: parseInt(e.target.value)
                    })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Monitoreo regular</p>
                </div>
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración AMEF
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestión de Usuarios</h3>
            <Button onClick={() => setShowAddUser(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>

          {showAddUser && (
            <Card>
              <CardHeader>
                <CardTitle>Crear Nuevo Usuario</CardTitle>
                <CardDescription>Agrega un nuevo usuario al sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre Completo</Label>
                    <Input 
                      value={newUser.name || ''}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={newUser.email || ''}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="juan@empresa.com"
                    />
                  </div>
                  <div>
                    <Label>Rol</Label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value as User['role']})}
                    >
                      <option value="Usuario">Usuario</option>
                      <option value="Técnico">Técnico</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                  </div>
                  <div>
                    <Label>Departamento</Label>
                    <Input 
                      value={newUser.department || ''}
                      onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                      placeholder="Mantenimiento Mecánico"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddUser(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddUser}>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Usuario
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {users.map(user => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold">{user.name}</h4>
                        <Badge variant="outline">{user.role}</Badge>
                        <Badge variant="outline">{user.department}</Badge>
                        {user.isActive && <Badge className="bg-green-500">Activo</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={user.isActive}
                        onCheckedChange={() => {
                          setUsers(users.map(u => 
                            u.id === user.id ? { ...u, isActive: !u.isActive } : u
                          ));
                        }}
                      />
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="template" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plantilla Ejecutable de la Aplicación</CardTitle>
              <CardDescription>Crea una versión ejecutable y compartible de la aplicación RCM3</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🚀 Funcionalidades de la Plantilla:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <p>✅ Gestión completa de equipos (7 industrias)</p>
                    <p>✅ Órdenes de trabajo personalizables</p>
                    <p>✅ Análisis RCM3 y AMEF</p>
                    <p>✅ Dashboard con KPIs personalizados</p>
                    <p>✅ Programación automática de mantenimiento</p>
                  </div>
                  <div>
                    <p>✅ Espacio de trabajo para técnicos</p>
                    <p>✅ Gestión de inventario</p>
                    <p>✅ Configuración de usuarios y roles</p>
                    <p>✅ Exportación de datos</p>
                    <p>✅ Responsive (PC, tablet, móvil)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Nombre de la Plantilla</Label>
                  <Input placeholder="RCM3 - Sistema de Gestión de Mantenimiento" />
                </div>
                
                <div>
                  <Label>Descripción</Label>
                  <Textarea placeholder="Sistema completo de gestión de mantenimiento basado en metodología RCM3, incluye gestión de equipos, órdenes de trabajo, análisis de fallas y dashboard de KPIs." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Versión</Label>
                    <Input placeholder="2.0" />
                  </div>
                  <div>
                    <Label>Empresa/Organización</Label>
                    <Input placeholder="Mi Empresa S.A." />
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleExportTemplate} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Plantilla JSON
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleGenerateShareableLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Generar Enlace Compartible
                </Button>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📱 Acceso Multi-dispositivo:</h4>
                <p className="text-sm text-muted-foreground">
                  La aplicación es completamente responsive y funciona en computadoras, tablets y celulares. 
                  Los datos se guardan automáticamente en el navegador y persisten entre sesiones.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}