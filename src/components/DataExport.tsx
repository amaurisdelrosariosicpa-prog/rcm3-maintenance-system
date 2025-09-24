import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FileText, Database, BarChart3, Info } from 'lucide-react';
import { Equipment, WorkOrder } from '@/lib/rcm3-data';
import { exportToCSV, exportToPowerBI, calculateMTBF, calculateMTTR, calculateAvailability } from '@/lib/maintenance-utils';

interface DataExportProps {
  equipment: Equipment[];
  workOrders: WorkOrder[];
}

export default function DataExport({ equipment, workOrders }: DataExportProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'powerbi'>('csv');
  const [selectedTables, setSelectedTables] = useState({
    equipment: true,
    workOrders: true,
    reliability: true,
    summary: true
  });

  const handleTableSelection = (table: string, checked: boolean) => {
    setSelectedTables(prev => ({
      ...prev,
      [table]: checked
    }));
  };

  const prepareEquipmentData = () => {
    return equipment.map(eq => ({
      id: eq.id,
      name: eq.name,
      type: eq.type,
      industry: eq.industry,
      manufacturer: eq.manufacturer,
      model: eq.model,
      location: eq.location,
      criticality: eq.criticality,
      installationDate: eq.installationDate.toISOString().split('T')[0],
      operationalHours: eq.operationalHours,
      specifications: JSON.stringify(eq.specifications)
    }));
  };

  const prepareWorkOrdersData = () => {
    return workOrders.map(wo => {
      const equipmentName = equipment.find(eq => eq.id === wo.equipmentId)?.name || 'N/A';
      return {
        id: wo.id,
        equipmentId: wo.equipmentId,
        equipmentName: equipmentName,
        type: wo.type,
        description: wo.description,
        priority: wo.priority,
        status: wo.status,
        createdDate: wo.createdDate.toISOString().split('T')[0],
        scheduledDate: wo.scheduledDate ? wo.scheduledDate.toISOString().split('T')[0] : '',
        completedDate: wo.completedDate ? wo.completedDate.toISOString().split('T')[0] : '',
        technician: wo.technician,
        cost: wo.cost,
        rootCause: wo.rootCause || '',
        preventiveActions: wo.preventiveActions ? wo.preventiveActions.join('; ') : ''
      };
    });
  };

  const prepareReliabilityData = () => {
    return equipment.map(eq => {
      const mtbf = calculateMTBF(workOrders, eq.id);
      const mttr = calculateMTTR(workOrders, eq.id);
      const availability = calculateAvailability(mtbf, mttr);
      const equipmentOrders = workOrders.filter(wo => wo.equipmentId === eq.id);
      const totalCost = equipmentOrders.reduce((sum, wo) => sum + wo.cost, 0);
      
      return {
        equipmentId: eq.id,
        equipmentName: eq.name,
        equipmentType: eq.type,
        criticality: eq.criticality,
        mtbf: mtbf,
        mttr: mttr,
        availability: availability,
        totalWorkOrders: equipmentOrders.length,
        totalMaintenanceCost: totalCost,
        preventiveOrders: equipmentOrders.filter(wo => wo.type === 'Preventive').length,
        correctiveOrders: equipmentOrders.filter(wo => wo.type === 'Corrective').length,
        predictiveOrders: equipmentOrders.filter(wo => wo.type === 'Predictive').length,
        emergencyOrders: equipmentOrders.filter(wo => wo.type === 'Emergency').length
      };
    });
  };

  const prepareSummaryData = () => {
    const totalEquipment = equipment.length;
    const totalWorkOrders = workOrders.length;
    const completedOrders = workOrders.filter(wo => wo.status === 'Completed').length;
    const totalCost = workOrders.reduce((sum, wo) => sum + wo.cost, 0);
    
    const reliabilityMetrics = equipment.map(eq => {
      const mtbf = calculateMTBF(workOrders, eq.id);
      const mttr = calculateMTTR(workOrders, eq.id);
      const availability = calculateAvailability(mtbf, mttr);
      return availability;
    });
    
    const avgAvailability = reliabilityMetrics.length > 0 
      ? reliabilityMetrics.reduce((sum, av) => sum + av, 0) / reliabilityMetrics.length 
      : 100;

    const costByType = workOrders.reduce((acc, wo) => {
      acc[wo.type] = (acc[wo.type] || 0) + wo.cost;
      return acc;
    }, {} as Record<string, number>);

    const equipmentByCriticality = equipment.reduce((acc, eq) => {
      acc[eq.criticality] = (acc[eq.criticality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [{
      reportDate: new Date().toISOString().split('T')[0],
      totalEquipment: totalEquipment,
      totalWorkOrders: totalWorkOrders,
      completedOrders: completedOrders,
      completionRate: totalWorkOrders > 0 ? (completedOrders / totalWorkOrders) * 100 : 0,
      totalMaintenanceCost: totalCost,
      avgCostPerOrder: totalWorkOrders > 0 ? totalCost / totalWorkOrders : 0,
      avgAvailability: avgAvailability,
      preventiveCost: costByType['Preventive'] || 0,
      correctiveCost: costByType['Corrective'] || 0,
      predictiveCost: costByType['Predictive'] || 0,
      emergencyCost: costByType['Emergency'] || 0,
      criticalEquipment: equipmentByCriticality['Critical'] || 0,
      highCriticalityEquipment: equipmentByCriticality['High'] || 0,
      mediumCriticalityEquipment: equipmentByCriticality['Medium'] || 0,
      lowCriticalityEquipment: equipmentByCriticality['Low'] || 0
    }];
  };

  const handleExport = () => {
    const exportData: Record<string, unknown> = {};
    
    if (selectedTables.equipment) {
      exportData.equipment = prepareEquipmentData();
    }
    
    if (selectedTables.workOrders) {
      exportData.workOrders = prepareWorkOrdersData();
    }
    
    if (selectedTables.reliability) {
      exportData.reliability = prepareReliabilityData();
    }
    
    if (selectedTables.summary) {
      exportData.summary = prepareSummaryData();
    }

    const timestamp = new Date().toISOString().split('T')[0];

    switch (exportFormat) {
      case 'csv': {
        // Export each table as separate CSV files
        Object.entries(exportData).forEach(([tableName, data]) => {
          if (Array.isArray(data) && data.length > 0) {
            exportToCSV(data, `rcm3_${tableName}_${timestamp}`);
          }
        });
        break;
      }
        
      case 'json': {
        const jsonData = JSON.stringify(exportData, null, 2);
        const jsonBlob = new Blob([jsonData], { type: 'application/json' });
        const jsonUrl = window.URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = `rcm3_data_${timestamp}.json`;
        jsonLink.click();
        window.URL.revokeObjectURL(jsonUrl);
        break;
      }
        
      case 'powerbi': {
        const powerBIData = exportToPowerBI(exportData);
        const powerBIBlob = new Blob([powerBIData], { type: 'application/json' });
        const powerBIUrl = window.URL.createObjectURL(powerBIBlob);
        const powerBILink = document.createElement('a');
        powerBILink.href = powerBIUrl;
        powerBILink.download = `rcm3_powerbi_${timestamp}.json`;
        powerBILink.click();
        window.URL.revokeObjectURL(powerBIUrl);
        break;
      }
    }
  };

  const getSelectedTablesCount = () => {
    return Object.values(selectedTables).filter(Boolean).length;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Exportación de Datos</h2>
        <p className="text-muted-foreground">Exporta los datos del sistema para análisis externo y Power BI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Configuración de Exportación</span>
            </CardTitle>
            <CardDescription>Selecciona el formato y las tablas a exportar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Formato de Exportación</label>
              <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as 'csv' | 'json' | 'powerbi')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel Compatible)</SelectItem>
                  <SelectItem value="json">JSON (Datos Estructurados)</SelectItem>
                  <SelectItem value="powerbi">Power BI (Formato Optimizado)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Tablas a Exportar</label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="equipment"
                    checked={selectedTables.equipment}
                    onCheckedChange={(checked) => handleTableSelection('equipment', checked as boolean)}
                  />
                  <label htmlFor="equipment" className="text-sm">
                    Registro de Equipos ({equipment.length} registros)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="workOrders"
                    checked={selectedTables.workOrders}
                    onCheckedChange={(checked) => handleTableSelection('workOrders', checked as boolean)}
                  />
                  <label htmlFor="workOrders" className="text-sm">
                    Órdenes de Trabajo ({workOrders.length} registros)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="reliability"
                    checked={selectedTables.reliability}
                    onCheckedChange={(checked) => handleTableSelection('reliability', checked as boolean)}
                  />
                  <label htmlFor="reliability" className="text-sm">
                    Métricas de Confiabilidad (MTBF, MTTR, Disponibilidad)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="summary"
                    checked={selectedTables.summary}
                    onCheckedChange={(checked) => handleTableSelection('summary', checked as boolean)}
                  />
                  <label htmlFor="summary" className="text-sm">
                    Resumen Ejecutivo (KPIs Consolidados)
                  </label>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleExport} 
              disabled={getSelectedTablesCount() === 0}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Datos ({getSelectedTablesCount()} tablas)
            </Button>
          </CardContent>
        </Card>

        {/* Export Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>Información de Exportación</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">CSV (Excel)</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Formato compatible con Excel y herramientas de análisis. 
                  Cada tabla se exporta como un archivo CSV separado.
                </p>
              </div>

              <div className="border rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="h-4 w-4 text-green-500" />
                  <span className="font-medium">JSON</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Formato estructurado ideal para integración con APIs 
                  y sistemas de terceros. Mantiene la estructura relacional.
                </p>
              </div>

              <div className="border rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Power BI</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Formato optimizado para importación directa en Power BI. 
                  Incluye metadatos y estructura para dashboards.
                </p>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Tip:</strong> Para Power BI, importa el archivo JSON usando 
                "Obtener datos" → "Archivo" → "JSON". Los datos estarán 
                pre-estructurados para crear visualizaciones inmediatamente.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa de Datos</CardTitle>
          <CardDescription>Resumen de los datos disponibles para exportación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{equipment.length}</p>
              <p className="text-sm text-muted-foreground">Equipos Registrados</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">{workOrders.length}</p>
              <p className="text-sm text-muted-foreground">Órdenes de Trabajo</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {equipment.filter(eq => eq.criticality === 'Critical' || eq.criticality === 'High').length}
              </p>
              <p className="text-sm text-muted-foreground">Equipos Críticos</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {workOrders.filter(wo => wo.status === 'Completed').length}
              </p>
              <p className="text-sm text-muted-foreground">Trabajos Completados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Power BI Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Guía de Integración con Power BI</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <p className="font-medium">Exportar Datos</p>
                <p className="text-sm text-muted-foreground">Selecciona formato "Power BI" y exporta todas las tablas necesarias.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <p className="font-medium">Importar en Power BI</p>
                <p className="text-sm text-muted-foreground">Usa "Obtener datos" → "Archivo" → "JSON" y selecciona el archivo exportado.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <p className="font-medium">Crear Relaciones</p>
                <p className="text-sm text-muted-foreground">Establece relaciones entre tablas usando los campos ID (equipmentId, etc.).</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">4</div>
              <div>
                <p className="font-medium">Crear Visualizaciones</p>
                <p className="text-sm text-muted-foreground">Utiliza los KPIs pre-calculados para crear dashboards de confiabilidad y mantenimiento.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}