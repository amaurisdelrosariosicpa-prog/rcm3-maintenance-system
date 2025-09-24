// RCM3 Methodology Data and Templates

export interface Equipment {
  id: string;
  name: string;
  mainCategory: string;
  subCategory: string;
  assetType: string;
  application: string;
  type: string;
  industry: 'Industrial' | 'Servicio' | 'Salud' | 'Educación' | 'Minero' | 'Logística' | 'Comercio';
  subIndustry?: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  year: number;
  acquisitionDate: Date;
  operationDate: Date;
  warrantyEndDate?: Date;
  plant: string;
  area: string;
  system: string;
  location: string;
  criticality: 'Low' | 'Medium' | 'High' | 'Critical';
  installationDate: Date;
  acquisitionCost: number;
  replacementCost: number;
  usefulLife: number; // in hours
  operationalHoursPerDay: number;
  operationalDaysPerWeek: number;
  usageFactor: number; // 0-1
  status: 'Activo' | 'Inactivo' | 'En Mantenimiento' | 'Fuera de Servicio' | 'Obsoleto';
  observations?: string;
  operationalSchedule: {
    type: 'Continuo 24/7' | 'Tres Turnos' | 'Dos Turnos' | 'Un Turno' | 'Intermitente';
    hoursPerDay: number;
    daysPerWeek: number;
  };
  weight: number; // in kg
  specifications: Record<string, string | number>;
  systemsAffected: string[];
}

export interface FailureMode {
  id: string;
  equipmentType: string;
  description: string;
  causes: string[];
  effects: string[];
  detectionMethods: string[];
  preventiveActions: string[];
  frequency: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  severity: 'Minor' | 'Moderate' | 'Major' | 'Critical';
  detectability: 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';
}

export interface WorkOrder {
  id: string;
  equipmentId: string;
  affectedSystem: string;
  type: 'Preventive' | 'Corrective' | 'Predictive' | 'Emergency';
  subType: string;
  frequency?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  requestDate: Date;
  scheduledDate?: Date;
  startDate?: Date;
  endDate?: Date;
  plannedDuration: number; // in hours
  actualDuration?: number; // in hours
  description: string;
  problem?: string;
  rootCause?: string;
  solution?: string;
  laborHours: number;
  laborCost: number;
  spare1?: string;
  spare2?: string;
  spare3?: string;
  spare4?: string;
  spare5?: string;
  sparesCost: number;
  externalCost: number;
  totalMaintenanceCost: number;
  technician: string;
  supervisor: string;
  shift: 'Day' | 'Night' | 'Rotating';
  specialty: string;
  status: 'Draft' | 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  progress: number; // 0-100%
  approval: 'Pending' | 'Approved' | 'Rejected';
  workSatisfactory: boolean;
  requiresFollowup: boolean;
  followupDate?: Date;
  lessonsLearned?: string;
  conditionBefore: string;
  conditionAfter?: string;
  observations?: string;
}

// Industry Templates with Enhanced Equipment Types
export const industryTemplates = {
  Industrial: {
    name: 'Industrial',
    equipmentTypes: [
      'Compresor de Aire', 'Bomba Centrífuga', 'Motor Eléctrico', 'Transformador',
      'Generador', 'Caldera', 'Intercambiador de Calor', 'Válvula de Control',
      'Transportador', 'Grúa Industrial', 'Prensa Hidráulica', 'Torno CNC',
      'Fresadora', 'Soldadora', 'Horno Industrial'
    ]
  },
  Servicio: {
    name: 'Servicio',
    equipmentTypes: [
      'Servidor', 'Sistema de Comunicaciones', 'UPS', 'Sistema de Seguridad',
      'HVAC', 'Generador', 'Ascensor', 'Sistema de Iluminación',
      'Equipo de Oficina', 'Sistema de Red'
    ]
  },
  Salud: {
    name: 'Salud',
    equipmentTypes: [
      'Resonancia Magnética', 'Tomógrafo', 'Rayos X', 'Ventilador Médico',
      'Autoclave', 'Generador de Oxígeno', 'Sistema de Gases Medicinales',
      'UPS Médico', 'Sistema de Climatización', 'Equipo de Laboratorio'
    ]
  },
  Educación: {
    name: 'Educación',
    equipmentTypes: [
      'Proyector', 'Sistema de Audio', 'Computadora', 'Laboratorio',
      'HVAC', 'Generador', 'Sistema de Seguridad', 'Ascensor',
      'Cocina', 'Equipo Deportivo'
    ]
  },
  Minero: {
    name: 'Minero',
    equipmentTypes: [
      'Excavadora', 'Camión Minero', 'Perforadora', 'Chancadora',
      'Molino', 'Flotadora', 'Bomba de Lodos', 'Transportador',
      'Compresor', 'Generador Diesel'
    ]
  },
  Logística: {
    name: 'Logística',
    equipmentTypes: [
      'Montacargas', 'Transportador', 'Sistema de Clasificación', 'Grúa',
      'Camión', 'Sistema WMS', 'Báscula', 'Sistema de Refrigeración',
      'Compresor', 'Generador'
    ]
  },
  Comercio: {
    name: 'Comercio',
    equipmentTypes: [
      'Sistema POS', 'Refrigerador Comercial', 'HVAC', 'Sistema de Seguridad',
      'Escalera Mecánica', 'Ascensor', 'Sistema de Iluminación', 'Generador',
      'Sistema de Audio', 'Cámara Frigorífica'
    ]
  }
};

// Equipment Weight Standards (in kg)
export const equipmentWeights: Record<string, number> = {
  // Industrial
  'Compresor de Aire': 500,
  'Bomba Centrífuga': 150,
  'Motor Eléctrico': 200,
  'Transformador': 2000,
  'Generador': 1500,
  'Caldera': 5000,
  'Intercambiador de Calor': 800,
  'Válvula de Control': 50,
  'Transportador': 1000,
  'Grúa Industrial': 15000,
  'Prensa Hidráulica': 3000,
  'Torno CNC': 2500,
  'Fresadora': 2000,
  'Soldadora': 100,
  'Horno Industrial': 4000,
  
  // Health
  'Resonancia Magnética': 6000,
  'Tomógrafo': 4000,
  'Rayos X': 500,
  'Ventilador Médico': 50,
  'Autoclave': 300,
  'Generador de Oxígeno': 200,
  
  // Mining
  'Excavadora': 25000,
  'Camión Minero': 45000,
  'Perforadora': 8000,
  'Chancadora': 15000,
  'Molino': 20000,
  'Flotadora': 5000,
  
  // Service & Others
  'Servidor': 30,
  'UPS': 100,
  'Montacargas': 3000,
  'Sistema POS': 5,
  'Refrigerador Comercial': 200,
  'Sistema HVAC': 1000,
  'Ascensor': 2000
};

export const operationalSchedules = {
  'Continuo 24/7': { hoursPerDay: 24, daysPerWeek: 7 },
  'Tres Turnos': { hoursPerDay: 24, daysPerWeek: 5 },
  'Dos Turnos': { hoursPerDay: 16, daysPerWeek: 5 },
  'Un Turno': { hoursPerDay: 8, daysPerWeek: 5 },
  'Intermitente': { hoursPerDay: 4, daysPerWeek: 3 }
};

// Comprehensive Failure Modes Database by Equipment Type and Industry
export const failureModesDatabase: Record<string, FailureMode[]> = {
  // INDUSTRIAL EQUIPMENT
  'Compresor de Aire': [
    {
      id: 'CA001',
      equipmentType: 'Compresor de Aire',
      description: 'Sobrecalentamiento del compresor',
      causes: ['Filtro de aire obstruido', 'Nivel bajo de aceite', 'Ventilación deficiente', 'Sobrecarga del sistema'],
      effects: ['Parada automática', 'Daño en componentes internos', 'Reducción de eficiencia'],
      detectionMethods: ['Termografía', 'Monitoreo de temperatura', 'Análisis de aceite'],
      preventiveActions: ['Cambio de filtros', 'Verificación de aceite', 'Limpieza de radiadores'],
      frequency: 'Medium',
      severity: 'Major',
      detectability: 'High'
    },
    {
      id: 'CA002',
      equipmentType: 'Compresor de Aire',
      description: 'Fuga de aire comprimido',
      causes: ['Sellos desgastados', 'Conexiones flojas', 'Válvulas defectuosas', 'Tuberías dañadas'],
      effects: ['Pérdida de presión', 'Consumo excesivo de energía', 'Ruido excesivo'],
      detectionMethods: ['Detector ultrasónico', 'Medición de presión', 'Inspección visual'],
      preventiveActions: ['Reemplazo de sellos', 'Ajuste de conexiones', 'Mantenimiento de válvulas'],
      frequency: 'High',
      severity: 'Moderate',
      detectability: 'Medium'
    }
  ],

  'Bomba Centrífuga': [
    {
      id: 'BC001',
      equipmentType: 'Bomba Centrífuga',
      description: 'Cavitación',
      causes: ['NPSH insuficiente', 'Velocidad excesiva', 'Temperatura alta del fluido'],
      effects: ['Erosión del impulsor', 'Vibración', 'Reducción de eficiencia'],
      detectionMethods: ['Análisis de vibración', 'Medición de presión', 'Análisis acústico'],
      preventiveActions: ['Verificar NPSH disponible', 'Control de temperatura', 'Ajuste de velocidad'],
      frequency: 'High',
      severity: 'Major',
      detectability: 'Medium'
    },
    {
      id: 'BC002',
      equipmentType: 'Bomba Centrífuga',
      description: 'Desgaste del impulsor',
      causes: ['Fluido abrasivo', 'Velocidad excesiva', 'Cavitación prolongada', 'Materiales inadecuados'],
      effects: ['Reducción de caudal', 'Pérdida de eficiencia', 'Vibración anormal'],
      detectionMethods: ['Análisis de rendimiento', 'Inspección endoscópica', 'Medición de vibración'],
      preventiveActions: ['Filtrado del fluido', 'Control de velocidad', 'Selección de materiales'],
      frequency: 'Medium',
      severity: 'Major',
      detectability: 'Medium'
    }
  ],

  'Motor Eléctrico': [
    {
      id: 'ME001',
      equipmentType: 'Motor Eléctrico',
      description: 'Sobrecalentamiento del motor',
      causes: ['Sobrecarga', 'Ventilación deficiente', 'Rodamientos desgastados', 'Desequilibrio de fases'],
      effects: ['Reducción de vida útil', 'Parada no programada', 'Daño en devanados'],
      detectionMethods: ['Termografía', 'Análisis de vibración', 'Medición de corriente'],
      preventiveActions: ['Limpieza periódica', 'Lubricación de rodamientos', 'Verificación de carga'],
      frequency: 'Medium',
      severity: 'Major',
      detectability: 'High'
    },
    {
      id: 'ME002',
      equipmentType: 'Motor Eléctrico',
      description: 'Falla de rodamientos',
      causes: ['Falta de lubricación', 'Contaminación', 'Desalineación', 'Vibración excesiva'],
      effects: ['Ruido excesivo', 'Vibración', 'Parada del equipo'],
      detectionMethods: ['Análisis de vibración', 'Análisis de aceite', 'Termografía'],
      preventiveActions: ['Programa de lubricación', 'Alineación precisa', 'Monitoreo de vibración'],
      frequency: 'Medium',
      severity: 'Major',
      detectability: 'Medium'
    },
    {
      id: 'ME003',
      equipmentType: 'Motor Eléctrico',
      description: 'Falla en devanados',
      causes: ['Sobretensión', 'Humedad', 'Contaminación', 'Envejecimiento del aislamiento'],
      effects: ['Cortocircuito', 'Parada total', 'Riesgo de incendio'],
      detectionMethods: ['Prueba de aislamiento', 'Termografía', 'Análisis de corriente'],
      preventiveActions: ['Control de humedad', 'Limpieza regular', 'Pruebas eléctricas'],
      frequency: 'Low',
      severity: 'Critical',
      detectability: 'Medium'
    }
  ],

  'Transformador': [
    {
      id: 'TR001',
      equipmentType: 'Transformador',
      description: 'Sobrecalentamiento del aceite',
      causes: ['Sobrecarga', 'Falla en ventilación', 'Nivel bajo de aceite', 'Cortocircuito interno'],
      effects: ['Degradación del aislamiento', 'Formación de gases', 'Parada del transformador'],
      detectionMethods: ['Termografía', 'Análisis de gases disueltos', 'Monitoreo de temperatura'],
      preventiveActions: ['Control de carga', 'Mantenimiento de ventiladores', 'Análisis de aceite'],
      frequency: 'Medium',
      severity: 'Critical',
      detectability: 'High'
    }
  ],

  'Generador': [
    {
      id: 'GE001',
      equipmentType: 'Generador',
      description: 'Falla en el sistema de combustible',
      causes: ['Combustible contaminado', 'Filtros obstruidos', 'Bomba de combustible defectuosa'],
      effects: ['Parada del generador', 'Funcionamiento irregular', 'Daño en inyectores'],
      detectionMethods: ['Análisis de combustible', 'Monitoreo de presión', 'Inspección visual'],
      preventiveActions: ['Filtrado de combustible', 'Cambio de filtros', 'Limpieza de tanques'],
      frequency: 'Medium',
      severity: 'Major',
      detectability: 'Medium'
    }
  ],

  // HEALTH SECTOR EQUIPMENT
  'Resonancia Magnética': [
    {
      id: 'RM001',
      equipmentType: 'Resonancia Magnética',
      description: 'Pérdida de helio criogénico',
      causes: ['Fuga en el sistema criogénico', 'Falla en compresor', 'Válvulas defectuosas'],
      effects: ['Pérdida de campo magnético', 'Parada del equipo', 'Costo elevado de reposición'],
      detectionMethods: ['Monitoreo de nivel de helio', 'Detector de fugas', 'Alarmas del sistema'],
      preventiveActions: ['Inspección de sellos', 'Mantenimiento preventivo', 'Monitoreo continuo'],
      frequency: 'Low',
      severity: 'Critical',
      detectability: 'High'
    }
  ],

  'Tomógrafo': [
    {
      id: 'TO001',
      equipmentType: 'Tomógrafo',
      description: 'Falla en tubo de rayos X',
      causes: ['Sobrecalentamiento', 'Desgaste del ánodo', 'Falla en refrigeración'],
      effects: ['Pérdida de calidad de imagen', 'Parada del equipo', 'Costo elevado de reemplazo'],
      detectionMethods: ['Monitoreo de temperatura', 'Análisis de calidad de imagen', 'Diagnóstico del sistema'],
      preventiveActions: ['Control de temperatura', 'Mantenimiento de refrigeración', 'Calibración regular'],
      frequency: 'Medium',
      severity: 'Critical',
      detectability: 'Medium'
    }
  ],

  'Ventilador Médico': [
    {
      id: 'VM001',
      equipmentType: 'Ventilador Médico',
      description: 'Falla en sensores de presión',
      causes: ['Calibración incorrecta', 'Contaminación', 'Desgaste de componentes'],
      effects: ['Alarmas falsas', 'Ventilación inadecuada', 'Riesgo para el paciente'],
      detectionMethods: ['Calibración de sensores', 'Pruebas funcionales', 'Monitoreo de alarmas'],
      preventiveActions: ['Calibración regular', 'Limpieza de sensores', 'Reemplazo preventivo'],
      frequency: 'Medium',
      severity: 'Critical',
      detectability: 'High'
    }
  ],

  // MINING EQUIPMENT
  'Excavadora': [
    {
      id: 'EX001',
      equipmentType: 'Excavadora',
      description: 'Falla en sistema hidráulico',
      causes: ['Aceite contaminado', 'Sellos desgastados', 'Sobrecarga del sistema'],
      effects: ['Pérdida de potencia', 'Movimientos lentos', 'Parada del equipo'],
      detectionMethods: ['Análisis de aceite', 'Medición de presión', 'Inspección visual'],
      preventiveActions: ['Cambio de aceite', 'Reemplazo de filtros', 'Inspección de sellos'],
      frequency: 'High',
      severity: 'Major',
      detectability: 'Medium'
    }
  ],

  'Camión Minero': [
    {
      id: 'CM001',
      equipmentType: 'Camión Minero',
      description: 'Desgaste de neumáticos',
      causes: ['Sobrecarga', 'Presión inadecuada', 'Condiciones de terreno', 'Velocidad excesiva'],
      effects: ['Reducción de tracción', 'Aumento de consumo', 'Riesgo de accidente'],
      detectionMethods: ['Inspección visual', 'Medición de profundidad', 'Monitoreo de presión'],
      preventiveActions: ['Control de carga', 'Mantenimiento de presión', 'Rotación de neumáticos'],
      frequency: 'High',
      severity: 'Major',
      detectability: 'High'
    }
  ],

  // SERVICE SECTOR EQUIPMENT
  'Servidor': [
    {
      id: 'SV001',
      equipmentType: 'Servidor',
      description: 'Sobrecalentamiento de CPU',
      causes: ['Ventiladores defectuosos', 'Acumulación de polvo', 'Sobrecarga de procesamiento'],
      effects: ['Reducción de rendimiento', 'Paradas inesperadas', 'Daño en componentes'],
      detectionMethods: ['Monitoreo de temperatura', 'Alertas del sistema', 'Análisis de rendimiento'],
      preventiveActions: ['Limpieza regular', 'Mantenimiento de ventiladores', 'Monitoreo de carga'],
      frequency: 'Medium',
      severity: 'Major',
      detectability: 'High'
    }
  ],

  'UPS': [
    {
      id: 'UP001',
      equipmentType: 'UPS',
      description: 'Degradación de baterías',
      causes: ['Envejecimiento', 'Ciclos de carga/descarga', 'Temperatura elevada'],
      effects: ['Reducción de autonomía', 'Falla en respaldo', 'Parada de sistemas críticos'],
      detectionMethods: ['Prueba de baterías', 'Monitoreo de voltaje', 'Análisis de impedancia'],
      preventiveActions: ['Reemplazo programado', 'Control de temperatura', 'Pruebas regulares'],
      frequency: 'Medium',
      severity: 'Critical',
      detectability: 'Medium'
    }
  ],

  'Sistema HVAC': [
    {
      id: 'HVAC001',
      equipmentType: 'Sistema HVAC',
      description: 'Falla del compresor',
      causes: ['Falta de refrigerante', 'Filtros sucios', 'Sobrecalentamiento'],
      effects: ['Pérdida de enfriamiento', 'Consumo excesivo de energía', 'Parada del sistema'],
      detectionMethods: ['Medición de presiones', 'Termografía', 'Análisis de corriente'],
      preventiveActions: ['Cambio de filtros', 'Verificación de refrigerante', 'Limpieza de condensadores'],
      frequency: 'Medium',
      severity: 'Major',
      detectability: 'High'
    }
  ],

  // LOGISTICS EQUIPMENT
  'Montacargas': [
    {
      id: 'MC001',
      equipmentType: 'Montacargas',
      description: 'Falla en sistema de elevación',
      causes: ['Aceite hidráulico contaminado', 'Cilindros desgastados', 'Válvulas defectuosas'],
      effects: ['Pérdida de capacidad de carga', 'Movimientos erráticos', 'Riesgo de accidente'],
      detectionMethods: ['Análisis de aceite', 'Pruebas de presión', 'Inspección visual'],
      preventiveActions: ['Cambio de aceite', 'Mantenimiento de cilindros', 'Calibración de válvulas'],
      frequency: 'Medium',
      severity: 'Major',
      detectability: 'Medium'
    }
  ],

  // COMMERCIAL EQUIPMENT
  'Sistema POS': [
    {
      id: 'POS001',
      equipmentType: 'Sistema POS',
      description: 'Falla en lector de tarjetas',
      causes: ['Desgaste mecánico', 'Suciedad en contactos', 'Falla electrónica'],
      effects: ['Rechazo de transacciones', 'Pérdida de ventas', 'Insatisfacción del cliente'],
      detectionMethods: ['Pruebas de transacción', 'Inspección visual', 'Diagnóstico del sistema'],
      preventiveActions: ['Limpieza regular', 'Calibración', 'Reemplazo preventivo'],
      frequency: 'Medium',
      severity: 'Moderate',
      detectability: 'High'
    }
  ],

  'Refrigerador Comercial': [
    {
      id: 'RC001',
      equipmentType: 'Refrigerador Comercial',
      description: 'Pérdida de refrigeración',
      causes: ['Fuga de refrigerante', 'Compresor defectuoso', 'Evaporador obstruido'],
      effects: ['Pérdida de productos', 'Aumento de temperatura', 'Costos de reposición'],
      detectionMethods: ['Monitoreo de temperatura', 'Medición de presiones', 'Inspección visual'],
      preventiveActions: ['Mantenimiento de sellos', 'Limpieza de evaporadores', 'Verificación de refrigerante'],
      frequency: 'Medium',
      severity: 'Major',
      detectability: 'High'
    }
  ],

  // EDUCATION EQUIPMENT
  'Proyector': [
    {
      id: 'PR001',
      equipmentType: 'Proyector',
      description: 'Degradación de lámpara',
      causes: ['Horas de uso', 'Sobrecalentamiento', 'Calidad de energía'],
      effects: ['Reducción de brillo', 'Calidad de imagen deficiente', 'Parada del equipo'],
      detectionMethods: ['Monitoreo de horas', 'Medición de brillo', 'Inspección visual'],
      preventiveActions: ['Reemplazo programado', 'Control de temperatura', 'Limpieza de filtros'],
      frequency: 'High',
      severity: 'Moderate',
      detectability: 'High'
    }
  ],

  'Laboratorio': [
    {
      id: 'LAB001',
      equipmentType: 'Laboratorio',
      description: 'Falla en sistema de ventilación',
      causes: ['Filtros obstruidos', 'Ventiladores defectuosos', 'Ductos dañados'],
      effects: ['Contaminación del ambiente', 'Riesgo para la salud', 'Resultados incorrectos'],
      detectionMethods: ['Medición de flujo de aire', 'Monitoreo de calidad', 'Inspección visual'],
      preventiveActions: ['Cambio de filtros', 'Mantenimiento de ventiladores', 'Limpieza de ductos'],
      frequency: 'Medium',
      severity: 'Critical',
      detectability: 'Medium'
    }
  ]
};

// Criticality Assessment Matrix
export const criticalityMatrix = {
  frequency: {
    'Very Low': 1,
    'Low': 2,
    'Medium': 3,
    'High': 4,
    'Very High': 5
  },
  severity: {
    'Minor': 1,
    'Moderate': 2,
    'Major': 3,
    'Critical': 4
  },
  detectability: {
    'Very High': 1,
    'High': 2,
    'Medium': 3,
    'Low': 4,
    'Very Low': 5
  }
};

export const calculateRPN = (frequency: string, severity: string, detectability: string): number => {
  return criticalityMatrix.frequency[frequency as keyof typeof criticalityMatrix.frequency] *
         criticalityMatrix.severity[severity as keyof typeof criticalityMatrix.severity] *
         criticalityMatrix.detectability[detectability as keyof typeof criticalityMatrix.detectability];
};

export const getRiskLevel = (rpn: number): string => {
  if (rpn >= 60) return 'Critical';
  if (rpn >= 40) return 'High';
  if (rpn >= 20) return 'Medium';
  return 'Low';
};