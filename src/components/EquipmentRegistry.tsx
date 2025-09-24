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
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { Equipment, industryTemplates } from '@/lib/rcm3-data';
import { generateEquipmentId, formatDate } from '@/lib/maintenance-utils';
import { FieldManager } from '@/lib/field-manager';
import { DynamicForm } from '@/components/DynamicForm';

interface EquipmentRegistryProps {
  equipment: Equipment[];
  onAddEquipment: (equipment: Equipment) => void;
  onUpdateEquipment: (equipment: Equipment) => void;
  onDeleteEquipment: (id: string) => void;
}

export default function EquipmentRegistry({ 
  equipment, 
  onAddEquipment, 
  onUpdateEquipment, 
  onDeleteEquipment 
}: EquipmentRegistryProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [filterCriticality, setFilterCriticality] = useState('all');

  const [formData, setFormData] = useState(() => 
    FieldManager.generateFormData('equipment')
  );

  const resetForm = () => {
    setFormData(FieldManager.generateFormData('equipment'));
    setEditingEquipment(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const equipmentData: Equipment = {
      id: editingEquipment?.id || generateEquipmentId(),
      name: formData.name,
      type: formData.type,
      industry: formData.industry,
      location: formData.location,
      manufacturer: formData.manufacturer,
      model: formData.model,
      installationDate: new Date(formData.installationDate),
      operationalHours: formData.operationalHours,
      criticality: formData.criticality,
      specifications: formData.specifications ? JSON.parse(formData.specifications) : {},
      ...formData // Include any custom fields
    };

    if (editingEquipment) {
      onUpdateEquipment(equipmentData);
    } else {
      onAddEquipment(equipmentData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (eq: Equipment) => {
    setEditingEquipment(eq);
    const existingData = {
      name: eq.name,
      type: eq.type,
      industry: eq.industry,
      location: eq.location,
      manufacturer: eq.manufacturer,
      model: eq.model,
      installationDate: eq.installationDate && eq.installationDate instanceof Date ? eq.installationDate.toISOString().split('T')[0] : '',
      operationalHours: eq.operationalHours,
      criticality: eq.criticality,
      specifications: JSON.stringify(eq.specifications, null, 2),
      ...eq // Include any custom fields
    };
    setFormData(FieldManager.generateFormData('equipment', existingData));
    setIsDialogOpen(true);
  };

  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = filterIndustry === 'all' || eq.industry === filterIndustry;
    const matchesCriticality = filterCriticality === 'all' || eq.criticality === filterCriticality;
    
    return matchesSearch && matchesIndustry && matchesCriticality;
  });

  const getCriticalityColor = (criticality: Equipment['criticality']) => {
    switch (criticality) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Registro de Equipos</h2>
          <p className="text-muted-foreground">Gestiona el inventario de equipos y sus especificaciones técnicas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Equipo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEquipment ? 'Editar Equipo' : 'Registrar Nuevo Equipo'}</DialogTitle>
              <DialogDescription>
                Ingresa la información técnica del equipo para el análisis RCM3
              </DialogDescription>
            </DialogHeader>
            <DynamicForm
              module="equipment"
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              submitLabel={editingEquipment ? 'Actualizar Equipo' : 'Registrar Equipo'}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="flex-1">
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
            <Select value={filterIndustry} onValueChange={setFilterIndustry}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por industria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las industrias</SelectItem>
                {Object.entries(industryTemplates).map(([key, template]) => (
                  <SelectItem key={key} value={key}>{template.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCriticality} onValueChange={setFilterCriticality}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por criticidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las criticidades</SelectItem>
                <SelectItem value="Low">Baja</SelectItem>
                <SelectItem value="Medium">Media</SelectItem>
                <SelectItem value="High">Alta</SelectItem>
                <SelectItem value="Critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventario de Equipos ({filteredEquipment.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Industria</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Criticidad</TableHead>
                <TableHead>Fecha Instalación</TableHead>
                <TableHead>Horas Operación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.map((eq) => (
                <TableRow key={eq.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{eq.name}</div>
                      <div className="text-sm text-muted-foreground">{eq.manufacturer} - {eq.model}</div>
                    </div>
                  </TableCell>
                  <TableCell>{eq.type}</TableCell>
                  <TableCell>{industryTemplates[eq.industry as keyof typeof industryTemplates]?.name}</TableCell>
                  <TableCell>{eq.location}</TableCell>
                  <TableCell>
                    <Badge className={getCriticalityColor(eq.criticality)}>
                      {eq.criticality}
                    </Badge>
                  </TableCell>
                  <TableCell>{eq.installationDate && eq.installationDate instanceof Date ? formatDate(eq.installationDate) : 'N/A'}</TableCell>
                  <TableCell>
                    {(() => {
                      try {
                        return eq.operationalHours && typeof eq.operationalHours === 'number' 
                          ? eq.operationalHours.toLocaleString() + ' hrs'
                          : '0 hrs';
                      } catch {
                        return '0 hrs';
                      }
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(eq)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onDeleteEquipment(eq.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}