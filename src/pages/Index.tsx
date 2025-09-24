import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wrench, 
  BarChart3, 
  Activity,
  AlertTriangle
} from 'lucide-react';

import EquipmentRegistry from '@/components/EquipmentRegistry';
import RCM3Analysis from '@/components/RCM3Analysis';
import FailureModeManagement from '@/components/FailureModeManagement';
import WorkOrderManagement from '@/components/WorkOrderManagement';
import Dashboard from '@/components/Dashboard';
import DataExport from '@/components/DataExport';
import MaintenanceScheduling from '@/components/MaintenanceScheduling';
import TechnicianWorkspace from '@/components/TechnicianWorkspace';
import InventoryManagement from '@/components/InventoryManagement';
import WorkOrderConfiguration from '@/components/WorkOrderConfiguration';
import UserWorkspace from '@/components/UserWorkspace';
import AdminConfiguration from '@/components/AdminConfiguration';
import LoginForm from '@/components/LoginForm';
import UserManagement from '@/components/UserManagement';
import Sidebar from '@/components/Sidebar';
import CompanySettings from '@/components/CompanySettings';
import SystemSettings from '@/components/SystemSettings';
import FieldManager from '@/components/FieldManager';
import DataIntegration from '@/components/DataIntegration';

import { Equipment, WorkOrder } from '@/lib/rcm3-data';
import { AuthService, User as AuthUser, moduleDefinitions } from '@/lib/auth';
import { formatCurrency } from '@/lib/currency-utils';
import { DataStorage } from '@/lib/data-storage';

export default function Index() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [companyConfig, setCompanyConfig] = useState<{
    name?: string;
    logo?: string;
    industry?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    storageProvider?: string;
    storageConfig?: Record<string, string>;
    deploymentUrl?: string;
  } | null>(null);
  
  // Sample data for demonstration
  const [equipment, setEquipment] = useState<Equipment[]>([
    {
      id: 'EQ-001',
      name: 'Bomba Principal A1',
      type: 'Bomba Centrífuga',
      industry: 'industrial',
      location: 'Planta Norte - Sector A',
      manufacturer: 'Grundfos',
      model: 'CR 64-2',
      installationDate: new Date('2020-03-15'),
      operationalHours: 15600,
      criticality: 'High',
      specifications: {
        potencia: '75 HP',
        caudal: '500 GPM',
        presion: '150 PSI',
        voltaje: '440V'
      }
    },
    {
      id: 'EQ-002',
      name: 'Motor Eléctrico M1',
      type: 'Motor Eléctrico',
      industry: 'industrial',
      location: 'Planta Norte - Sector B',
      manufacturer: 'Siemens',
      model: '1LA7 163-4AA60',
      installationDate: new Date('2019-08-20'),
      operationalHours: 22400,
      criticality: 'Critical',
      specifications: {
        potencia: '100 HP',
        rpm: '1800',
        voltaje: '440V',
        eficiencia: '95.4%'
      }
    }
  ]);

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      id: 'WO-001',
      equipmentId: 'EQ-001',
      type: 'Preventive',
      description: 'Mantenimiento preventivo trimestral - Cambio de aceite y filtros',
      priority: 'Medium',
      status: 'Completed',
      createdDate: new Date('2024-01-15'),
      scheduledDate: new Date('2024-01-20'),
      completedDate: new Date('2024-01-20'),
      technician: 'Juan Pérez',
      cost: 350,
      preventiveActions: ['Cambio de aceite', 'Reemplazo de filtros', 'Inspección visual']
    },
    {
      id: 'WO-002',
      equipmentId: 'EQ-002',
      type: 'Corrective',
      description: 'Reparación de rodamientos - Vibración excesiva detectada',
      priority: 'High',
      status: 'In Progress',
      createdDate: new Date('2024-02-10'),
      scheduledDate: new Date('2024-02-12'),
      technician: 'María González',
      cost: 1200,
      rootCause: 'Desgaste prematuro de rodamientos debido a desalineación del eje',
      preventiveActions: ['Alineación precisa del eje', 'Programa de lubricación mejorado', 'Monitoreo de vibración mensual']
    }
  ]);

  useEffect(() => {
    // Check if user is already logged in
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    
    // Load all persistent data
    loadAllData();
  }, []);

  const loadAllData = () => {
    // Load equipment from storage
    const storedEquipment = DataStorage.getEquipment();
    setEquipment(storedEquipment);

    // Load work orders from storage
    const storedWorkOrders = DataStorage.getWorkOrders();
    setWorkOrders(storedWorkOrders);

    // Load company configuration
    const storedConfig = DataStorage.getCompanyConfig();
    if (Object.keys(storedConfig).length > 0) {
      setCompanyConfig(storedConfig);
    }
  };

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // If not authenticated, show login form
  if (!isAuthenticated || !currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId);
  };

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard equipment={equipment} workOrders={workOrders} />;
      case 'equipment':
        return (
          <EquipmentRegistry
            equipment={equipment}
            onAddEquipment={handleAddEquipment}
            onUpdateEquipment={handleUpdateEquipment}
            onDeleteEquipment={handleDeleteEquipment}
          />
        );
      case 'rcm3':
        return <RCM3Analysis equipment={equipment} />;
      case 'failure-modes':
        return <FailureModeManagement currentUser={currentUser} />;
      case 'workorders':
        return (
          <WorkOrderManagement
            equipment={equipment}
            workOrders={workOrders}
            onAddWorkOrder={handleAddWorkOrder}
            onUpdateWorkOrder={handleUpdateWorkOrder}
          />
        );
      case 'scheduling':
        return (
          <MaintenanceScheduling 
            equipment={equipment} 
            workOrders={workOrders}
            onCreateWorkOrder={handleAddWorkOrder}
          />
        );
      case 'technician':
        return (
          <TechnicianWorkspace 
            equipment={equipment} 
            workOrders={workOrders}
            onUpdateWorkOrder={handleUpdateWorkOrder}
            onCreateWorkOrder={handleAddWorkOrder}
          />
        );
      case 'inventory':
        return <InventoryManagement />;
      case 'user-workspace':
        return (
          <UserWorkspace 
            equipment={equipment} 
            workOrders={workOrders}
            onCreateWorkOrder={handleAddWorkOrder}
            onUpdateWorkOrder={handleUpdateWorkOrder}
            currentUser={{
              id: currentUser.id,
              name: currentUser.name,
              role: currentUser.role as 'Operador' | 'Supervisor' | 'Técnico' | 'Administrador',
              department: currentUser.department
            }}
          />
        );
      case 'config-work-orders':
        return <WorkOrderConfiguration />;
      case 'config-admin':
        return <AdminConfiguration />;
      case 'config-users':
        return <UserManagement currentUser={currentUser} />;
      case 'config':
        return <CompanySettings />;
      case 'system-settings':
        return <SystemSettings currentUser={currentUser} />;
      case 'field-manager':
        return <FieldManager />;
      case 'data-integration':
        return <DataIntegration />;
      case 'export':
        return <DataExport equipment={equipment} workOrders={workOrders} />;
      default:
        return <Dashboard equipment={equipment} workOrders={workOrders} />;
    }
  };

  const handleAddEquipment = (newEquipment: Equipment) => {
    const updatedEquipment = [...equipment, newEquipment];
    setEquipment(updatedEquipment);
    DataStorage.saveEquipment(updatedEquipment);
  };

  const handleUpdateEquipment = (updatedEquipment: Equipment) => {
    const updatedList = equipment.map(eq => eq.id === updatedEquipment.id ? updatedEquipment : eq);
    setEquipment(updatedList);
    DataStorage.saveEquipment(updatedList);
  };

  const handleDeleteEquipment = (id: string) => {
    const updatedEquipment = equipment.filter(eq => eq.id !== id);
    const updatedWorkOrders = workOrders.filter(wo => wo.equipmentId !== id);
    
    setEquipment(updatedEquipment);
    setWorkOrders(updatedWorkOrders);
    
    DataStorage.saveEquipment(updatedEquipment);
    DataStorage.saveWorkOrders(updatedWorkOrders);
  };

  const handleAddWorkOrder = (newWorkOrder: WorkOrder) => {
    const updatedWorkOrders = [...workOrders, newWorkOrder];
    setWorkOrders(updatedWorkOrders);
    DataStorage.saveWorkOrders(updatedWorkOrders);
  };

  const handleUpdateWorkOrder = (updatedWorkOrder: WorkOrder) => {
    const updatedList = workOrders.map(wo => wo.id === updatedWorkOrder.id ? updatedWorkOrder : wo);
    setWorkOrders(updatedList);
    DataStorage.saveWorkOrders(updatedList);
  };

  // Calculate key metrics for overview
  const totalEquipment = equipment.length;
  const criticalEquipment = equipment.filter(eq => eq.criticality === 'Critical' || eq.criticality === 'High').length;
  const openWorkOrders = workOrders.filter(wo => wo.status === 'Open').length;
  const totalCost = workOrders.reduce((sum, wo) => sum + wo.cost, 0);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
        onLogout={handleLogout}
        companyLogo={companyConfig?.logo}
      />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 transition-all duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8 mt-12 md:mt-0">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {companyConfig?.name || 'Sistema RCM3'} - Gestión de Mantenimiento
            </h1>
            <p className="text-muted-foreground">
              Mantenimiento Centrado en Confiabilidad - Análisis Predictivo Universal
            </p>
          </div>

          {/* Quick Stats */}
          {activeModule === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Wrench className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{totalEquipment}</p>
                      <p className="text-sm text-muted-foreground">Equipos Registrados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{criticalEquipment}</p>
                      <p className="text-sm text-muted-foreground">Equipos Críticos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{openWorkOrders}</p>
                      <p className="text-sm text-muted-foreground">Órdenes Abiertas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
                      <p className="text-sm text-muted-foreground">Costo Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Module Content */}
          <div className="space-y-6">
            {renderContent()}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-muted-foreground">
            <p>{companyConfig?.name || 'Sistema RCM3'} - Mantenimiento Centrado en Confiabilidad</p>
            <p className="text-sm">Compatible con cualquier industria</p>
          </div>
        </div>
      </div>
    </div>
  );
}