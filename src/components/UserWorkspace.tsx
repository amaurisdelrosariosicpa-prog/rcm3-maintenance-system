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
  Plus, 
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Send
} from 'lucide-react';
import { Equipment, WorkOrder } from '@/lib/rcm3-data';

interface UserWorkspaceProps {
  equipment: Equipment[];
  workOrders: WorkOrder[];
  onCreateWorkOrder: (workOrder: Omit<WorkOrder, 'id'>) => void;
  onUpdateWorkOrder: (workOrder: WorkOrder) => void;
  currentUser: {
    id: string;
    name: string;
    role: 'Operador' | 'Supervisor' | 'Técnico' | 'Administrador';
    department: string;
  };
}

export default function UserWorkspace({ 
  equipment, 
  workOrders, 
  onCreateWorkOrder, 
  onUpdateWorkOrder,
  currentUser 
}: UserWorkspaceProps) {
  const [activeTab, setActiveTab] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showRequestForm, setShowRequestForm] = useState(false);
  
  const [newRequest, setNewRequest] = useState<Partial<WorkOrder>>({
    type: 'Corrective',
    priority: 'Medium',
    status: 'Draft'
  });

  // Filter work orders based on user role and permissions
  const availableOrders = workOrders.filter(wo => 
    wo.status === 'Open' && 
    (currentUser.role === 'Técnico' || currentUser.role === 'Supervisor')
  );

  const myOrders = workOrders.filter(wo => 
    wo.technician === currentUser.name
  );

  const myRequests = workOrders.filter(wo => 
    wo.technician === currentUser.name || wo.status === 'Draft'
  );

  const filteredOrders = (orders: WorkOrder[]) => {
    return orders.filter(wo => {
      const matchesSearch = wo.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  };

  const handleTakeOrder = (workOrder: WorkOrder) => {
    const updatedOrder = {
      ...workOrder,
      technician: currentUser.name,
      status: 'In Progress' as WorkOrder['status']
    };
    onUpdateWorkOrder(updatedOrder);
  };

  const handleCreateRequest = () => {
    if (!newRequest.equipmentId || !newRequest.description) {
      return;
    }

    const request: Omit<WorkOrder, 'id'> = {
      equipmentId: newRequest.equipmentId!,
      affectedSystem: newRequest.affectedSystem || 'General',
      type: newRequest.type as WorkOrder['type'],
      subType: newRequest.subType || '',
      priority: newRequest.priority as WorkOrder['priority'],
      requestDate: new Date(),
      plannedDuration: newRequest.plannedDuration || 1,
      description: newRequest.description!,
      problem: newRequest.problem,
      laborHours: 0,
      laborCost: 0,
      sparesCost: 0,
      externalCost: 0,
      totalMaintenanceCost: 0,
      technician: '',
      supervisor: currentUser.name,
      shift: 'Day',
      specialty: currentUser.department,
      status: 'Draft',
      progress: 0,
      approval: 'Pending',
      workSatisfactory: false,
      requiresFollowup: false,
      conditionBefore: newRequest.conditionBefore || ''
    };

    onCreateWorkOrder(request);
    setNewRequest({
      type: 'Corrective',
      priority: 'Medium',
      status: 'Draft'
    });
    setShowRequestForm(false);
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

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'Completed': return 'bg-green-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Open': return 'bg-purple-500';
      case 'Draft': return 'bg-gray-500';
      case 'Cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mi Espacio de Usuario</h2>
          <p className="text-muted-foreground">
            {currentUser.name} - {currentUser.role} - {currentUser.department}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowRequestForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Solicitar Reparación
          </Button>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{availableOrders.length}</p>
                <p className="text-sm text-muted-foreground">Órdenes Disponibles</p>
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
              <Send className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{myRequests.length}</p>
                <p className="text-sm text-muted-foreground">Mis Solicitudes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {myOrders.filter(wo => wo.status === 'Completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar órdenes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las prioridades</SelectItem>
            <SelectItem value="Critical">Crítica</SelectItem>
            <SelectItem value="High">Alta</SelectItem>
            <SelectItem value="Medium">Media</SelectItem>
            <SelectItem value="Low">Baja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Request Form */}
      {showRequestForm && (
        <Card>
          <CardHeader>
            <CardTitle>Solicitar Reparación</CardTitle>
            <CardDescription>Crea una nueva solicitud de mantenimiento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Equipo</Label>
                <Select value={newRequest.equipmentId} onValueChange={(value) => 
                  setNewRequest({...newRequest, equipmentId: value})
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
                <Label>Prioridad</Label>
                <Select value={newRequest.priority} onValueChange={(value) => 
                  setNewRequest({...newRequest, priority: value as WorkOrder['priority']})
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
                <Label>Tipo de Trabajo</Label>
                <Select value={newRequest.type} onValueChange={(value) => 
                  setNewRequest({...newRequest, type: value as WorkOrder['type']})
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Corrective">Correctivo</SelectItem>
                    <SelectItem value="Preventive">Preventivo</SelectItem>
                    <SelectItem value="Emergency">Emergencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Descripción del Problema</Label>
              <Textarea 
                value={newRequest.description || ''} 
                onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                placeholder="Describe detalladamente el problema encontrado"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowRequestForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateRequest}>
                <Send className="h-4 w-4 mr-2" />
                Enviar Solicitud
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">
            Disponibles ({availableOrders.length})
          </TabsTrigger>
          <TabsTrigger value="my-orders">
            Mis Órdenes ({myOrders.length})
          </TabsTrigger>
          <TabsTrigger value="my-requests">
            Mis Solicitudes ({myRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="space-y-4">
            {filteredOrders(availableOrders).map(workOrder => {
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
                          <Badge variant="outline">
                            {workOrder.type}
                          </Badge>
                          <Badge className={getStatusColor(workOrder.status)}>
                            {workOrder.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm mb-2">{workOrder.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Creada:</span>
                            <p>{workOrder.requestDate.toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="font-medium">Duración:</span>
                            <p>{workOrder.plannedDuration}h</p>
                          </div>
                          <div>
                            <span className="font-medium">Técnico:</span>
                            <p>{workOrder.technician || 'Sin asignar'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Costo:</span>
                            <p>${workOrder.totalMaintenanceCost}</p>
                          </div>
                        </div>
                      </div>
                      
                      {(currentUser.role === 'Técnico' || currentUser.role === 'Supervisor') && (
                        <Button onClick={() => handleTakeOrder(workOrder)}>
                          Tomar Orden
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredOrders(availableOrders).length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No hay órdenes disponibles</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-orders" className="space-y-4">
          <div className="space-y-4">
            {filteredOrders(myOrders).map(workOrder => {
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
                          <Badge className={getStatusColor(workOrder.status)}>
                            {workOrder.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm mb-2">{workOrder.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Progreso:</span>
                            <p>{workOrder.progress}%</p>
                          </div>
                          <div>
                            <span className="font-medium">Inicio:</span>
                            <p>{workOrder.startDate?.toLocaleDateString() || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Duración:</span>
                            <p>{workOrder.actualDuration || workOrder.plannedDuration}h</p>
                          </div>
                          <div>
                            <span className="font-medium">Costo:</span>
                            <p>${workOrder.totalMaintenanceCost}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredOrders(myOrders).length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No tienes órdenes asignadas</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-requests" className="space-y-4">
          <div className="space-y-4">
            {filteredOrders(myRequests).map(workOrder => {
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
                          <Badge className={getStatusColor(workOrder.status)}>
                            {workOrder.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm mb-2">{workOrder.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Solicitada:</span>
                            <p>{workOrder.requestDate.toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="font-medium">Técnico:</span>
                            <p>{workOrder.technician || 'Sin asignar'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Progreso:</span>
                            <p>{workOrder.progress}%</p>
                          </div>
                          <div>
                            <span className="font-medium">Estado:</span>
                            <p>{workOrder.status}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredOrders(myRequests).length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No has creado solicitudes</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}