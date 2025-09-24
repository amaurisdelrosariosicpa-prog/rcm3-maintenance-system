import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Download, 
  Upload, 
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Settings
} from 'lucide-react';
import { FailureMode } from '@/lib/rcm3-data';
import { FailureModesStorage } from '@/lib/failure-modes-storage';
import { AuthService, User as UserType } from '@/lib/auth';

interface FailureModeManagementProps {
  currentUser: UserType;
}

export default function FailureModeManagement({ currentUser }: FailureModeManagementProps) {
  const [failureModes, setFailureModes] = useState<Record<string, FailureMode[]>>({});
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMode, setEditingMode] = useState<FailureMode | null>(null);
  const [statistics, setStatistics] = useState({
    totalEquipmentTypes: 0,
    totalFailureModes: 0,
    customFailureModes: 0,
    defaultFailureModes: 0
  });

  const [newFailureMode, setNewFailureMode] = useState<Partial<FailureMode>>({
    equipmentType: '',
    description: '',
    causes: [],
    effects: [],
    detectionMethods: [],
    preventiveActions: [],
    frequency: 'Medium',
    severity: 'Moderate',
    detectability: 'Medium'
  });

  const [formFields, setFormFields] = useState({
    causes: '',
    effects: '',
    detectionMethods: '',
    preventiveActions: ''
  });

  useEffect(() => {
    loadFailureModes();
    loadStatistics();
  }, []);

  const loadFailureModes = () => {
    const modes = FailureModesStorage.getAllFailureModes();
    setFailureModes(modes);
  };

  const loadStatistics = () => {
    const stats = FailureModesStorage.getStatistics();
    setStatistics(stats);
  };

  const handleAddFailureMode = () => {
    if (!newFailureMode.equipmentType || !newFailureMode.description) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const failureMode: FailureMode = {
      id: `FM-${Date.now()}`,
      equipmentType: newFailureMode.equipmentType,
      description: newFailureMode.description,
      causes: formFields.causes.split(',').map(item => item.trim()).filter(item => item),
      effects: formFields.effects.split(',').map(item => item.trim()).filter(item => item),
      detectionMethods: formFields.detectionMethods.split(',').map(item => item.trim()).filter(item => item),
      preventiveActions: formFields.preventiveActions.split(',').map(item => item.trim()).filter(item => item),
      frequency: newFailureMode.frequency as any,
      severity: newFailureMode.severity as any,
      detectability: newFailureMode.detectability as any
    };

    FailureModesStorage.addFailureMode(newFailureMode.equipmentType, failureMode);
    loadFailureModes();
    loadStatistics();
    resetForm();
  };

  const handleUpdateFailureMode = () => {
    if (!editingMode) return;

    const updatedMode: FailureMode = {
      ...editingMode,
      description: newFailureMode.description || editingMode.description,
      causes: formFields.causes.split(',').map(item => item.trim()).filter(item => item),
      effects: formFields.effects.split(',').map(item => item.trim()).filter(item => item),
      detectionMethods: formFields.detectionMethods.split(',').map(item => item.trim()).filter(item => item),
      preventiveActions: formFields.preventiveActions.split(',').map(item => item.trim()).filter(item => item),
      frequency: newFailureMode.frequency as any || editingMode.frequency,
      severity: newFailureMode.severity as any || editingMode.severity,
      detectability: newFailureMode.detectability as any || editingMode.detectability
    };

    FailureModesStorage.updateFailureMode(editingMode.equipmentType, editingMode.id, updatedMode);
    loadFailureModes();
    loadStatistics();
    resetForm();
  };

  const handleDeleteFailureMode = (equipmentType: string, failureModeId: string) => {
    if (confirm('¿Está seguro de que desea eliminar este modo de falla?')) {
      FailureModesStorage.deleteFailureMode(equipmentType, failureModeId);
      loadFailureModes();
      loadStatistics();
    }
  };

  const handleEditFailureMode = (mode: FailureMode) => {
    setEditingMode(mode);
    setNewFailureMode({
      equipmentType: mode.equipmentType,
      description: mode.description,
      frequency: mode.frequency,
      severity: mode.severity,
      detectability: mode.detectability
    });
    setFormFields({
      causes: mode.causes.join(', '),
      effects: mode.effects.join(', '),
      detectionMethods: mode.detectionMethods.join(', '),
      preventiveActions: mode.preventiveActions.join(', ')
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setNewFailureMode({
      equipmentType: '',
      description: '',
      causes: [],
      effects: [],
      detectionMethods: [],
      preventiveActions: [],
      frequency: 'Medium',
      severity: 'Moderate',
      detectability: 'Medium'
    });
    setFormFields({
      causes: '',
      effects: '',
      detectionMethods: '',
      preventiveActions: ''
    });
    setShowAddForm(false);
    setEditingMode(null);
  };

  const handleResetToFactory = () => {
    if (currentUser.role !== 'Administrador') {
      alert('Solo los administradores pueden reiniciar a valores de fábrica');
      return;
    }

    if (confirm('¿Está seguro de que desea reiniciar todos los modos de falla a los valores de fábrica? Esta acción no se puede deshacer.')) {
      FailureModesStorage.resetToFactoryDefaults();
      loadFailureModes();
      loadStatistics();
      alert('Modos de falla reiniciados a valores de fábrica');
    }
  };

  const handleExport = () => {
    const data = FailureModesStorage.exportFailureModes();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `failure-modes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const success = FailureModesStorage.importFailureModes(e.target?.result as string);
        if (success) {
          loadFailureModes();
          loadStatistics();
          alert('Modos de falla importados correctamente');
        } else {
          alert('Error al importar modos de falla');
        }
      } catch (error) {
        alert('Error al procesar el archivo');
      }
    };
    reader.readAsText(file);
  };

  const getFilteredFailureModes = () => {
    let modes = failureModes;
    
    if (selectedEquipmentType && selectedEquipmentType !== 'all') {
      modes = { [selectedEquipmentType]: modes[selectedEquipmentType] || [] };
    }

    if (searchTerm) {
      const filtered: Record<string, FailureMode[]> = {};
      Object.keys(modes).forEach(equipmentType => {
        const filteredModes = modes[equipmentType].filter(mode =>
          mode.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mode.causes.some(cause => cause.toLowerCase().includes(searchTerm.toLowerCase())) ||
          mode.effects.some(effect => effect.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        if (filteredModes.length > 0) {
          filtered[equipmentType] = filteredModes;
        }
      });
      modes = filtered;
    }

    return modes;
  };

  const equipmentTypes = Object.keys(failureModes).sort();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Modos de Falla</h2>
          <p className="text-muted-foreground">Administra los modos de falla para todos los tipos de equipos</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
          {currentUser.role === 'Administrador' && (
            <Button variant="destructive" onClick={handleResetToFactory}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reiniciar a Fábrica
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Settings className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{statistics.totalEquipmentTypes}</p>
                <p className="text-sm text-muted-foreground">Tipos de Equipos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{statistics.totalFailureModes}</p>
                <p className="text-sm text-muted-foreground">Total Modos de Falla</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{statistics.defaultFailureModes}</p>
                <p className="text-sm text-muted-foreground">Modos por Defecto</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Plus className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{statistics.customFailureModes}</p>
                <p className="text-sm text-muted-foreground">Modos Personalizados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse">Explorar Modos</TabsTrigger>
          <TabsTrigger value="manage">Gestionar</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Filters */}
          <div className="flex space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar modos de falla..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedEquipmentType} onValueChange={setSelectedEquipmentType}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filtrar por tipo de equipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los equipos</SelectItem>
                {equipmentTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Failure Modes Display */}
          <div className="space-y-4">
            {Object.entries(getFilteredFailureModes()).map(([equipmentType, modes]) => (
              <Card key={equipmentType}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{equipmentType}</span>
                    <Badge variant="secondary">{modes.length} modos</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {modes.map((mode) => (
                      <div key={mode.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{mode.description}</h4>
                          <div className="flex space-x-2">
                            <Badge variant={mode.severity === 'Critical' ? 'destructive' : 'default'}>
                              {mode.severity}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={() => handleEditFailureMode(mode)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteFailureMode(equipmentType, mode.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Causas:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {mode.causes.map((cause, index) => (
                                <li key={index}>{cause}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <strong>Efectos:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {mode.effects.map((effect, index) => (
                                <li key={index}>{effect}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <strong>Métodos de Detección:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {mode.detectionMethods.map((method, index) => (
                                <li key={index}>{method}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <strong>Acciones Preventivas:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {mode.preventiveActions.map((action, index) => (
                                <li key={index}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {editingMode ? 'Editar Modo de Falla' : 'Agregar Nuevo Modo de Falla'}
            </h3>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              {showAddForm ? 'Cancelar' : 'Nuevo Modo'}
            </Button>
          </div>

          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingMode ? 'Editar Modo de Falla' : 'Nuevo Modo de Falla'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Equipo *</Label>
                    <Select 
                      value={newFailureMode.equipmentType} 
                      onValueChange={(value) => setNewFailureMode({ ...newFailureMode, equipmentType: value })}
                      disabled={!!editingMode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipmentTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Descripción *</Label>
                    <Input
                      value={newFailureMode.description || ''}
                      onChange={(e) => setNewFailureMode({ ...newFailureMode, description: e.target.value })}
                      placeholder="Descripción del modo de falla"
                    />
                  </div>

                  <div>
                    <Label>Frecuencia</Label>
                    <Select 
                      value={newFailureMode.frequency} 
                      onValueChange={(value) => setNewFailureMode({ ...newFailureMode, frequency: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Very Low">Muy Baja</SelectItem>
                        <SelectItem value="Low">Baja</SelectItem>
                        <SelectItem value="Medium">Media</SelectItem>
                        <SelectItem value="High">Alta</SelectItem>
                        <SelectItem value="Very High">Muy Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Severidad</Label>
                    <Select 
                      value={newFailureMode.severity} 
                      onValueChange={(value) => setNewFailureMode({ ...newFailureMode, severity: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Minor">Menor</SelectItem>
                        <SelectItem value="Moderate">Moderada</SelectItem>
                        <SelectItem value="Major">Mayor</SelectItem>
                        <SelectItem value="Critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Detectabilidad</Label>
                    <Select 
                      value={newFailureMode.detectability} 
                      onValueChange={(value) => setNewFailureMode({ ...newFailureMode, detectability: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Very High">Muy Alta</SelectItem>
                        <SelectItem value="High">Alta</SelectItem>
                        <SelectItem value="Medium">Media</SelectItem>
                        <SelectItem value="Low">Baja</SelectItem>
                        <SelectItem value="Very Low">Muy Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Causas (separadas por comas)</Label>
                    <Textarea
                      value={formFields.causes}
                      onChange={(e) => setFormFields({ ...formFields, causes: e.target.value })}
                      placeholder="Causa 1, Causa 2, Causa 3..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Efectos (separados por comas)</Label>
                    <Textarea
                      value={formFields.effects}
                      onChange={(e) => setFormFields({ ...formFields, effects: e.target.value })}
                      placeholder="Efecto 1, Efecto 2, Efecto 3..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Métodos de Detección (separados por comas)</Label>
                    <Textarea
                      value={formFields.detectionMethods}
                      onChange={(e) => setFormFields({ ...formFields, detectionMethods: e.target.value })}
                      placeholder="Método 1, Método 2, Método 3..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Acciones Preventivas (separadas por comas)</Label>
                    <Textarea
                      value={formFields.preventiveActions}
                      onChange={(e) => setFormFields({ ...formFields, preventiveActions: e.target.value })}
                      placeholder="Acción 1, Acción 2, Acción 3..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={editingMode ? handleUpdateFailureMode : handleAddFailureMode}>
                    {editingMode ? 'Actualizar' : 'Agregar'} Modo de Falla
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}