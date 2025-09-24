import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle, XCircle, Info, Plus, Search, Edit, Trash2, Save } from 'lucide-react';
import { Equipment, FailureMode, failureModesDatabase, calculateRPN, getRiskLevel } from '@/lib/rcm3-data';
import { FailureModesStorage } from '@/lib/failure-modes-storage';

interface RCM3AnalysisProps {
  equipment: Equipment[];
}

export default function RCM3Analysis({ equipment }: RCM3AnalysisProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<FailureMode[]>([]);
  
  // Failure Mode Management State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFailureMode, setEditingFailureMode] = useState<FailureMode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipmentType, setSelectedEquipmentType] = useState('');
  const [allFailureModes, setAllFailureModes] = useState<Record<string, FailureMode[]>>(
    FailureModesStorage.getAllFailureModes()
  );

  const [formData, setFormData] = useState({
    equipmentType: '',
    description: '',
    frequency: 'Medium' as FailureMode['frequency'],
    severity: 5,
    detectability: 5,
    causes: '',
    effects: '',
    detectionMethods: '',
    preventiveActions: ''
  });

  const handleEquipmentSelect = (equipmentId: string) => {
    setSelectedEquipment(equipmentId);
    const eq = equipment.find(e => e.id === equipmentId);
    if (eq) {
      const modes = FailureModesStorage.getFailureModesForEquipment(eq.type);
      setAnalysisResults(modes);
    } else {
      setAnalysisResults([]);
    }
  };

  // Failure Mode Management Functions
  const resetForm = () => {
    setFormData({
      equipmentType: '',
      description: '',
      frequency: 'Medium',
      severity: 5,
      detectability: 5,
      causes: '',
      effects: '',
      detectionMethods: '',
      preventiveActions: ''
    });
    setEditingFailureMode(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const failureMode: FailureMode = {
      id: editingFailureMode?.id || `fm_${Date.now()}`,
      description: formData.description,
      frequency: formData.frequency,
      severity: formData.severity,
      detectability: formData.detectability,
      causes: formData.causes.split('\n').filter(c => c.trim()),
      effects: formData.effects.split('\n').filter(e => e.trim()),
      detectionMethods: formData.detectionMethods.split('\n').filter(d => d.trim()),
      preventiveActions: formData.preventiveActions.split('\n').filter(p => p.trim())
    };

    if (editingFailureMode) {
      FailureModesStorage.updateFailureMode(formData.equipmentType, editingFailureMode.id, failureMode);
    } else {
      FailureModesStorage.addFailureMode(formData.equipmentType, failureMode);
    }

    // Refresh failure modes
    setAllFailureModes(FailureModesStorage.getAllFailureModes());
    
    // Update analysis results if current equipment is affected
    const eq = equipment.find(e => e.id === selectedEquipment);
    if (eq && eq.type === formData.equipmentType) {
      setAnalysisResults(FailureModesStorage.getFailureModesForEquipment(eq.type));
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (equipmentType: string, failureMode: FailureMode) => {
    setEditingFailureMode(failureMode);
    setFormData({
      equipmentType,
      description: failureMode.description,
      frequency: failureMode.frequency,
      severity: failureMode.severity,
      detectability: failureMode.detectability,
      causes: failureMode.causes.join('\n'),
      effects: failureMode.effects.join('\n'),
      detectionMethods: failureMode.detectionMethods.join('\n'),
      preventiveActions: failureMode.preventiveActions.join('\n')
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (equipmentType: string, failureModeId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este modo de falla?')) {
      FailureModesStorage.deleteFailureMode(equipmentType, failureModeId);
      setAllFailureModes(FailureModesStorage.getAllFailureModes());
      
      // Update analysis results if current equipment is affected
      const eq = equipment.find(e => e.id === selectedEquipment);
      if (eq && eq.type === equipmentType) {
        setAnalysisResults(FailureModesStorage.getFailureModesForEquipment(eq.type));
      }
    }
  };

  const getUniqueEquipmentTypes = () => {
    const types = new Set<string>();
    equipment.forEach(eq => types.add(eq.type));
    Object.keys(allFailureModes).forEach(type => types.add(type));
    return Array.from(types).sort();
  };

  const getFilteredFailureModes = () => {
    const results: Array<{equipmentType: string, mode: FailureMode}> = [];
    
    Object.entries(allFailureModes).forEach(([equipmentType, modes]) => {
      modes.forEach(mode => {
        const matchesSearch = !searchTerm || 
          mode.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mode.causes.some(cause => cause.toLowerCase().includes(searchTerm.toLowerCase())) ||
          mode.effects.some(effect => effect.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesType = !selectedEquipmentType || equipmentType === selectedEquipmentType;
        
        if (matchesSearch && matchesType) {
          results.push({ equipmentType, mode });
        }
      });
    });
    
    return results;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'Very High': return 'text-red-600';
      case 'High': return 'text-orange-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-blue-600';
      case 'Very Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const selectedEquipmentData = equipment.find(e => e.id === selectedEquipment);

  const criticalityStats = equipment.reduce((acc, eq) => {
    acc[eq.criticality] = (acc[eq.criticality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskAnalysis = analysisResults.map(fm => {
    const rpn = calculateRPN(fm.frequency, fm.severity, fm.detectability);
    const risk = getRiskLevel(rpn);
    return { ...fm, rpn, risk };
  });

  const riskDistribution = riskAnalysis.reduce((acc, item) => {
    acc[item.risk] = (acc[item.risk] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Análisis RCM3</h2>
        <p className="text-muted-foreground">Mantenimiento Centrado en Confiabilidad - Análisis de Modos de Falla</p>
      </div>

      <Tabs defaultValue="criticality" className="space-y-4">
        <TabsList>
          <TabsTrigger value="criticality">Evaluación de Criticidad</TabsTrigger>
          <TabsTrigger value="failure-modes">Modos de Falla</TabsTrigger>
          <TabsTrigger value="risk-analysis">Análisis de Riesgo</TabsTrigger>
        </TabsList>

        <TabsContent value="criticality" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(criticalityStats).map(([level, count]) => (
              <Card key={level}>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Badge className={`${level === 'Critical' ? 'bg-red-500' : level === 'High' ? 'bg-orange-500' : level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                      {level}
                    </Badge>
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {((count / equipment.length) * 100).toFixed(1)}% del total
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Matriz de Criticidad de Equipos</CardTitle>
              <CardDescription>Distribución de equipos por nivel de criticidad</CardDescription>
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
                    <TableHead>Horas Operación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipment.map((eq) => (
                    <TableRow key={eq.id}>
                      <TableCell className="font-medium">{eq.name}</TableCell>
                      <TableCell>{eq.type}</TableCell>
                      <TableCell>{eq.industry}</TableCell>
                      <TableCell>{eq.location}</TableCell>
                      <TableCell>
                        <Badge className={`${eq.criticality === 'Critical' ? 'bg-red-500' : eq.criticality === 'High' ? 'bg-orange-500' : eq.criticality === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                          {eq.criticality}
                        </Badge>
                      </TableCell>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failure-modes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Equipo para Análisis</CardTitle>
              <CardDescription>Elige un equipo para ver sus modos de falla potenciales</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedEquipment} onValueChange={handleEquipmentSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar equipo..." />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name} - {eq.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedEquipmentData && (
            <Card>
              <CardHeader>
                <CardTitle>Información del Equipo Seleccionado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium">Nombre</p>
                    <p className="text-lg">{selectedEquipmentData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tipo</p>
                    <p className="text-lg">{selectedEquipmentData.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Criticidad</p>
                    <Badge className={`${selectedEquipmentData.criticality === 'Critical' ? 'bg-red-500' : selectedEquipmentData.criticality === 'High' ? 'bg-orange-500' : selectedEquipmentData.criticality === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                      {selectedEquipmentData.criticality}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ubicación</p>
                    <p className="text-lg">{selectedEquipmentData.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {analysisResults.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Modos de Falla Identificados</CardTitle>
                <CardDescription>Análisis FMEA para {selectedEquipmentData?.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResults.map((fm, index) => (
                    <Card key={fm.id} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="text-lg">{fm.description}</CardTitle>
                        <div className="flex space-x-2">
                          <Badge variant="outline" className={getFrequencyColor(fm.frequency)}>
                            Frecuencia: {fm.frequency}
                          </Badge>
                          <Badge variant="outline">Severidad: {fm.severity}</Badge>
                          <Badge variant="outline">Detectabilidad: {fm.detectability}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Causas Potenciales:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {fm.causes.map((cause, i) => (
                                <li key={i} className="text-sm">{cause}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Efectos:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {fm.effects.map((effect, i) => (
                                <li key={i} className="text-sm">{effect}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Métodos de Detección:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {fm.detectionMethods.map((method, i) => (
                                <li key={i} className="text-sm">{method}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Acciones Preventivas:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {fm.preventiveActions.map((action, i) => (
                                <li key={i} className="text-sm">{action}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : selectedEquipment && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No hay modos de falla definidos para este tipo de equipo. El sistema puede expandirse para incluir más tipos de equipos.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="risk-analysis" className="space-y-4">
          {riskAnalysis.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(riskDistribution).map(([risk, count]) => (
                  <Card key={risk}>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Badge className={getRiskColor(risk)}>
                          {risk}
                        </Badge>
                        <span className="text-2xl font-bold">{count}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {((count / riskAnalysis.length) * 100).toFixed(1)}% de los modos
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Riesgo RPN</CardTitle>
                  <CardDescription>
                    Risk Priority Number (RPN) = Frecuencia × Severidad × Detectabilidad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Modo de Falla</TableHead>
                        <TableHead>Frecuencia</TableHead>
                        <TableHead>Severidad</TableHead>
                        <TableHead>Detectabilidad</TableHead>
                        <TableHead>RPN</TableHead>
                        <TableHead>Nivel de Riesgo</TableHead>
                        <TableHead>Prioridad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {riskAnalysis
                        .sort((a, b) => b.rpn - a.rpn)
                        .map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getFrequencyColor(item.frequency)}>
                              {item.frequency}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.severity}</TableCell>
                          <TableCell>{item.detectability}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold">{item.rpn}</span>
                              <Progress value={(item.rpn / 100) * 100} className="w-16" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRiskColor(item.risk)}>
                              {item.risk}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {index < 3 ? (
                                <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                              ) : index < 6 ? (
                                <XCircle className="h-4 w-4 text-orange-500 mr-1" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                              )}
                              {index < 3 ? 'Alta' : index < 6 ? 'Media' : 'Baja'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recomendación:</strong> Prioriza las acciones preventivas para los modos de falla con RPN ≥ 60 (riesgo crítico) y RPN ≥ 40 (riesgo alto).
                </AlertDescription>
              </Alert>
            </>
          )}
        </TabsContent>


      </Tabs>
    </div>
  );
}