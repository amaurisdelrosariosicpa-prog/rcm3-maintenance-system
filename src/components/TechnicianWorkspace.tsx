import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Clock, 
  Plus, 
  CheckCircle,
  AlertTriangle,
  FileText,
  Settings,
  Play,
  Pause,
  Save
} from 'lucide-react';
import { Equipment, WorkOrder } from '@/lib/rcm3-data';
import { Technician, sampleTechnicians } from '@/lib/scheduling-data';
import { formatDate, formatCurrency } from '@/lib/maintenance-utils';

interface TechnicianWorkspaceProps {
  equipment: Equipment[];
  workOrders: WorkOrder[];
  onUpdateWorkOrder: (workOrder: WorkOrder) => void;
  onCreateWorkOrder: (workOrder: Omit<WorkOrder, 'id'>) => void;
}

export default function TechnicianWorkspace({ 
  equipment, 
  workOrders, 
  onUpdateWorkOrder, 
  onCreateWorkOrder 
}: TechnicianWorkspaceProps) {
  const [currentTechnician, setCurrentTechnician] = useState<Technician>(sampleTechnicians[0]);
  const [selectedTab, setSelectedTab] = useState('available');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkOrder, setNewWorkOrder] = useState<Partial<WorkOrder>>({
    type: 'Corrective',
    priority: 'Medium',
    status: 'Draft'
  });

  // Filter work orders based on technician and status
  const availableOrders = workOrders.filter(wo => 
    wo.status === 'Draft' && (wo.technician === '' || wo.technician === currentTechnician.name)
  );
  
  const myOrders = workOrders.filter(wo => 
    wo.technician === currentTechnician.name && ['Open', 'In Progress'].includes(wo.status)
  );
  
  const completedOrders = workOrders.filter(wo => 
    wo.technician === currentTechnician.name && wo.status === 'Completed'
  );

  const handleTakeOrder = (workOrder: WorkOrder) => {
    const updatedOrder = {
      ...workOrder,
      technician: currentTechnician.name,
      status: 'Open' as WorkOrder['status']
    };
    onUpdateWorkOrder(updatedOrder);
  };

  const handleStartOrder = (workOrder: WorkOrder) => {
    const updatedOrder = {
      ...workOrder,
      status: 'In Progress' as WorkOrder['status']
    };
    onUpdateWorkOrder(updatedOrder);
  };

  const handleCompleteOrder = (workOrder: WorkOrder) => {
    const updatedOrder = {
      ...workOrder,
      status: 'Completed' as WorkOrder['status'],
      completedDate: new Date()
    };
    onUpdateWorkOrder(updatedOrder);
  };

  const handleCreateWorkOrder = () => {
    if (!newWorkOrder.equipmentId || !newWorkOrder.description) {
      return;
    }

    const workOrder: Omit<WorkOrder, 'id'> = {
      equipmentId: newWorkOrder.equipmentId!,
      type: newWorkOrder.type as WorkOrder['type'],
      description: newWorkOrder.description!,
      priority: newWorkOrder.priority as WorkOrder['priority'],
      status: 'Draft',
      createdDate: new Date(),
      technician: currentTechnician.name,
      cost: newWorkOrder.cost || 0,
      rootCause: newWorkOrder.rootCause,
      preventiveActions: newWorkOrder.preventiveActions
    };

    onCreateWorkOrder(workOrder);
    setNewWorkOrder({
      type: 'Corrective',
      priority: 'Medium',
      status: 'Draft'
    });
    setShowCreateForm(false);
  };

  const getPriorityColor = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: WorkOrder['type']) => {
    switch (type) {
      case 'Emergency': return 'bg-red-500';
      case 'Corrective': return 'bg-orange-500';
      case 'Preventive': return 'bg-blue-500';
      case 'Predictive': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mi Espacio de Trabajo</h2>
          <p className="text-muted-foreground">Gestiona tus órdenes de trabajo y actividades</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={currentTechnician.id} onValueChange={(value) => {
            const tech = sampleTechnicians.find(t => t.id === value);
            if (tech) setCurrentTechnician(tech);
          }}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sampleTechnicians.map(tech => (
                <SelectItem key={tech.id} value={tech.id}>
                  {tech.name} - {tech.department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Orden
          </Button>
        </div>
      </div>

      {/* Technician Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <User className="h-12 w-12 text-blue-500" />
              <div>
                <h3 className="font-semibold">{currentTechnician.name}</h3>
                <p className="text-sm text-muted-foreground">{currentTechnician.department}</p>
                <div className="flex space-x-2 mt-1">
                  {currentTechnician.skills.map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Carga de Trabajo</p>
              <p className="text-2xl font-bold">
                {currentTechnician.workload}/{currentTechnician.maxWorkload}h
              </p>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(currentTechnician.workload / currentTechnician.maxWorkload) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{availableOrders.length}</p>
                <p className="text-sm text-muted-foreground">Disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{myOrders.length}</p>
                <p className="text-sm text-muted-foreground">Mis Órdenes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Play className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {myOrders.filter(wo => wo.status === 'In Progress').length}
                </p>
                <p className="text-sm text-muted-foreground">En Progreso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{completedOrders.length}</p>
                <p className="text-sm text-muted-foreground">Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Disponibles ({availableOrders.length})</TabsTrigger>
          <TabsTrigger value="my-work">Mi Trabajo ({myOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completadas ({completedOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Nueva Orden de Trabajo</CardTitle>
                <CardDescription>Crea una nueva orden de trabajo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="equipment">Equipo</Label>
                    <Select value={newWorkOrder.equipmentId} onValueChange={(value) => 
                      setNewWorkOrder({...newWorkOrder, equipmentId: value})
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
                    <Select value={newWorkOrder.type} onValueChange={(value) => 
                      setNewWorkOrder({...newWorkOrder, type: value as WorkOrder['type']})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Corrective">Correctivo</SelectItem>
                        <SelectItem value="Preventive">Preventivo</SelectItem>
                        <SelectItem value="Predictive">Predictivo</SelectItem>
                        <SelectItem value="Emergency">Emergencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Prioridad</Label>
                    <Select value={newWorkOrder.priority} onValueChange={(value) => 
                      setNewWorkOrder({...newWorkOrder, priority: value as WorkOrder['priority']})
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
                    <Label htmlFor="cost">Costo Estimado</Label>
                    <Input 
                      type="number" 
                      value={newWorkOrder.cost || 0}
                      onChange={(e) => setNewWorkOrder({...newWorkOrder, cost: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea 
                    value={newWorkOrder.description || ''} 
                    onChange={(e) => setNewWorkOrder({...newWorkOrder, description: e.target.value})}
                    placeholder="Descripción del problema o trabajo a realizar"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateWorkOrder}>
                    Crear Orden
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {availableOrders.map(workOrder => {
              const equipmentItem = equipment.find(eq => eq.id === workOrder.equipmentId);
              
              return (
                <Card key={workOrder.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold">
                            {equipmentItem?.name || 'Equipo N/A'}
                          </h4>
                          <Badge className={getPriorityColor(workOrder.priority)}>
                            {workOrder.priority}
                          </Badge>
                          <Badge className={getTypeColor(workOrder.type)}>
                            {workOrder.type}
                          </Badge>
                        </div>
                        
                        <p className="text-sm mb-2">{workOrder.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Creada:</span>
                            <p>{formatDate(workOrder.createdDate)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Costo:</span>
                            <p>{formatCurrency(workOrder.cost)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Estado:</span>
                            <p>{workOrder.status}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Button onClick={() => handleTakeOrder(workOrder)}>
                        Tomar Orden
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {availableOrders.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No hay órdenes disponibles</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-work" className="space-y-4">
          <div className="space-y-4">
            {myOrders.map(workOrder => {
              const equipmentItem = equipment.find(eq => eq.id === workOrder.equipmentId);
              
              return (
                <Card key={workOrder.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold">
                            {equipmentItem?.name || 'Equipo N/A'}
                          </h4>
                          <Badge className={getPriorityColor(workOrder.priority)}>
                            {workOrder.priority}
                          </Badge>
                          <Badge className={getTypeColor(workOrder.type)}>
                            {workOrder.type}
                          </Badge>
                          <Badge variant="outline">
                            {workOrder.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm mb-2">{workOrder.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Creada:</span>
                            <p>{formatDate(workOrder.createdDate)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Programada:</span>
                            <p>{workOrder.scheduledDate ? formatDate(workOrder.scheduledDate) : 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Costo:</span>
                            <p>{formatCurrency(workOrder.cost)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Estado:</span>
                            <p>{workOrder.status}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {workOrder.status === 'Open' && (
                          <Button onClick={() => handleStartOrder(workOrder)}>
                            <Play className="h-4 w-4 mr-2" />
                            Iniciar
                          </Button>
                        )}
                        {workOrder.status === 'In Progress' && (
                          <Button onClick={() => handleCompleteOrder(workOrder)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Completar
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {myOrders.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No tienes órdenes asignadas</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="space-y-4">
            {completedOrders.slice(0, 10).map(workOrder => {
              const equipmentItem = equipment.find(eq => eq.id === workOrder.equipmentId);
              
              return (
                <Card key={workOrder.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold">
                            {equipmentItem?.name || 'Equipo N/A'}
                          </h4>
                          <Badge className={getTypeColor(workOrder.type)}>
                            {workOrder.type}
                          </Badge>
                          <Badge className="bg-green-500">
                            Completada
                          </Badge>
                        </div>
                        
                        <p className="text-sm mb-2">{workOrder.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Creada:</span>
                            <p>{formatDate(workOrder.createdDate)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Completada:</span>
                            <p>{workOrder.completedDate ? formatDate(workOrder.completedDate) : 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Costo:</span>
                            <p>{formatCurrency(workOrder.cost)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Duración:</span>
                            <p>
                              {workOrder.completedDate && workOrder.createdDate
                                ? `${Math.ceil((workOrder.completedDate.getTime() - workOrder.createdDate.getTime()) / (1000 * 60 * 60 * 24))}d`
                                : 'N/A'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {completedOrders.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No tienes órdenes completadas</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}