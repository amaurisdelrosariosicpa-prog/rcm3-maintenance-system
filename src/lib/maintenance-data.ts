// Maintenance Data Structures based on BD Confiabilidad Universal.xlsx

export interface Equipment {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  assetType: string;
  application: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  year: number;
  acquisitionDate: Date;
  operationDate: Date;
  warrantyEndDate: Date;
  plant: string;
  area: string;
  system: string;
  criticalityLevel: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  acquisitionCost: number;
  replacementCost: number;
  usefulLife: number;
  operatingHoursPerDay: number;
  operatingDaysPerWeek: number;
  usageFactor: number;
  status: 'Operativo' | 'Mantenimiento' | 'Fuera de Servicio' | 'Retirado';
  observations: string;
}

export interface MaintenancePlan {
  id: string;
  equipmentId: string;
  planType: 'Preventivo' | 'Predictivo' | 'Correctivo' | 'Overhaul';
  taskName: string;
  description: string;
  frequency: number;
  frequencyUnit: 'Días' | 'Semanas' | 'Meses' | 'Años' | 'Horas';
  estimatedDuration: number; // in hours
  requiredSkills: string[];
  tools: string[];
  spareParts: string[];
  safetyRequirements: string[];
  instructions: string;
  isActive: boolean;
  createdDate: Date;
  lastUpdated: Date;
}

export interface MaintenanceTask {
  id: string;
  planId: string;
  equipmentId: string;
  taskName: string;
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  assignedTechnician: string;
  status: 'Programada' | 'En Progreso' | 'Completada' | 'Cancelada' | 'Vencida';
  priority: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  estimatedHours: number;
  actualHours?: number;
  findings: string;
  recommendations: string;
  nextScheduledDate?: Date;
  createdBy: string;
  createdDate: Date;
}

export interface Failure {
  id: string;
  equipmentId: string;
  failureDate: Date;
  reportedBy: string;
  failureType: 'Mecánica' | 'Eléctrica' | 'Hidráulica' | 'Neumática' | 'Instrumentación' | 'Otro';
  failureMode: string;
  description: string;
  rootCause: string;
  immediateAction: string;
  correctiveAction: string;
  preventiveAction: string;
  downtime: number; // in hours
  repairCost: number;
  sparesUsed: string[];
  techniciansInvolved: string[];
  severity: 'Menor' | 'Moderada' | 'Mayor' | 'Crítica';
  impact: 'Producción' | 'Seguridad' | 'Ambiental' | 'Calidad' | 'Económico';
  status: 'Abierta' | 'En Investigación' | 'Cerrada';
  closedDate?: Date;
  lessons: string;
}

export interface Inventory {
  id: string;
  partNumber: string;
  description: string;
  category: 'Repuesto' | 'Consumible' | 'Herramienta' | 'Lubricante' | 'Químico';
  manufacturer: string;
  supplier: string;
  unitOfMeasure: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  unitCost: number;
  location: string;
  equipmentCompatibility: string[]; // equipment IDs
  lastMovementDate: Date;
  expirationDate?: Date;
  isActive: boolean;
  observations: string;
}

export interface MaintenanceIndicator {
  id: string;
  name: string;
  category: 'Disponibilidad' | 'Confiabilidad' | 'Mantenibilidad' | 'Costo' | 'Seguridad';
  formula: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  calculationPeriod: 'Diario' | 'Semanal' | 'Mensual' | 'Trimestral' | 'Anual';
  lastCalculated: Date;
  trend: 'Mejorando' | 'Estable' | 'Deteriorando';
  isActive: boolean;
}

export interface MaintenanceBudget {
  id: string;
  year: number;
  month: number;
  category: 'Preventivo' | 'Correctivo' | 'Predictivo' | 'Overhaul' | 'Repuestos' | 'Servicios';
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  equipmentId?: string;
  description: string;
  approvedBy: string;
  approvalDate: Date;
}

// Sample data based on the Excel structure
export const sampleEquipment: Equipment[] = [
  {
    id: 'EQ-001',
    name: 'Bomba Centrífuga Principal',
    category: 'Equipos_Rotativos',
    subCategory: 'Bombas',
    assetType: 'Rotativo',
    application: 'Agua_Proceso',
    manufacturer: 'Grundfos',
    model: 'NK-150-315',
    serialNumber: 'GRF2019001',
    year: 2019,
    acquisitionDate: new Date('2019-03-15'),
    operationDate: new Date('2019-01-04'),
    warrantyEndDate: new Date('2022-03-15'),
    plant: 'Planta Norte',
    area: 'Bombeo',
    system: 'Sistema Agua',
    criticalityLevel: 'Crítico',
    acquisitionCost: 25000,
    replacementCost: 35000,
    usefulLife: 50000,
    operatingHoursPerDay: 20,
    operatingDaysPerWeek: 6,
    usageFactor: 0.845238,
    status: 'Operativo',
    observations: 'Bomba principal del sistema de agua de proceso'
  },
  {
    id: 'EQ-002',
    name: 'Motor Eléctrico 75HP',
    category: 'Equipos_Rotativos',
    subCategory: 'Motores',
    assetType: 'Rotativo',
    application: 'Industrial',
    manufacturer: 'WEG',
    model: 'W22-75HP',
    serialNumber: 'WEG2020445',
    year: 2020,
    acquisitionDate: new Date('2020-10-08'),
    operationDate: new Date('2020-08-25'),
    warrantyEndDate: new Date('2023-10-08'),
    plant: 'Planta Norte',
    area: 'Fuerza Motriz',
    system: 'Sistema Eléctrico',
    criticalityLevel: 'Alto',
    acquisitionCost: 18000,
    replacementCost: 22000,
    usefulLife: 60000,
    operatingHoursPerDay: 18,
    operatingDaysPerWeek: 6,
    usageFactor: 0.803571,
    status: 'Operativo',
    observations: 'Motor de bomba principal'
  },
  {
    id: 'EQ-003',
    name: 'Compresor de Aire Atlas',
    category: 'Equipos_Rotativos',
    subCategory: 'Compresores',
    assetType: 'Rotativo',
    application: 'Aire_Comprimido',
    manufacturer: 'Atlas Copco',
    model: 'GA-55',
    serialNumber: 'ATC2018789',
    year: 2018,
    acquisitionDate: new Date('2018-05-12'),
    operationDate: new Date('2018-12-20'),
    warrantyEndDate: new Date('2021-05-12'),
    plant: 'Planta Sur',
    area: 'Neumática',
    system: 'Sistema Aire',
    criticalityLevel: 'Alto',
    acquisitionCost: 45000,
    replacementCost: 55000,
    usefulLife: 45000,
    operatingHoursPerDay: 16,
    operatingDaysPerWeek: 5,
    usageFactor: 0.690476,
    status: 'Operativo',
    observations: 'Compresor de tornillo para sistema neumático'
  }
];

export const sampleMaintenancePlans: MaintenancePlan[] = [
  {
    id: 'MP-001',
    equipmentId: 'EQ-001',
    planType: 'Preventivo',
    taskName: 'Inspección y Lubricación de Bomba',
    description: 'Inspección visual, verificación de vibraciones, cambio de aceite y lubricación de rodamientos',
    frequency: 30,
    frequencyUnit: 'Días',
    estimatedDuration: 2,
    requiredSkills: ['Mecánico Nivel II', 'Lubricación'],
    tools: ['Pistola de grasa', 'Analizador de vibraciones', 'Termómetro infrarrojo'],
    spareParts: ['Aceite SAE 40', 'Grasa EP-2'],
    safetyRequirements: ['Bloqueo energético', 'EPP completo', 'Permiso de trabajo'],
    instructions: '1. Desenergizar equipo\n2. Verificar temperatura\n3. Inspeccionar sellos\n4. Medir vibraciones\n5. Lubricar rodamientos\n6. Registrar lecturas',
    isActive: true,
    createdDate: new Date('2024-01-15'),
    lastUpdated: new Date('2024-01-15')
  }
];

export const sampleFailures: Failure[] = [
  {
    id: 'F-001',
    equipmentId: 'EQ-001',
    failureDate: new Date('2024-08-15'),
    reportedBy: 'Juan Pérez',
    failureType: 'Mecánica',
    failureMode: 'Fuga en sello mecánico',
    description: 'Se detectó fuga de agua en el sello mecánico de la bomba durante inspección rutinaria',
    rootCause: 'Desgaste normal del sello mecánico por tiempo de operación',
    immediateAction: 'Reducir presión de operación y programar cambio de sello',
    correctiveAction: 'Reemplazo de sello mecánico completo',
    preventiveAction: 'Implementar monitoreo de temperatura del sello',
    downtime: 4,
    repairCost: 1200,
    sparesUsed: ['Sello mecánico NK-150'],
    techniciansInvolved: ['Juan Pérez', 'Carlos López'],
    severity: 'Moderada',
    impact: 'Producción',
    status: 'Cerrada',
    closedDate: new Date('2024-08-16'),
    lessons: 'Implementar monitoreo continuo de temperatura para detección temprana'
  }
];

// Utility functions for maintenance management
export class MaintenanceService {
  static getEquipmentByCategory(category: string): Equipment[] {
    return sampleEquipment.filter(eq => eq.category === category);
  }

  static getCriticalEquipment(): Equipment[] {
    return sampleEquipment.filter(eq => eq.criticalityLevel === 'Crítico');
  }

  static getEquipmentDueMaintenance(days: number = 7): Equipment[] {
    // This would calculate based on maintenance plans and last maintenance dates
    // For now, returning sample data
    return sampleEquipment.slice(0, 2);
  }

  static calculateMTBF(equipmentId: string): number {
    // Mean Time Between Failures calculation
    // This would use historical failure data
    return 720; // hours (sample)
  }

  static calculateMTTR(equipmentId: string): number {
    // Mean Time To Repair calculation
    // This would use historical repair data
    return 4; // hours (sample)
  }

  static calculateAvailability(equipmentId: string): number {
    const mtbf = this.calculateMTBF(equipmentId);
    const mttr = this.calculateMTTR(equipmentId);
    return (mtbf / (mtbf + mttr)) * 100;
  }

  static getMaintenanceCostByPeriod(startDate: Date, endDate: Date): number {
    // Calculate total maintenance cost for a period
    // This would sum up actual costs from maintenance tasks
    return 15000; // sample value
  }

  static getEquipmentHistory(equipmentId: string): {
    maintenanceTasks: MaintenanceTask[];
    failures: Failure[];
    costs: number;
  } {
    return {
      maintenanceTasks: [], // would filter by equipmentId
      failures: sampleFailures.filter(f => f.equipmentId === equipmentId),
      costs: 5000 // sample
    };
  }
}