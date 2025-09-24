import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Edit, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Equipment, WorkOrder } from '@/lib/rcm3-data';
import { generateWorkOrderId, formatDate, formatCurrency } from '@/lib/maintenance-utils';
import { FieldManager } from '@/lib/field-manager';
import { DynamicForm } from '@/components/DynamicForm';

interface WorkOrderManagementProps {
  equipment: Equipment[];
  workOrders: WorkOrder[];
  onAddWorkOrder: (workOrder: WorkOrder) => void;
  onUpdateWorkOrder: (workOrder: WorkOrder) => void;
}

export default function WorkOrderManagement({
  equipment,
  workOrders,
  onAddWorkOrder,
  onUpdateWorkOrder
}: WorkOrderManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const [formData, setFormData] = useState(() => 
    FieldManager.generateFormData('workorders')
  );

  const resetForm = () => {
    setFormData(FieldManager.generateFormData('workorders'));
    setEditingWorkOrder(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const workOrderData: WorkOrder = {
      id: editingWorkOrder?.id || generateWorkOrderId(),
      equipmentId: formData.equipmentId,
      type: formData.type,
      description: formData.description,
      priority: formData.priority,
      status: editingWorkOrder?.status || 'Open',
      createdDate: editingWorkOrder?.createdDate || new Date(),
      scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : undefined,
      completedDate: editingWorkOrder?.completedDate,
      technician: formData.technician,
      cost: formData.cost,
      rootCause: formData.rootCause || undefined,
      preventiveActions: formData.preventiveActions ? formData.preventiveActions.split('\n') : undefined,
      spares: formData.spares || undefined,
      ...formData // Include any custom fields
    };

    if (editingWorkOrder) {
      onUpdateWorkOrder(workOrderData);
    } else {
      onAddWorkOrder(workOrderData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (wo: WorkOrder) => {
    setEditingWorkOrder(wo);
    const existingData = {
      equipmentId: wo.equipmentId,
      type: wo.type,
      description: wo.description,
      priority: wo.priority,
      scheduledDate: wo.scheduledDate && wo.scheduledDate instanceof Date ? wo.scheduledDate.toISOString().split('T')[0] : '',
      technician: wo.technician,
      cost: wo.cost,
      rootCause: wo.rootCause || '',
      preventiveActions: wo.preventiveActions?.join('\n') || '',
      spares: wo.spares || '',
      ...wo // Include any custom fields
    };
    setFormData(FieldManager.generateFormData('workorders', existingData));
    setIsDialogOpen(true);
  };

  const handleStatusChange = (workOrderId: string, newStatus: WorkOrder['status']) => {
    const workOrder = workOrders.find(wo => wo.id === workOrderId);
    if (workOrder) {
      const updatedWorkOrder = {
        ...workOrder,
        status: newStatus,
        completedDate: newStatus === 'Completed' ? new Date() : workOrder.completedDate
      };
      onUpdateWorkOrder(updatedWorkOrder);
    }
  };

  const filteredWorkOrders = workOrders.filter(wo => {
    const equipment_name = equipment.find(eq => eq.id === wo.equipmentId)?.name || '';
    const matchesSearch = wo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.technician.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || wo.status === filterStatus;
    const matchesType = filterType === 'all' || wo.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: WorkOrder['status']) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'In Progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Open': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'Completed': return 'bg-green-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Open': return 'bg-orange-500';
      case 'Cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
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
      case 'Emergency': return 'bg-red-100 text-red-800';
      case 'Corrective': return 'bg-orange-100 text-orange-800';
      case 'Preventive': return 'bg-blue-100 text-blue-800';
      case 'Predictive': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Statistics
  const statusStats = workOrders.reduce((acc, wo) => {
    acc[wo.status] = (acc[wo.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeStats = workOrders.reduce((acc, wo) => {
    acc[wo.type] = (acc[wo.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalCost = workOrders.reduce((sum, wo) => sum + wo.cost, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Órdenes de Trabajo</h2>
          <p className="text-muted-foreground">Administra las actividades de mantenimiento y seguimiento</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              const template = {
                name: 'Plantilla de Orden Estándar',
                description: 'Inspección general de equipo',
                type: 'Preventive',
                priority: 'Medium',
                estimatedDuration: 120,
                requiredSkills: ['Mecánica básica', 'Inspección visual'],
                tools: ['Multímetro', 'Llaves inglesas', 'Lubricantes'],
                steps: [
                  'Verificar estado general del equipo',
                  'Revisar conexiones eléctricas',
                  'Lubricar puntos de engrase',
                  'Verificar niveles de fluidos',
                  'Documentar observaciones'
                ],
                safetyRequirements: ['EPP completo', 'Bloqueo de energía', 'Permiso de trabajo']
              };
              
              const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'plantilla-orden-trabajo.json';
              a.click();
              URL.revokeObjectURL(url);
              
              alert('Plantilla de orden de trabajo generada y descargada exitosamente.');
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Plantilla
          </Button>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Orden
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingWorkOrder ? 'Editar Orden de Trabajo' : 'Crear Nueva Orden de Trabajo'}</DialogTitle>
              <DialogDescription>
                Registra una nueva actividad de mantenimiento
              </DialogDescription>
            </DialogHeader>
            <DynamicForm
              module="workorders"
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              submitLabel={editingWorkOrder ? 'Actualizar Orden' : 'Crear Orden'}
              equipmentOptions={equipment.map(eq => ({ value: eq.id, label: `${eq.name} - ${eq.location}` }))}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="orders">Órdenes de Trabajo</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{statusStats['Open'] || 0}</p>
                    <p className="text-sm text-muted-foreground">Abiertas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{statusStats['In Progress'] || 0}</p>
                    <p className="text-sm text-muted-foreground">En Progreso</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{statusStats['Completed'] || 0}</p>
                    <p className="text-sm text-muted-foreground">Completadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
                    <p className="text-sm text-muted-foreground">Costo Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(statusStats).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status as WorkOrder['status'])}
                        <span>{status}</span>
                      </div>
                      <Badge className={getStatusColor(status as WorkOrder['status'])}>{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(typeStats).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span>{type}</span>
                      <Badge className={getTypeColor(type as WorkOrder['type'])}>{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar órdenes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="Open">Abiertas</SelectItem>
                    <SelectItem value="In Progress">En Progreso</SelectItem>
                    <SelectItem value="Completed">Completadas</SelectItem>
                    <SelectItem value="Cancelled">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="Preventive">Preventivo</SelectItem>
                    <SelectItem value="Corrective">Correctivo</SelectItem>
                    <SelectItem value="Predictive">Predictivo</SelectItem>
                    <SelectItem value="Emergency">Emergencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Work Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Órdenes de Trabajo ({filteredWorkOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead>Costo</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkOrders.map((wo) => {
                    const equipmentName = equipment.find(eq => eq.id === wo.equipmentId)?.name || 'N/A';
                    return (
                      <TableRow key={wo.id}>
                        <TableCell className="font-mono text-sm">{wo.id}</TableCell>
                        <TableCell>{equipmentName}</TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(wo.type)}>{wo.type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{wo.description}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(wo.priority)}>{wo.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(wo.status)}
                            <Select value={wo.status} onValueChange={(value) => handleStatusChange(wo.id, value as WorkOrder['status'])}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Open">Abierta</SelectItem>
                                <SelectItem value="In Progress">En Progreso</SelectItem>
                                <SelectItem value="Completed">Completada</SelectItem>
                                <SelectItem value="Cancelled">Cancelada</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>{wo.technician}</TableCell>
                        <TableCell>{formatCurrency(wo.cost)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(wo)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Costo por Tipo de Mantenimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(typeStats).map(([type, count]) => {
                    const typeCost = workOrders
                      .filter(wo => wo.type === type)
                      .reduce((sum, wo) => sum + wo.cost, 0);
                    return (
                      <div key={type} className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Badge className={getTypeColor(type as WorkOrder['type'])}>{type}</Badge>
                          <span className="text-sm">({count} órdenes)</span>
                        </div>
                        <span className="font-semibold">{formatCurrency(typeCost)}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Órdenes por Equipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {equipment.slice(0, 5).map((eq) => {
                    const equipmentOrders = workOrders.filter(wo => wo.equipmentId === eq.id);
                    return (
                      <div key={eq.id} className="flex justify-between items-center">
                        <span className="text-sm">{eq.name}</span>
                        <Badge variant="outline">{equipmentOrders.length}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}