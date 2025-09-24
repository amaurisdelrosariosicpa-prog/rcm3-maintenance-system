import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Edit,
  Trash2,
  Save,
  Search,
  Filter,
  Download,
  Upload,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Equipment, sampleEquipment, MaintenanceService } from '@/lib/maintenance-data';

export default function EquipmentManagement() {
  const [equipment, setEquipment] = useState<Equipment[]>(sampleEquipment);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    status: 'Operativo',
    criticalityLevel: 'Medio'
  });

  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || eq.category === filterCategory;
    const matchesStatus = !filterStatus || eq.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateEquipment = () => {
    if (!newEquipment.name || !newEquipment.manufacturer || !newEquipment.model) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const equipment: Equipment = {
      id: `EQ-${String(Math.floor(Math.random() * 9000) + 1000).padStart(3, '0')}`,
      name: newEquipment.name!,
      category: newEquipment.category || 'General',
      subCategory: newEquipment.subCategory || 'General',
      assetType: newEquipment.assetType || 'Estático',
      application: newEquipment.application || 'General',
      manufacturer: newEquipment.manufacturer!,
      model: newEquipment.model!,
      serialNumber: newEquipment.serialNumber || '',
      year: newEquipment.year || new Date().getFullYear(),
      acquisitionDate: newEquipment.acquisitionDate || new Date(),
      operationDate: newEquipment.operationDate || new Date(),
      warrantyEndDate: newEquipment.warrantyEndDate || new Date(),
      plant: newEquipment.plant || '',
      area: newEquipment.area || '',
      system: newEquipment.system || '',
      criticalityLevel: newEquipment.criticalityLevel as Equipment['criticalityLevel'] || 'Medio',
      acquisitionCost: newEquipment.acquisitionCost || 0,
      replacementCost: newEquipment.replacementCost || 0,
      usefulLife: newEquipment.usefulLife || 0,
      operatingHoursPerDay: newEquipment.operatingHoursPerDay || 8,
      operatingDaysPerWeek: newEquipment.operatingDaysPerWeek || 5,
      usageFactor: newEquipment.usageFactor || 0.8,
      status: newEquipment.status as Equipment['status'] || 'Operativo',
      observations: newEquipment.observations || ''
    };

    setEquipment(prev => [...prev, equipment]);
    setShowAddForm(false);
    setNewEquipment({ status: 'Operativo', criticalityLevel: 'Medio' });
  };

  const handleUpdateEquipment = () => {
    if (!selectedEquipment) return;

    setEquipment(prev => prev.map(eq => 
      eq.id === selectedEquipment.id ? selectedEquipment : eq
    ));
    setShowEditForm(false);
    setSelectedEquipment(null);
  };

  const handleDeleteEquipment = (equipmentId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
      setEquipment(prev => prev.filter(eq => eq.id !== equipmentId));
    }
  };

  const getStatusColor = (status: Equipment['status']) => {
    switch (status) {
      case 'Operativo': return 'bg-green-500';
      case 'Mantenimiento': return 'bg-yellow-500';
      case 'Fuera de Servicio': return 'bg-red-500';
      case 'Retirado': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getCriticalityColor = (level: Equipment['criticalityLevel']) => {
    switch (level) {
      case 'Crítico': return 'bg-red-500';
      case 'Alto': return 'bg-orange-500';
      case 'Medio': return 'bg-yellow-500';
      case 'Bajo': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const categories = [...new Set(equipment.map(eq => eq.category))];
  const statuses = [...new Set(equipment.map(eq => eq.status))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Equipos</h2>
          <p className="text-muted-foreground">Administra el inventario de equipos y activos</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Equipo
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar equipos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label>Categoría</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las categorías</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los estados</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setFilterCategory('');
                setFilterStatus('');
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista de Equipos</TabsTrigger>
          <TabsTrigger value="cards">Vista de Tarjetas</TabsTrigger>
          <TabsTrigger value="critical">Equipos Críticos</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Add Equipment Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Agregar Nuevo Equipo</CardTitle>
                <CardDescription>Complete la información del equipo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Nombre del Equipo *</Label>
                    <Input
                      value={newEquipment.name || ''}
                      onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                      placeholder="Bomba Centrífuga"
                    />
                  </div>
                  <div>
                    <Label>Fabricante *</Label>
                    <Input
                      value={newEquipment.manufacturer || ''}
                      onChange={(e) => setNewEquipment({ ...newEquipment, manufacturer: e.target.value })}
                      placeholder="Grundfos"
                    />
                  </div>
                  <div>
                    <Label>Modelo *</Label>
                    <Input
                      value={newEquipment.model || ''}
                      onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
                      placeholder="NK-150-315"
                    />
                  </div>
                  <div>
                    <Label>Categoría</Label>
                    <Select value={newEquipment.category} onValueChange={(value) => setNewEquipment({ ...newEquipment, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Equipos_Rotativos">Equipos Rotativos</SelectItem>
                        <SelectItem value="Equipos_Estaticos">Equipos Estáticos</SelectItem>
                        <SelectItem value="Instrumentacion">Instrumentación</SelectItem>
                        <SelectItem value="Electricos">Eléctricos</SelectItem>
                        <SelectItem value="Estructuras">Estructuras</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Subcategoría</Label>
                    <Input
                      value={newEquipment.subCategory || ''}
                      onChange={(e) => setNewEquipment({ ...newEquipment, subCategory: e.target.value })}
                      placeholder="Bombas"
                    />
                  </div>
                  <div>
                    <Label>Número de Serie</Label>
                    <Input
                      value={newEquipment.serialNumber || ''}
                      onChange={(e) => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })}
                      placeholder="GRF2019001"
                    />
                  </div>
                  <div>
                    <Label>Planta</Label>
                    <Input
                      value={newEquipment.plant || ''}
                      onChange={(e) => setNewEquipment({ ...newEquipment, plant: e.target.value })}
                      placeholder="Planta Norte"
                    />
                  </div>
                  <div>
                    <Label>Área</Label>
                    <Input
                      value={newEquipment.area || ''}
                      onChange={(e) => setNewEquipment({ ...newEquipment, area: e.target.value })}
                      placeholder="Bombeo"
                    />
                  </div>
                  <div>
                    <Label>Nivel de Criticidad</Label>
                    <Select value={newEquipment.criticalityLevel} onValueChange={(value) => setNewEquipment({ ...newEquipment, criticalityLevel: value as Equipment['criticalityLevel'] })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bajo">Bajo</SelectItem>
                        <SelectItem value="Medio">Medio</SelectItem>
                        <SelectItem value="Alto">Alto</SelectItem>
                        <SelectItem value="Crítico">Crítico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Select value={newEquipment.status} onValueChange={(value) => setNewEquipment({ ...newEquipment, status: value as Equipment['status'] })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Operativo">Operativo</SelectItem>
                        <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                        <SelectItem value="Fuera de Servicio">Fuera de Servicio</SelectItem>
                        <SelectItem value="Retirado">Retirado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Costo de Adquisición</Label>
                    <Input
                      type="number"
                      value={newEquipment.acquisitionCost || ''}
                      onChange={(e) => setNewEquipment({ ...newEquipment, acquisitionCost: Number(e.target.value) })}
                      placeholder="25000"
                    />
                  </div>
                  <div>
                    <Label>Costo de Reemplazo</Label>
                    <Input
                      type="number"
                      value={newEquipment.replacementCost || ''}
                      onChange={(e) => setNewEquipment({ ...newEquipment, replacementCost: Number(e.target.value) })}
                      placeholder="35000"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Observaciones</Label>
                  <Textarea
                    value={newEquipment.observations || ''}
                    onChange={(e) => setNewEquipment({ ...newEquipment, observations: e.target.value })}
                    placeholder="Información adicional del equipo..."
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateEquipment}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Equipo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Equipment Table */}
          <Card>
            <CardHeader>
              <CardTitle>Equipos Registrados ({filteredEquipment.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold">ID</th>
                      <th className="text-left p-2 font-semibold">Nombre</th>
                      <th className="text-left p-2 font-semibold">Fabricante</th>
                      <th className="text-left p-2 font-semibold">Modelo</th>
                      <th className="text-left p-2 font-semibold">Criticidad</th>
                      <th className="text-left p-2 font-semibold">Estado</th>
                      <th className="text-left p-2 font-semibold">Planta</th>
                      <th className="text-center p-2 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEquipment.map(eq => (
                      <tr key={eq.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono text-sm">{eq.id}</td>
                        <td className="p-2 font-medium">{eq.name}</td>
                        <td className="p-2">{eq.manufacturer}</td>
                        <td className="p-2">{eq.model}</td>
                        <td className="p-2">
                          <Badge className={getCriticalityColor(eq.criticalityLevel)}>
                            {eq.criticalityLevel}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge className={getStatusColor(eq.status)}>
                            {eq.status}
                          </Badge>
                        </td>
                        <td className="p-2">{eq.plant}</td>
                        <td className="p-2 text-center">
                          <div className="flex justify-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEquipment(eq);
                                setShowEditForm(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEquipment(eq.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipment.map(eq => (
              <Card key={eq.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{eq.name}</CardTitle>
                    <Badge className={getCriticalityColor(eq.criticalityLevel)}>
                      {eq.criticalityLevel}
                    </Badge>
                  </div>
                  <CardDescription>{eq.manufacturer} - {eq.model}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Estado:</span>
                    <Badge className={getStatusColor(eq.status)}>
                      {eq.status}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <p><span className="font-medium">ID:</span> {eq.id}</p>
                    <p><span className="font-medium">Planta:</span> {eq.plant}</p>
                    <p><span className="font-medium">Área:</span> {eq.area}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEquipment(eq);
                          setShowEditForm(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteEquipment(eq.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Año: {eq.year}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Equipos Críticos
              </CardTitle>
              <CardDescription>
                Equipos que requieren atención prioritaria por su nivel de criticidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {equipment.filter(eq => eq.criticalityLevel === 'Crítico' || eq.criticalityLevel === 'Alto').map(eq => (
                  <div key={eq.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{eq.name}</h4>
                        <p className="text-sm text-muted-foreground">{eq.id} - {eq.manufacturer}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={getCriticalityColor(eq.criticalityLevel)}>
                          {eq.criticalityLevel}
                        </Badge>
                        <Badge className={getStatusColor(eq.status)}>
                          {eq.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Disponibilidad:</span>
                        <p>{MaintenanceService.calculateAvailability(eq.id).toFixed(1)}%</p>
                      </div>
                      <div>
                        <span className="font-medium">MTBF:</span>
                        <p>{MaintenanceService.calculateMTBF(eq.id)} horas</p>
                      </div>
                      <div>
                        <span className="font-medium">MTTR:</span>
                        <p>{MaintenanceService.calculateMTTR(eq.id)} horas</p>
                      </div>
                    </div>
                    
                    {eq.observations && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                        <span className="font-medium">Observaciones:</span> {eq.observations}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Equipment Modal */}
      {showEditForm && selectedEquipment && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle>Editar Equipo: {selectedEquipment.name}</CardTitle>
              <CardDescription>Modifica la información del equipo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Nombre del Equipo</Label>
                  <Input
                    value={selectedEquipment.name}
                    onChange={(e) => setSelectedEquipment({ ...selectedEquipment, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Fabricante</Label>
                  <Input
                    value={selectedEquipment.manufacturer}
                    onChange={(e) => setSelectedEquipment({ ...selectedEquipment, manufacturer: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Modelo</Label>
                  <Input
                    value={selectedEquipment.model}
                    onChange={(e) => setSelectedEquipment({ ...selectedEquipment, model: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Nivel de Criticidad</Label>
                  <Select value={selectedEquipment.criticalityLevel} onValueChange={(value) => setSelectedEquipment({ ...selectedEquipment, criticalityLevel: value as Equipment['criticalityLevel'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bajo">Bajo</SelectItem>
                      <SelectItem value="Medio">Medio</SelectItem>
                      <SelectItem value="Alto">Alto</SelectItem>
                      <SelectItem value="Crítico">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select value={selectedEquipment.status} onValueChange={(value) => setSelectedEquipment({ ...selectedEquipment, status: value as Equipment['status'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operativo">Operativo</SelectItem>
                      <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="Fuera de Servicio">Fuera de Servicio</SelectItem>
                      <SelectItem value="Retirado">Retirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Planta</Label>
                  <Input
                    value={selectedEquipment.plant}
                    onChange={(e) => setSelectedEquipment({ ...selectedEquipment, plant: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label>Observaciones</Label>
                <Textarea
                  value={selectedEquipment.observations}
                  onChange={(e) => setSelectedEquipment({ ...selectedEquipment, observations: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditForm(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateEquipment}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}