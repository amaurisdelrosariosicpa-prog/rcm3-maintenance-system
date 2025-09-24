export interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  title: string;
  description: string;
  type: 'Preventive' | 'Predictive' | 'Inspection';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  frequency: {
    type: 'hours' | 'days' | 'weeks' | 'months' | 'years';
    value: number;
  };
  estimatedDuration: number; // in hours
  requiredSkills: string[];
  requiredParts: Array<{
    partId: string;
    quantity: number;
  }>;
  instructions: string;
  isActive: boolean;
  lastExecuted?: Date;
  nextDue: Date;
  createdDate: Date;
  createdBy: string;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  skills: string[];
  department: string;
  isActive: boolean;
  workload: number; // current hours assigned
  maxWorkload: number; // max hours per week
}

export interface InventoryItem {
  id: string;
  partNumber: string;
  name: string;
  description: string;
  category: 'Mechanical' | 'Electrical' | 'Hydraulic' | 'Pneumatic' | 'Chemical' | 'Tools' | 'Safety';
  unitOfMeasure: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  supplier: string;
  location: string;
  lastUpdated: Date;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  workOrderId?: string;
  reason: string;
  date: Date;
  performedBy: string;
}

// Sample data
export const sampleSchedules: MaintenanceSchedule[] = [
  {
    id: 'sch-001',
    equipmentId: 'eq-001',
    title: 'Cambio de Aceite Motor Principal',
    description: 'Cambio de aceite y filtros del motor principal',
    type: 'Preventive',
    priority: 'Medium',
    frequency: { type: 'hours', value: 500 },
    estimatedDuration: 2,
    requiredSkills: ['Mecánica', 'Lubricación'],
    requiredParts: [
      { partId: 'part-001', quantity: 4 },
      { partId: 'part-002', quantity: 1 }
    ],
    instructions: '1. Drenar aceite usado\n2. Cambiar filtro\n3. Llenar con aceite nuevo\n4. Verificar nivel',
    isActive: true,
    nextDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdDate: new Date('2024-01-15'),
    createdBy: 'admin'
  },
  {
    id: 'sch-002',
    equipmentId: 'eq-002',
    title: 'Inspección Mensual Compresor',
    description: 'Inspección general del sistema de compresión',
    type: 'Inspection',
    priority: 'High',
    frequency: { type: 'months', value: 1 },
    estimatedDuration: 1.5,
    requiredSkills: ['Neumática', 'Inspección'],
    requiredParts: [],
    instructions: '1. Verificar presiones\n2. Inspeccionar mangueras\n3. Revisar válvulas\n4. Documentar hallazgos',
    isActive: true,
    nextDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    createdDate: new Date('2024-01-20'),
    createdBy: 'supervisor'
  }
];

export const sampleTechnicians: Technician[] = [
  {
    id: 'tech-001',
    name: 'Carlos Rodriguez',
    email: 'carlos.rodriguez@company.com',
    skills: ['Mecánica', 'Soldadura', 'Lubricación'],
    department: 'Mantenimiento Mecánico',
    isActive: true,
    workload: 32,
    maxWorkload: 40
  },
  {
    id: 'tech-002',
    name: 'Ana Martinez',
    email: 'ana.martinez@company.com',
    skills: ['Eléctrica', 'Instrumentación', 'PLC'],
    department: 'Mantenimiento Eléctrico',
    isActive: true,
    workload: 28,
    maxWorkload: 40
  },
  {
    id: 'tech-003',
    name: 'Miguel Santos',
    email: 'miguel.santos@company.com',
    skills: ['Neumática', 'Hidráulica', 'Inspección'],
    department: 'Mantenimiento General',
    isActive: true,
    workload: 35,
    maxWorkload: 40
  }
];

export const sampleInventory: InventoryItem[] = [
  {
    id: 'part-001',
    partNumber: 'OIL-15W40-5L',
    name: 'Aceite Motor 15W40',
    description: 'Aceite para motor diesel 15W40 - 5 litros',
    category: 'Chemical',
    unitOfMeasure: 'Litros',
    currentStock: 24,
    minStock: 10,
    maxStock: 50,
    unitCost: 25.50,
    supplier: 'Lubricantes SA',
    location: 'Almacén A-1',
    lastUpdated: new Date()
  },
  {
    id: 'part-002',
    partNumber: 'FILTER-OIL-001',
    name: 'Filtro de Aceite',
    description: 'Filtro de aceite para motor principal',
    category: 'Mechanical',
    unitOfMeasure: 'Unidad',
    currentStock: 8,
    minStock: 5,
    maxStock: 20,
    unitCost: 15.75,
    supplier: 'Filtros Industriales',
    location: 'Almacén B-2',
    lastUpdated: new Date()
  },
  {
    id: 'part-003',
    partNumber: 'BEARING-6205',
    name: 'Rodamiento 6205',
    description: 'Rodamiento de bolas 6205 para bombas',
    category: 'Mechanical',
    unitOfMeasure: 'Unidad',
    currentStock: 3,
    minStock: 5,
    maxStock: 15,
    unitCost: 45.00,
    supplier: 'Rodamientos Técnicos',
    location: 'Almacén C-1',
    lastUpdated: new Date()
  }
];

export const sampleStockMovements: StockMovement[] = [
  {
    id: 'mov-001',
    itemId: 'part-001',
    type: 'OUT',
    quantity: 4,
    workOrderId: 'wo-001',
    reason: 'Cambio de aceite programado',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    performedBy: 'tech-001'
  },
  {
    id: 'mov-002',
    itemId: 'part-002',
    type: 'OUT',
    quantity: 1,
    workOrderId: 'wo-001',
    reason: 'Cambio de filtro programado',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    performedBy: 'tech-001'
  }
];