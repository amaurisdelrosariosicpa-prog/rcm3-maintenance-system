import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Plus, 
  Minus,
  Save,
  Trash2,
  Copy,
  Calendar,
  Clock
} from 'lucide-react';

interface WorkOrderField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'boolean';
  required: boolean;
  options?: string[];
  defaultValue?: string | number | boolean;
  visible: boolean;
  order: number;
}

interface MaintenanceRoutine {
  id: string;
  name: string;
  description: string;
  frequency: {
    type: 'horas' | 'diario' | 'semanal' | 'quincenal' | 'mensual' | 'trimestral' | 'semestral' | 'anual';
    value: number;
  };
  equipmentIds: string[];
  workOrderTemplate: Record<string, unknown>;
  isActive: boolean;
  lastExecuted?: Date;
  nextDue: Date;
}

export default function WorkOrderConfiguration() {
  const [activeTab, setActiveTab] = useState('fields');
  
  // Default work order fields
  const [workOrderFields, setWorkOrderFields] = useState<WorkOrderField[]>([
    { id: 'id', name: 'id', label: 'ID OT', type: 'text', required: true, visible: true, order: 1 },
    { id: 'equipmentId', name: 'equipmentId', label: 'ID de equipo', type: 'select', required: true, visible: true, order: 2 },
    { id: 'affectedSystem', name: 'affectedSystem', label: 'Sistema Afectado', type: 'select', required: true, visible: true, order: 3 },
    { id: 'type', name: 'type', label: 'Tipo OT', type: 'select', required: true, options: ['Preventive', 'Corrective', 'Predictive', 'Emergency'], visible: true, order: 4 },
    { id: 'subType', name: 'subType', label: 'Sub tipo', type: 'text', required: false, visible: true, order: 5 },
    { id: 'priority', name: 'priority', label: 'Prioridad', type: 'select', required: true, options: ['Low', 'Medium', 'High', 'Critical'], visible: true, order: 6 },
    { id: 'requestDate', name: 'requestDate', label: 'Fecha solicitud', type: 'date', required: true, visible: true, order: 7 },
    { id: 'scheduledDate', name: 'scheduledDate', label: 'Fecha programada', type: 'date', required: false, visible: true, order: 8 },
    { id: 'startDate', name: 'startDate', label: 'Fecha inicio', type: 'date', required: false, visible: true, order: 9 },
    { id: 'endDate', name: 'endDate', label: 'Fecha fin', type: 'date', required: false, visible: true, order: 10 },
    { id: 'plannedDuration', name: 'plannedDuration', label: 'Duración plan. (h)', type: 'number', required: true, visible: true, order: 11 },
    { id: 'actualDuration', name: 'actualDuration', label: 'Duración Real (h)', type: 'number', required: false, visible: true, order: 12 },
    { id: 'description', name: 'description', label: 'Descripción', type: 'textarea', required: true, visible: true, order: 13 },
    { id: 'problem', name: 'problem', label: 'Problema', type: 'textarea', required: false, visible: true, order: 14 },
    { id: 'rootCause', name: 'rootCause', label: 'Causa Raíz', type: 'textarea', required: false, visible: true, order: 15 },
    { id: 'solution', name: 'solution', label: 'Solución', type: 'textarea', required: false, visible: true, order: 16 },
    { id: 'laborHours', name: 'laborHours', label: 'H. Hombre', type: 'number', required: false, visible: true, order: 17 },
    { id: 'laborCost', name: 'laborCost', label: 'Costo M. Obra', type: 'number', required: false, visible: true, order: 18 },
    { id: 'sparesCost', name: 'sparesCost', label: 'Costo Rep.', type: 'number', required: false, visible: true, order: 19 },
    { id: 'externalCost', name: 'externalCost', label: 'Costo Ext.', type: 'number', required: false, visible: true, order: 20 },
    { id: 'totalMaintenanceCost', name: 'totalMaintenanceCost', label: 'Costo Total', type: 'number', required: false, visible: true, order: 21 },
    { id: 'technician', name: 'technician', label: 'Técnico', type: 'select', required: true, visible: true, order: 22 },
    { id: 'supervisor', name: 'supervisor', label: 'Supervisor', type: 'select', required: false, visible: true, order: 23 },
    { id: 'shift', name: 'shift', label: 'Turno', type: 'select', required: true, options: ['Day', 'Night', 'Rotating'], visible: true, order: 24 },
    { id: 'specialty', name: 'specialty', label: 'Especialidad', type: 'text', required: true, visible: true, order: 25 },
    { id: 'status', name: 'status', label: 'Estado', type: 'select', required: true, options: ['Draft', 'Open', 'In Progress', 'Completed', 'Cancelled'], visible: true, order: 26 },
    { id: 'progress', name: 'progress', label: '% Avance', type: 'number', required: false, visible: true, order: 27 },
    { id: 'approval', name: 'approval', label: 'Aprobación', type: 'select', required: false, options: ['Pending', 'Approved', 'Rejected'], visible: true, order: 28 },
    { id: 'workSatisfactory', name: 'workSatisfactory', label: 'Trabajo Satisfactorio', type: 'boolean', required: false, visible: true, order: 29 },
    { id: 'requiresFollowup', name: 'requiresFollowup', label: 'Req. Seguimiento', type: 'boolean', required: false, visible: true, order: 30 },
    { id: 'followupDate', name: 'followupDate', label: 'Fecha Seg.', type: 'date', required: false, visible: true, order: 31 },
    { id: 'conditionBefore', name: 'conditionBefore', label: 'Condición Antes', type: 'textarea', required: false, visible: true, order: 32 },
    { id: 'conditionAfter', name: 'conditionAfter', label: 'Condición Desp.', type: 'textarea', required: false, visible: true, order: 33 },
    { id: 'observations', name: 'observations', label: 'Observaciones', type: 'textarea', required: false, visible: true, order: 34 }
  ]);

  const [maintenanceRoutines, setMaintenanceRoutines] = useState<MaintenanceRoutine[]>([]);
  const [newField, setNewField] = useState<Partial<WorkOrderField>>({
    type: 'text',
    required: false,
    visible: true
  });
  const [newRoutine, setNewRoutine] = useState<Partial<MaintenanceRoutine>>({
    frequency: { type: 'mensual', value: 1 },
    equipmentIds: [],
    isActive: true
  });

  const handleAddField = () => {
    if (!newField.name || !newField.label) return;

    const field: WorkOrderField = {
      id: `custom_${Date.now()}`,
      name: newField.name!,
      label: newField.label!,
      type: newField.type as WorkOrderField['type'],
      required: newField.required || false,
      options: newField.options,
      visible: true,
      order: workOrderFields.length + 1
    };

    setWorkOrderFields([...workOrderFields, field]);
    setNewField({ type: 'text', required: false, visible: true });
  };

  const handleRemoveField = (fieldId: string) => {
    setWorkOrderFields(workOrderFields.filter(f => f.id !== fieldId));
  };

  const handleToggleFieldVisibility = (fieldId: string) => {
    setWorkOrderFields(workOrderFields.map(f => 
      f.id === fieldId ? { ...f, visible: !f.visible } : f
    ));
  };

  const handleAddRoutine = () => {
    if (!newRoutine.name || !newRoutine.description) return;

    const routine: MaintenanceRoutine = {
      id: `routine_${Date.now()}`,
      name: newRoutine.name!,
      description: newRoutine.description!,
      frequency: newRoutine.frequency!,
      equipmentIds: newRoutine.equipmentIds || [],
      workOrderTemplate: {},
      isActive: true,
      nextDue: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
    };

    setMaintenanceRoutines([...maintenanceRoutines, routine]);
    setNewRoutine({
      frequency: { type: 'mensual', value: 1 },
      equipmentIds: [],
      isActive: true
    });
  };

  const frequencyOptions = [
    { value: 'horas', label: 'Por Horas' },
    { value: 'diario', label: 'Diario' },
    { value: 'semanal', label: 'Semanal' },
    { value: 'quincenal', label: 'Quincenal' },
    { value: 'mensual', label: 'Mensual' },
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configuración de Órdenes de Trabajo</h2>
          <p className="text-muted-foreground">Personaliza campos y rutinas de mantenimiento</p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Guardar Configuración
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="fields">Campos de OT</TabsTrigger>
          <TabsTrigger value="routines">Rutinas de Mantenimiento</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agregar Nuevo Campo</CardTitle>
              <CardDescription>Personaliza los campos de las órdenes de trabajo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Nombre del Campo</Label>
                  <Input 
                    value={newField.name || ''} 
                    onChange={(e) => setNewField({...newField, name: e.target.value})}
                    placeholder="ej: customField"
                  />
                </div>
                <div>
                  <Label>Etiqueta</Label>
                  <Input 
                    value={newField.label || ''} 
                    onChange={(e) => setNewField({...newField, label: e.target.value})}
                    placeholder="ej: Campo Personalizado"
                  />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={newField.type} onValueChange={(value) => 
                    setNewField({...newField, type: value as WorkOrderField['type']})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="date">Fecha</SelectItem>
                      <SelectItem value="select">Lista</SelectItem>
                      <SelectItem value="textarea">Área de Texto</SelectItem>
                      <SelectItem value="boolean">Sí/No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddField} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>
              
              {newField.type === 'select' && (
                <div>
                  <Label>Opciones (separadas por coma)</Label>
                  <Input 
                    value={newField.options?.join(', ') || ''} 
                    onChange={(e) => setNewField({
                      ...newField, 
                      options: e.target.value.split(',').map(s => s.trim())
                    })}
                    placeholder="Opción 1, Opción 2, Opción 3"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campos Configurados</CardTitle>
              <CardDescription>Gestiona la visibilidad y orden de los campos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {workOrderFields
                  .sort((a, b) => a.order - b.order)
                  .map(field => (
                    <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Switch 
                          checked={field.visible}
                          onCheckedChange={() => handleToggleFieldVisibility(field.id)}
                        />
                        <div>
                          <p className="font-medium">{field.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {field.name} - {field.type} {field.required && '(Requerido)'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant={field.visible ? 'default' : 'secondary'}>
                          {field.visible ? 'Visible' : 'Oculto'}
                        </Badge>
                        {field.id.startsWith('custom_') && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRemoveField(field.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nueva Rutina de Mantenimiento</CardTitle>
              <CardDescription>Crea rutinas automáticas para generar órdenes de trabajo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre de la Rutina</Label>
                  <Input 
                    value={newRoutine.name || ''} 
                    onChange={(e) => setNewRoutine({...newRoutine, name: e.target.value})}
                    placeholder="ej: Mantenimiento Mensual Bombas"
                  />
                </div>
                <div>
                  <Label>Frecuencia</Label>
                  <div className="flex space-x-2">
                    <Input 
                      type="number" 
                      value={newRoutine.frequency?.value || 1}
                      onChange={(e) => setNewRoutine({
                        ...newRoutine, 
                        frequency: { 
                          ...newRoutine.frequency!, 
                          value: parseInt(e.target.value) 
                        }
                      })}
                      className="w-20"
                    />
                    <Select 
                      value={newRoutine.frequency?.type} 
                      onValueChange={(value) => setNewRoutine({
                        ...newRoutine, 
                        frequency: { 
                          ...newRoutine.frequency!, 
                          type: value as MaintenanceRoutine['frequency']['type']
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencyOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Descripción</Label>
                <Textarea 
                  value={newRoutine.description || ''} 
                  onChange={(e) => setNewRoutine({...newRoutine, description: e.target.value})}
                  placeholder="Descripción de la rutina de mantenimiento"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleAddRoutine}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Rutina
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rutinas Configuradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {maintenanceRoutines.map(routine => (
                  <div key={routine.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{routine.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Cada {routine.frequency.value} {routine.frequency.type}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={routine.isActive ? 'default' : 'secondary'}>
                        {routine.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {maintenanceRoutines.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No hay rutinas configuradas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Órdenes de Trabajo</CardTitle>
              <CardDescription>Crea plantillas predefinidas para diferentes tipos de mantenimiento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Funcionalidad de plantillas en desarrollo</p>
                <Button className="mt-4">
                  <Copy className="h-4 w-4 mr-2" />
                  Crear Plantilla
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}