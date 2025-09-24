// Sistema de gestión de campos dinámicos para módulos
export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox' | 'email' | 'tel';
  required: boolean;
  placeholder?: string;
  options?: string[]; // Para campos select
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  order: number;
  isSystem: boolean; // Campos del sistema no se pueden eliminar
}

export interface ModuleFields {
  equipment: CustomField[];
  workorders: CustomField[];
  inventory: CustomField[];
  scheduling: CustomField[];
  dashboard: CustomField[];
}

export class FieldManager {
  private static STORAGE_KEY = 'custom_fields_config';

  // Campos por defecto del sistema
  private static getDefaultFields(): ModuleFields {
    return {
      equipment: [
        {
          id: 'name',
          name: 'name',
          label: 'Nombre del Equipo',
          type: 'text',
          required: true,
          placeholder: 'Ingrese el nombre del equipo',
          order: 1,
          isSystem: true
        },
        {
          id: 'type',
          name: 'type',
          label: 'Tipo de Equipo',
          type: 'select',
          required: true,
          options: ['Bomba', 'Motor', 'Compresor', 'Generador', 'Turbina', 'Intercambiador', 'Válvula'],
          order: 2,
          isSystem: true
        },
        {
          id: 'model',
          name: 'model',
          label: 'Modelo',
          type: 'text',
          required: false,
          placeholder: 'Modelo del equipo',
          order: 3,
          isSystem: true
        },
        {
          id: 'serialNumber',
          name: 'serialNumber',
          label: 'Número de Serie',
          type: 'text',
          required: false,
          placeholder: 'Número de serie',
          order: 4,
          isSystem: true
        },
        {
          id: 'location',
          name: 'location',
          label: 'Ubicación',
          type: 'text',
          required: true,
          placeholder: 'Ubicación del equipo',
          order: 5,
          isSystem: true
        },
        {
          id: 'manufacturer',
          name: 'manufacturer',
          label: 'Fabricante',
          type: 'text',
          required: false,
          placeholder: 'Fabricante del equipo',
          order: 6,
          isSystem: true
        },
        {
          id: 'installationDate',
          name: 'installationDate',
          label: 'Fecha de Instalación',
          type: 'date',
          required: false,
          order: 7,
          isSystem: true
        },
        {
          id: 'criticality',
          name: 'criticality',
          label: 'Criticidad',
          type: 'select',
          required: true,
          options: ['Low', 'Medium', 'High', 'Critical'],
          order: 8,
          isSystem: true
        },
        {
          id: 'status',
          name: 'status',
          label: 'Estado',
          type: 'select',
          required: true,
          options: ['Operational', 'Maintenance', 'Out of Service', 'Retired'],
          order: 9,
          isSystem: true
        }
      ],
      workorders: [
        {
          id: 'equipmentId',
          name: 'equipmentId',
          label: 'Equipo',
          type: 'select',
          required: true,
          isSystem: true,
          order: 1
        },
        {
          id: 'type',
          name: 'type',
          label: 'Tipo de Mantenimiento',
          type: 'select',
          options: ['Preventive', 'Corrective', 'Emergency', 'Predictive'],
          required: true,
          isSystem: true,
          order: 2
        },
        {
          id: 'description',
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          required: true,
          isSystem: true,
          order: 3
        },
        {
          id: 'priority',
          name: 'priority',
          label: 'Prioridad',
          type: 'select',
          options: ['Low', 'Medium', 'High', 'Critical'],
          required: true,
          isSystem: true,
          order: 4
        },
        {
          id: 'technician',
          name: 'technician',
          label: 'Técnico Asignado',
          type: 'text',
          required: false,
          isSystem: true,
          order: 5
        },
        {
          id: 'scheduledDate',
          name: 'scheduledDate',
          label: 'Fecha Programada',
          type: 'date',
          required: false,
          isSystem: true,
          order: 6
        },
        {
          id: 'spares',
          name: 'spares',
          label: 'Repuestos Necesarios',
          type: 'textarea',
          required: false,
          isSystem: true,
          order: 7,
          placeholder: 'Lista de repuestos y materiales necesarios'
        },
        {
          id: 'cost',
          name: 'cost',
          label: 'Costo Estimado',
          type: 'number',
          required: false,
          isSystem: true,
          order: 8,
          validation: { min: 0 }
        }
      ],
      inventory: [
        {
          id: 'name',
          name: 'name',
          label: 'Nombre del Artículo',
          type: 'text',
          required: true,
          order: 1,
          isSystem: true
        },
        {
          id: 'category',
          name: 'category',
          label: 'Categoría',
          type: 'select',
          required: true,
          options: ['Repuestos', 'Herramientas', 'Consumibles', 'Lubricantes'],
          order: 2,
          isSystem: true
        },
        {
          id: 'quantity',
          name: 'quantity',
          label: 'Cantidad',
          type: 'number',
          required: true,
          order: 3,
          isSystem: true
        },
        {
          id: 'minStock',
          name: 'minStock',
          label: 'Stock Mínimo',
          type: 'number',
          required: true,
          order: 4,
          isSystem: true
        },
        {
          id: 'unitCost',
          name: 'unitCost',
          label: 'Costo Unitario',
          type: 'number',
          required: true,
          order: 5,
          isSystem: true
        }
      ],
      scheduling: [
        {
          id: 'taskName',
          name: 'taskName',
          label: 'Nombre de la Tarea',
          type: 'text',
          required: true,
          order: 1,
          isSystem: true
        },
        {
          id: 'frequency',
          name: 'frequency',
          label: 'Frecuencia',
          type: 'select',
          required: true,
          options: ['daily', 'weekly', 'monthly', 'quarterly', 'annually'],
          order: 2,
          isSystem: true
        },
        {
          id: 'priority',
          name: 'priority',
          label: 'Prioridad',
          type: 'select',
          required: true,
          options: ['low', 'medium', 'high', 'critical'],
          order: 3,
          isSystem: true
        },
        {
          id: 'estimatedDuration',
          name: 'estimatedDuration',
          label: 'Duración Estimada (min)',
          type: 'number',
          required: true,
          order: 4,
          isSystem: true
        }
      ],
      dashboard: [
        {
          id: 'widgetType',
          name: 'widgetType',
          label: 'Tipo de Widget',
          type: 'select',
          required: true,
          options: ['KPI', 'Chart', 'Table', 'Alert'],
          order: 1,
          isSystem: true
        },
        {
          id: 'title',
          name: 'title',
          label: 'Título',
          type: 'text',
          required: true,
          order: 2,
          isSystem: true
        }
      ]
    };
  }

  // Obtener configuración de campos
  static getFieldsConfig(): ModuleFields {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const config = JSON.parse(stored);
        // Merge con campos por defecto para asegurar compatibilidad
        const defaultFields = this.getDefaultFields();
        return {
          equipment: [...defaultFields.equipment, ...(config.equipment || [])],
          workorders: [...defaultFields.workorders, ...(config.workorders || [])],
          inventory: [...defaultFields.inventory, ...(config.inventory || [])],
          scheduling: [...defaultFields.scheduling, ...(config.scheduling || [])],
          dashboard: [...defaultFields.dashboard, ...(config.dashboard || [])]
        };
      } catch (error) {
        console.error('Error parsing fields config:', error);
        return this.getDefaultFields();
      }
    }
    return this.getDefaultFields();
  }

  // Guardar configuración de campos
  static saveFieldsConfig(config: ModuleFields): void {
    // Solo guardar campos personalizados (no del sistema)
    const customConfig = {
      equipment: config.equipment.filter(f => !f.isSystem),
      workorders: config.workorders.filter(f => !f.isSystem),
      inventory: config.inventory.filter(f => !f.isSystem),
      scheduling: config.scheduling.filter(f => !f.isSystem),
      dashboard: config.dashboard.filter(f => !f.isSystem)
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customConfig));
  }

  // Obtener campos de un módulo específico
  static getModuleFields(module: keyof ModuleFields): CustomField[] {
    const config = this.getFieldsConfig();
    return config[module].sort((a, b) => a.order - b.order);
  }

  // Obtener campos personalizados por tipo (para compatibilidad)
  static getCustomFields(type: string): CustomField[] {
    try {
      const config = this.getFieldsConfig();
      // Buscar en todos los módulos campos que coincidan con el tipo
      const allFields: CustomField[] = [];
      
      Object.values(config).forEach(moduleFields => {
        moduleFields.forEach(field => {
          if (field.type === type || 
              field.name.toLowerCase().includes(type.toLowerCase()) ||
              field.label.toLowerCase().includes(type.toLowerCase())) {
            allFields.push(field);
          }
        });
      });
      
      return allFields.filter(field => !field.isSystem);
    } catch (error) {
      console.error('Error getting custom fields:', error);
      return [];
    }
  }

  // Agregar campo personalizado
  static addCustomField(module: keyof ModuleFields, field: Omit<CustomField, 'id' | 'isSystem'>): void {
    const config = this.getFieldsConfig();
    const newField: CustomField = {
      ...field,
      id: `custom_${Date.now()}`,
      isSystem: false
    };
    config[module].push(newField);
    this.saveFieldsConfig(config);
  }

  // Actualizar campo existente
  static updateField(module: keyof ModuleFields, fieldId: string, updates: Partial<CustomField>): void {
    const config = this.getFieldsConfig();
    const fieldIndex = config[module].findIndex(f => f.id === fieldId);
    if (fieldIndex !== -1) {
      config[module][fieldIndex] = { ...config[module][fieldIndex], ...updates };
      this.saveFieldsConfig(config);
    }
  }

  // Eliminar campo personalizado
  static deleteCustomField(module: keyof ModuleFields, fieldId: string): void {
    const config = this.getFieldsConfig();
    const field = config[module].find(f => f.id === fieldId);
    if (field && !field.isSystem) {
      config[module] = config[module].filter(f => f.id !== fieldId);
      this.saveFieldsConfig(config);
    }
  }

  // Reordenar campos
  static reorderFields(module: keyof ModuleFields, fieldIds: string[]): void {
    const config = this.getFieldsConfig();
    fieldIds.forEach((fieldId, index) => {
      const field = config[module].find(f => f.id === fieldId);
      if (field) {
        field.order = index + 1;
      }
    });
    this.saveFieldsConfig(config);
  }

  // Validar valor de campo
  static validateFieldValue(field: CustomField, value: any): { isValid: boolean; message?: string } {
    if (field.required && (!value || value === '')) {
      return { isValid: false, message: `${field.label} es requerido` };
    }

    if (field.validation) {
      const { min, max, pattern, message } = field.validation;
      
      if (min !== undefined && value < min) {
        return { isValid: false, message: message || `${field.label} debe ser mayor o igual a ${min}` };
      }
      
      if (max !== undefined && value > max) {
        return { isValid: false, message: message || `${field.label} debe ser menor o igual a ${max}` };
      }
      
      if (pattern && typeof value === 'string' && !new RegExp(pattern).test(value)) {
        return { isValid: false, message: message || `${field.label} no tiene el formato correcto` };
      }
    }

    return { isValid: true };
  }

  // Generar formulario dinámico
  static generateFormData(module: keyof ModuleFields, existingData?: any): Record<string, any> {
    const fields = this.getModuleFields(module);
    const formData: Record<string, any> = {};
    
    fields.forEach(field => {
      if (existingData && existingData[field.name] !== undefined) {
        formData[field.name] = existingData[field.name];
      } else if (field.defaultValue !== undefined) {
        formData[field.name] = field.defaultValue;
      } else {
        switch (field.type) {
          case 'number':
            formData[field.name] = 0;
            break;
          case 'checkbox':
            formData[field.name] = false;
            break;
          default:
            formData[field.name] = '';
        }
      }
    });
    
    return formData;
  }
}