// Centralized Data Storage Management for RCM3 System
import { Equipment, WorkOrder } from './rcm3-data';
import { User } from './auth';

export class DataStorage {
  // Storage keys
  private static EQUIPMENT_KEY = 'rcm3_equipment';
  private static WORK_ORDERS_KEY = 'rcm3_work_orders';
  private static USERS_KEY = 'rcm3_users';
  private static COMPANY_CONFIG_KEY = 'rcm3_company_config';
  private static SYSTEM_CONFIG_KEY = 'rcm3_system_config';

  // Equipment Management
  static saveEquipment(equipment: Equipment[]): void {
    localStorage.setItem(this.EQUIPMENT_KEY, JSON.stringify(equipment));
  }

  static getEquipment(): Equipment[] {
    const stored = localStorage.getItem(this.EQUIPMENT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return parsed.map((eq: any) => ({
          ...eq,
          acquisitionDate: eq.acquisitionDate ? new Date(eq.acquisitionDate) : new Date(),
          operationDate: eq.operationDate ? new Date(eq.operationDate) : new Date(),
          warrantyEndDate: eq.warrantyEndDate ? new Date(eq.warrantyEndDate) : undefined,
          installationDate: eq.installationDate ? new Date(eq.installationDate) : new Date()
        }));
      } catch (error) {
        console.error('Error parsing equipment data:', error);
        return this.getDefaultEquipment();
      }
    }
    
    // Return default equipment if none stored
    return this.getDefaultEquipment();
  }

  static addEquipment(equipment: Equipment): void {
    const currentEquipment = this.getEquipment();
    currentEquipment.push(equipment);
    this.saveEquipment(currentEquipment);
  }

  static updateEquipment(equipmentId: string, updatedEquipment: Equipment): void {
    const currentEquipment = this.getEquipment();
    const index = currentEquipment.findIndex(eq => eq.id === equipmentId);
    if (index !== -1) {
      currentEquipment[index] = updatedEquipment;
      this.saveEquipment(currentEquipment);
    }
  }

  static deleteEquipment(equipmentId: string): void {
    const currentEquipment = this.getEquipment();
    const filteredEquipment = currentEquipment.filter(eq => eq.id !== equipmentId);
    this.saveEquipment(filteredEquipment);
  }

  // Work Orders Management
  static saveWorkOrders(workOrders: WorkOrder[]): void {
    localStorage.setItem(this.WORK_ORDERS_KEY, JSON.stringify(workOrders));
  }

  static getWorkOrders(): WorkOrder[] {
    const stored = localStorage.getItem(this.WORK_ORDERS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return parsed.map((wo: any) => ({
          ...wo,
          requestDate: wo.requestDate ? new Date(wo.requestDate) : new Date(),
          scheduledDate: wo.scheduledDate ? new Date(wo.scheduledDate) : undefined,
          startDate: wo.startDate ? new Date(wo.startDate) : undefined,
          endDate: wo.endDate ? new Date(wo.endDate) : undefined,
          followupDate: wo.followupDate ? new Date(wo.followupDate) : undefined,
          createdDate: wo.createdDate ? new Date(wo.createdDate) : new Date(),
          completedDate: wo.completedDate ? new Date(wo.completedDate) : undefined
        }));
      } catch (error) {
        console.error('Error parsing work orders data:', error);
        return this.getDefaultWorkOrders();
      }
    }
    
    // Return default work orders if none stored
    return this.getDefaultWorkOrders();
  }

  static addWorkOrder(workOrder: WorkOrder): void {
    const currentWorkOrders = this.getWorkOrders();
    currentWorkOrders.push(workOrder);
    this.saveWorkOrders(currentWorkOrders);
  }

  static updateWorkOrder(workOrderId: string, updatedWorkOrder: WorkOrder): void {
    const currentWorkOrders = this.getWorkOrders();
    const index = currentWorkOrders.findIndex(wo => wo.id === workOrderId);
    if (index !== -1) {
      currentWorkOrders[index] = updatedWorkOrder;
      this.saveWorkOrders(currentWorkOrders);
    }
  }

  static deleteWorkOrder(workOrderId: string): void {
    const currentWorkOrders = this.getWorkOrders();
    const filteredWorkOrders = currentWorkOrders.filter(wo => wo.id !== workOrderId);
    this.saveWorkOrders(filteredWorkOrders);
  }

  // Users Management
  static saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  static getUsers(): User[] {
    const stored = localStorage.getItem(this.USERS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return parsed.map((user: any) => ({
          ...user,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
        }));
      } catch (error) {
        console.error('Error parsing users data:', error);
        return this.getDefaultUsers();
      }
    }
    
    // Return default users if none stored
    return this.getDefaultUsers();
  }

  // Company Configuration
  static saveCompanyConfig(config: any): void {
    localStorage.setItem(this.COMPANY_CONFIG_KEY, JSON.stringify(config));
  }

  static getCompanyConfig(): any {
    const stored = localStorage.getItem(this.COMPANY_CONFIG_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  // System Configuration
  static saveSystemConfig(config: any): void {
    localStorage.setItem(this.SYSTEM_CONFIG_KEY, JSON.stringify(config));
  }

  static getSystemConfig(): any {
    const stored = localStorage.getItem(this.SYSTEM_CONFIG_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  // Factory Reset (Admin Only)
  static resetToFactory(): void {
    // Clear all stored data
    localStorage.removeItem(this.EQUIPMENT_KEY);
    localStorage.removeItem(this.WORK_ORDERS_KEY);
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.COMPANY_CONFIG_KEY);
    localStorage.removeItem(this.SYSTEM_CONFIG_KEY);
    
    // Clear failure modes
    localStorage.removeItem('rcm3_failure_modes');
    localStorage.removeItem('rcm3_custom_failure_modes');
    
    // Clear auth state
    localStorage.removeItem('rcm3_auth_state');
    
    // Clear currency settings
    localStorage.removeItem('rcm3_currency');
    
    // Clear modules config
    localStorage.removeItem('rcm3_modules_config');
  }

  // Export all data
  static exportAllData(): string {
    const data = {
      equipment: this.getEquipment(),
      workOrders: this.getWorkOrders(),
      users: this.getUsers(),
      companyConfig: this.getCompanyConfig(),
      systemConfig: this.getSystemConfig(),
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  // Import all data
  static importAllData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.equipment) this.saveEquipment(data.equipment);
      if (data.workOrders) this.saveWorkOrders(data.workOrders);
      if (data.users) this.saveUsers(data.users);
      if (data.companyConfig) this.saveCompanyConfig(data.companyConfig);
      if (data.systemConfig) this.saveSystemConfig(data.systemConfig);
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Default Data
  private static getDefaultEquipment(): Equipment[] {
    return [
      {
        id: 'EQ-001',
        name: 'Bomba Principal A1',
        mainCategory: 'Equipos Rotativos',
        subCategory: 'Bombas',
        assetType: 'Bomba Centrífuga',
        application: 'Bombeo de agua de proceso',
        manufacturer: 'Grundfos',
        model: 'CR 64-2',
        serialNumber: 'GF-2020-001',
        year: 2020,
        acquisitionDate: new Date('2020-01-15'),
        operationDate: new Date('2020-03-15'),
        warrantyEndDate: new Date('2025-03-15'),
        plant: 'Planta Norte',
        areaOrDepartment: 'Producción - Sector A',
        systemOrProcess: 'Sistema de Agua de Proceso',
        criticality: 'Alto',
        acquisitionCost: 25000,
        replacementCost: 30000,
        usefulLifeHours: 87600,
        operationHoursPerDay: 16,
        operationDaysPerWeek: 7,
        usageFactor: 0.8,
        status: 'Activo',
        observations: 'Equipo crítico para el proceso de producción',
        // Legacy fields for backward compatibility
        type: 'Bomba Centrífuga',
        industry: 'industrial',
        location: 'Planta Norte - Sector A',
        installationDate: new Date('2020-03-15'),
        operationalHours: 15600,
        specifications: {
          potencia: '75 HP',
          caudal: '500 GPM',
          presion: '150 PSI',
          voltaje: '440V'
        }
      }
    ];
  }

  private static getDefaultWorkOrders(): WorkOrder[] {
    return [
      {
        id: 'WO-001',
        equipmentId: 'EQ-001',
        affectedSystem: 'Sistema de Bombeo',
        type: 'Preventive',
        subType: 'Lubricación',
        frequency: 'Mensual',
        priority: 'Medium',
        requestDate: new Date(),
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        plannedDuration: 2,
        description: 'Lubricación de rodamientos y verificación de sellos',
        laborHours: 2,
        laborCost: 100,
        sparesCost: 50,
        externalCost: 0,
        totalMaintenanceCost: 150,
        technician: 'Juan Pérez',
        supervisor: 'Carlos López',
        shift: 'Day',
        specialty: 'Mecánica',
        status: 'Open',
        progress: 0,
        approval: 'Approved',
        workSatisfactory: false,
        requiresFollowup: false,
        conditionBefore: 'Operativo normal'
      }
    ];
  }

  private static getDefaultUsers(): User[] {
    return [
      {
        id: 'admin-001',
        username: 'admin',
        password: 'admin123',
        name: 'Administrador Sistema',
        email: 'admin@empresa.com',
        role: 'Administrador',
        department: 'IT',
        isActive: true,
        allowedModules: ['dashboard', 'equipment', 'rcm3', 'failure-modes', 'workorders', 'scheduling', 'technician', 'inventory', 'user-workspace', 'config', 'system-settings', 'export'],
        createdAt: new Date('2024-01-01'),
        lastLogin: undefined
      }
    ];
  }
}