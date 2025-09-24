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
  Calendar, 
  Clock, 
  Plus, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Play,
  Pause
} from 'lucide-react';
import { Equipment, WorkOrder } from '@/lib/rcm3-data';
import { MaintenanceSchedule, sampleSchedules, sampleTechnicians } from '@/lib/scheduling-data';
import { formatDate } from '@/lib/maintenance-utils';

interface MaintenanceSchedulingProps {
  equipment: Equipment[];
  workOrders: WorkOrder[];
  onCreateWorkOrder: (workOrder: Omit<WorkOrder, 'id'>) => void;
}

export default function MaintenanceScheduling({ equipment, workOrders, onCreateWorkOrder }: MaintenanceSchedulingProps) {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>(sampleSchedules);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState<Partial<MaintenanceSchedule>>({
    type: 'Preventive',
    priority: 'Medium',
    frequency: { type: 'weeks', value: 1 },
    estimatedDuration: 1,
    requiredSkills: [],
    requiredParts: [],
    isActive: true
  });

  const generateWorkOrdersFromSchedules = () => {
    const now = new Date();
    let generatedCount = 0;

    schedules.forEach(schedule => {
      if (schedule.isActive && schedule.nextDue <= now) {
        const equipmentItem = equipment.find(eq => eq.id === schedule.equipmentId);
        if (equipmentItem) {
          const newWorkOrder: Omit<WorkOrder, 'id'> = {
            equipmentId: schedule.equipmentId,
            type: schedule.type as WorkOrder['type'],
            description: schedule.description,
            priority: schedule.priority as WorkOrder['priority'],
            status: 'Draft',
            createdDate: now,
            scheduledDate: schedule.nextDue,
            technician: '',
            cost: 0,
            instructions: schedule.instructions
          };

          onCreateWorkOrder(newWorkOrder);
          generatedCount++;

          // Update next due date
          const updatedSchedule = { ...schedule };
          const nextDue = new Date(schedule.nextDue);
          
          switch (schedule.frequency.type) {
            case 'hours':
              // For hours, we need to consider equipment operational hours
              // For now, we'll approximate with days
              nextDue.setDate(nextDue.getDate() + Math.ceil(schedule.frequency.value / 8));
              break;
            case 'days':
              nextDue.setDate(nextDue.getDate() + schedule.frequency.value);
              break;
            case 'weeks':
              nextDue.setDate(nextDue.getDate() + (schedule.frequency.value * 7));
              break;
            case 'months':
              nextDue.setMonth(nextDue.getMonth() + schedule.frequency.value);
              break;
            case 'years':
              nextDue.setFullYear(nextDue.getFullYear() + schedule.frequency.value);
              break;
          }
          
          updatedSchedule.nextDue = nextDue;
          updatedSchedule.lastExecuted = now;
          
          setSchedules(prev => prev.map(s => s.id === schedule.id ? updatedSchedule : s));
        }
      }
    });

    return generatedCount;
  };

  const handleCreateSchedule = () => {
    if (!newSchedule.equipmentId || !newSchedule.title || !newSchedule.description) {
      return;
    }

    const schedule: MaintenanceSchedule = {
      id: `sch-${Date.now()}`,
      equipmentId: newSchedule.equipmentId!,
      title: newSchedule.title!,
      description: newSchedule.description!,
      type: newSchedule.type as MaintenanceSchedule['type'],
      priority: newSchedule.priority as MaintenanceSchedule['priority'],
      frequency: newSchedule.frequency!,
      estimatedDuration: newSchedule.estimatedDuration || 1,
      requiredSkills: newSchedule.requiredSkills || [],
      requiredParts: newSchedule.requiredParts || [],
      instructions: newSchedule.instructions || '',
      isActive: newSchedule.isActive || true,
      nextDue: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow by default
      createdDate: new Date(),
      createdBy: 'current-user'
    };

    setSchedules([...schedules, schedule]);
    setNewSchedule({
      type: 'Preventive',
      priority: 'Medium',
      frequency: { type: 'weeks', value: 1 },
      estimatedDuration: 1,
      requiredSkills: [],
      requiredParts: [],
      isActive: true
    });
    setShowCreateForm(false);
  };

  const toggleScheduleStatus = (scheduleId: string) => {
    setSchedules(prev => prev.map(s => 
      s.id === scheduleId ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const getDueStatus = (nextDue: Date) => {
    const now = new Date();
    const diffDays = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'overdue', color: 'bg-red-500', text: 'Vencida' };
    if (diffDays === 0) return { status: 'due', color: 'bg-orange-500', text: 'Hoy' };
    if (diffDays <= 3) return { status: 'soon', color: 'bg-yellow-500', text: `${diffDays}d` };
    return { status: 'future', color: 'bg-green-500', text: `${diffDays}d` };
  };

  const overdueSchedules = schedules.filter(s => s.isActive && s.nextDue <= new Date());
  const activeSchedules = schedules.filter(s => s.isActive);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Programación Automática</h2>
          <p className="text-muted-foreground">Gestiona horarios de mantenimiento y genera órdenes automáticamente</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => {
            const count = generateWorkOrdersFromSchedules();
            alert(`Se generaron ${count} órdenes de trabajo`);
          }}>
            <Play className="h-4 w-4 mr-2" />
            Generar Órdenes Pendientes
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Programación
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{activeSchedules.length}</p>
                <p className="text-sm text-muted-foreground">Programaciones Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{overdueSchedules.length}</p>
                <p className="text-sm text-muted-foreground">Vencidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {schedules.reduce((sum, s) => sum + s.estimatedDuration, 0)}h
                </p>
                <p className="text-sm text-muted-foreground">Horas Planificadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{sampleTechnicians.length}</p>
                <p className="text-sm text-muted-foreground">Técnicos Disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {overdueSchedules.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atención:</strong> Hay {overdueSchedules.length} programaciones vencidas que requieren generar órdenes de trabajo.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="schedules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedules">Programaciones</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Nueva Programación de Mantenimiento</CardTitle>
                <CardDescription>Crea una nueva programación automática</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="equipment">Equipo</Label>
                    <Select value={newSchedule.equipmentId} onValueChange={(value) => 
                      setNewSchedule({...newSchedule, equipmentId: value})
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar equipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipment.map(eq => (
                          <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={newSchedule.type} onValueChange={(value) => 
                      setNewSchedule({...newSchedule, type: value as MaintenanceSchedule['type']})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Preventive">Preventivo</SelectItem>
                        <SelectItem value="Predictive">Predictivo</SelectItem>
                        <SelectItem value="Inspection">Inspección</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input 
                      value={newSchedule.title || ''} 
                      onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                      placeholder="Ej: Cambio de aceite mensual"
                    />
                  </div>

                  <div>
                    <Label htmlFor="priority">Prioridad</Label>
                    <Select value={newSchedule.priority} onValueChange={(value) => 
                      setNewSchedule({...newSchedule, priority: value as MaintenanceSchedule['priority']})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Baja</SelectItem>
                        <SelectItem value="Medium">Media</SelectItem>
                        <SelectItem value="High">Alta</SelectItem>
                        <SelectItem value="Critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="frequency-type">Frecuencia</Label>
                    <div className="flex space-x-2">
                      <Input 
                        type="number" 
                        value={newSchedule.frequency?.value || 1}
                        onChange={(e) => setNewSchedule({
                          ...newSchedule, 
                          frequency: { 
                            ...newSchedule.frequency!, 
                            value: parseInt(e.target.value) 
                          }
                        })}
                        className="w-20"
                      />
                      <Select 
                        value={newSchedule.frequency?.type} 
                        onValueChange={(value) => setNewSchedule({
                          ...newSchedule, 
                          frequency: { 
                            ...newSchedule.frequency!, 
                            type: value as MaintenanceSchedule['frequency']['type']
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">Horas</SelectItem>
                          <SelectItem value="days">Días</SelectItem>
                          <SelectItem value="weeks">Semanas</SelectItem>
                          <SelectItem value="months">Meses</SelectItem>
                          <SelectItem value="years">Años</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duración Estimada (horas)</Label>
                    <Input 
                      type="number" 
                      value={newSchedule.estimatedDuration || 1}
                      onChange={(e) => setNewSchedule({...newSchedule, estimatedDuration: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea 
                    value={newSchedule.description || ''} 
                    onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                    placeholder="Descripción detallada del mantenimiento"
                  />
                </div>

                <div>
                  <Label htmlFor="instructions">Instrucciones</Label>
                  <Textarea 
                    value={newSchedule.instructions || ''} 
                    onChange={(e) => setNewSchedule({...newSchedule, instructions: e.target.value})}
                    placeholder="Instrucciones paso a paso"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateSchedule}>
                    Crear Programación
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {schedules.map(schedule => {
              const equipmentItem = equipment.find(eq => eq.id === schedule.equipmentId);
              const dueStatus = getDueStatus(schedule.nextDue);
              
              return (
                <Card key={schedule.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold">{schedule.title}</h4>
                          <Badge className={dueStatus.color}>
                            {dueStatus.text}
                          </Badge>
                          <Badge variant="outline">
                            {schedule.type}
                          </Badge>
                          <Badge variant="outline">
                            {schedule.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Equipo:</strong> {equipmentItem?.name || 'N/A'}
                        </p>
                        
                        <p className="text-sm mb-2">{schedule.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Frecuencia:</span>
                            <p>Cada {schedule.frequency.value} {schedule.frequency.type}</p>
                          </div>
                          <div>
                            <span className="font-medium">Duración:</span>
                            <p>{schedule.estimatedDuration}h</p>
                          </div>
                          <div>
                            <span className="font-medium">Próxima:</span>
                            <p>{formatDate(schedule.nextDue)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Última:</span>
                            <p>{schedule.lastExecuted ? formatDate(schedule.lastExecuted) : 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={schedule.isActive}
                          onCheckedChange={() => toggleScheduleStatus(schedule.id)}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const config = {
                              scheduleId: schedule.id,
                              title: schedule.title,
                              equipmentId: schedule.equipmentId,
                              type: schedule.type,
                              priority: schedule.priority,
                              frequency: schedule.frequency,
                              estimatedDuration: schedule.estimatedDuration,
                              requiredSkills: schedule.requiredSkills,
                              requiredParts: schedule.requiredParts,
                              instructions: schedule.instructions,
                              isActive: schedule.isActive,
                              nextDue: schedule.nextDue,
                              lastExecuted: schedule.lastExecuted,
                              configuredAt: new Date().toISOString()
                            };
                            
                            const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `configuracion-rutina-${schedule.title.replace(/\s+/g, '-').toLowerCase()}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                            
                            alert(`Configuración de rutina "${schedule.title}" exportada exitosamente.`);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vista de Calendario</CardTitle>
              <CardDescription>Próximas programaciones por fecha</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schedules
                  .filter(s => s.isActive)
                  .sort((a, b) => a.nextDue.getTime() - b.nextDue.getTime())
                  .slice(0, 10)
                  .map(schedule => {
                    const equipmentItem = equipment.find(eq => eq.id === schedule.equipmentId);
                    const dueStatus = getDueStatus(schedule.nextDue);
                    
                    return (
                      <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{schedule.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {equipmentItem?.name} - {schedule.estimatedDuration}h
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={dueStatus.color}>
                            {formatDate(schedule.nextDue)}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {schedule.type}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}