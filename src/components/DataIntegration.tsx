import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Database, 
  Upload, 
  Download, 
  Settings, 
  Plus, 
  Trash2, 
  RefreshCw,
  FileSpreadsheet,
  Globe,
  Server,
  CheckCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { dataIntegrationService, DataSource, OEEData } from '@/lib/data-integration';
import { formatCurrency, formatPercentage } from '@/lib/currency-utils';

export default function DataIntegration() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [oeeData, setOeeData] = useState<OEEData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [newSource, setNewSource] = useState<Partial<DataSource>>({
    type: 'excel',
    isActive: true,
    config: {}
  });
  const [showAddSource, setShowAddSource] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const sources = dataIntegrationService.loadDataSources();
    setDataSources(sources);
    dataIntegrationService.loadOEEData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsLoading(true);

    try {
      const data = await dataIntegrationService.parseExcelFile(file);
      if (data.length > 0) {
        // Auto-detect possible field mappings
        const headers = Object.keys(data[0]);
        const autoMapping: Record<string, string> = {};
        
        headers.forEach(header => {
          const lowerHeader = header.toLowerCase();
          if (lowerHeader.includes('equip') || lowerHeader.includes('machine')) {
            autoMapping.equipmentId = header;
          } else if (lowerHeader.includes('date') || lowerHeader.includes('time')) {
            autoMapping.timestamp = header;
          } else if (lowerHeader.includes('planned') && lowerHeader.includes('time')) {
            autoMapping.plannedProductionTime = header;
          } else if (lowerHeader.includes('actual') && lowerHeader.includes('time')) {
            autoMapping.actualProductionTime = header;
          } else if (lowerHeader.includes('cycle')) {
            autoMapping.idealCycleTime = header;
          } else if (lowerHeader.includes('total') && lowerHeader.includes('piece')) {
            autoMapping.totalPieces = header;
          } else if (lowerHeader.includes('good') && lowerHeader.includes('piece')) {
            autoMapping.goodPieces = header;
          }
        });

        setFieldMapping(autoMapping);
        setMessage(`Archivo cargado exitosamente. ${data.length} registros encontrados.`);
      }
    } catch (error) {
      setMessage('Error al procesar el archivo. Verifica el formato.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSource = () => {
    if (!newSource.name || !newSource.type) return;

    const source = dataIntegrationService.addDataSource(newSource as Omit<DataSource, 'id'>);
    setDataSources([...dataSources, source]);
    setNewSource({ type: 'excel', isActive: true, config: {} });
    setShowAddSource(false);
    setMessage('Fuente de datos agregada exitosamente.');
  };

  const handleDeleteSource = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta fuente de datos?')) {
      dataIntegrationService.deleteDataSource(id);
      setDataSources(dataSources.filter(ds => ds.id !== id));
      setMessage('Fuente de datos eliminada.');
    }
  };

  const handleSyncSource = async (source: DataSource) => {
    setIsLoading(true);
    try {
      await dataIntegrationService.syncDataSource(source.id);
      setMessage(`Sincronización completada para ${source.name}`);
      loadData();
    } catch (error) {
      setMessage('Error en la sincronización.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessUploadedData = async () => {
    if (!uploadedFile || Object.keys(fieldMapping).length === 0) return;

    setIsLoading(true);
    try {
      const rawData = await dataIntegrationService.parseExcelFile(uploadedFile);
      const oeeData = dataIntegrationService.mapDataToOEE(rawData, fieldMapping);
      
      // Registrar el archivo como fuente de datos
      const fileSource = {
        name: `Archivo: ${uploadedFile.name}`,
        type: 'excel' as const,
        isActive: true,
        config: {
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size,
          recordCount: oeeData.length,
          fieldMapping: fieldMapping
        },
        lastSync: new Date()
      };
      
      const newSource = dataIntegrationService.addDataSource(fileSource);
      setDataSources(prev => [...prev, newSource]);
      
      dataIntegrationService.saveOEEData(oeeData);
      setOeeData(oeeData);
      setMessage(`${oeeData.length} registros de OEE procesados exitosamente. Archivo registrado como fuente de datos.`);
      
      // Limpiar el formulario
      setUploadedFile(null);
      setFieldMapping({});
    } catch (error) {
      setMessage('Error al procesar los datos de OEE.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'excel':
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'api':
        return <Globe className="h-4 w-4" />;
      case 'database':
      case 'erp':
        return <Database className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (source: DataSource) => {
    if (!source.isActive) {
      return <Badge variant="secondary">Inactivo</Badge>;
    }
    
    if (!source.lastSync) {
      return <Badge variant="outline">Sin sincronizar</Badge>;
    }

    try {
      const lastSync = typeof source.lastSync === 'string' ? new Date(source.lastSync) : source.lastSync;
      
      if (!lastSync || isNaN(lastSync.getTime())) {
        return <Badge variant="outline">Sin sincronizar</Badge>;
      }

      const now = new Date();
      const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

      if (hoursSinceSync < 1) {
        return <Badge className="bg-green-500">Actualizado</Badge>;
      } else if (hoursSinceSync < 24) {
        return <Badge className="bg-yellow-500">Reciente</Badge>;
      } else {
        return <Badge variant="destructive">Desactualizado</Badge>;
      }
    } catch (error) {
      return <Badge variant="outline">Error de fecha</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Integración de Datos</h2>
          <p className="text-muted-foreground">Conecta sistemas ERP, Excel y otras fuentes para calcular OEE</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={async () => {
              setIsLoading(true);
              try {
                await dataIntegrationService.syncAllSources();
                setMessage('Sincronización completa exitosa para todas las fuentes.');
                loadData();
              } catch (error) {
                setMessage('Error en la sincronización completa.');
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sincronizar Todo
          </Button>
          <Button onClick={() => setShowAddSource(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Fuente
          </Button>
        </div>
      </div>

      {message && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">Fuentes de Datos</TabsTrigger>
          <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
          <TabsTrigger value="oee">Datos OEE</TabsTrigger>
          <TabsTrigger value="erp">Conexión ERP</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          {showAddSource && (
            <Card>
              <CardHeader>
                <CardTitle>Agregar Nueva Fuente de Datos</CardTitle>
                <CardDescription>Configura una nueva conexión a datos externos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre de la Fuente</Label>
                    <Input
                      value={newSource.name || ''}
                      onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                      placeholder="Ej: Sistema SAP Producción"
                    />
                  </div>
                  <div>
                    <Label>Tipo de Fuente</Label>
                    <Select 
                      value={newSource.type} 
                      onValueChange={(value) => setNewSource({ ...newSource, type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excel">Excel/CSV</SelectItem>
                        <SelectItem value="api">API REST</SelectItem>
                        <SelectItem value="database">Base de Datos</SelectItem>
                        <SelectItem value="erp">Sistema ERP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newSource.type === 'api' && (
                  <div>
                    <Label>URL del API</Label>
                    <Input
                      value={newSource.config?.url || ''}
                      onChange={(e) => setNewSource({
                        ...newSource,
                        config: { ...newSource.config, url: e.target.value }
                      })}
                      placeholder="https://api.empresa.com/oee-data"
                    />
                  </div>
                )}

                {newSource.type === 'database' && (
                  <>
                    <div>
                      <Label>Cadena de Conexión</Label>
                      <Input
                        value={newSource.config?.connectionString || ''}
                        onChange={(e) => setNewSource({
                          ...newSource,
                          config: { ...newSource.config, connectionString: e.target.value }
                        })}
                        placeholder="Server=localhost;Database=Production;..."
                      />
                    </div>
                    <div>
                      <Label>Consulta SQL</Label>
                      <Textarea
                        value={newSource.config?.query || ''}
                        onChange={(e) => setNewSource({
                          ...newSource,
                          config: { ...newSource.config, query: e.target.value }
                        })}
                        placeholder="SELECT equipment_id, production_time, pieces... FROM oee_data"
                        rows={3}
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newSource.isActive}
                    onCheckedChange={(checked) => setNewSource({ ...newSource, isActive: checked })}
                  />
                  <Label>Fuente Activa</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddSource(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddSource}>
                    Agregar Fuente
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataSources.map(source => (
              <Card key={source.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      {getSourceIcon(source.type)}
                      <h4 className="font-semibold">{source.name}</h4>
                    </div>
                    {getStatusBadge(source)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    Tipo: {source.type.toUpperCase()}
                  </p>
                  
                  {source.lastSync && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Última sync: {(() => {
                        try {
                          if (!source.lastSync) return 'Sin fecha';
                          const date = typeof source.lastSync === 'string' ? new Date(source.lastSync) : source.lastSync;
                          if (!date || typeof date.getTime !== 'function' || isNaN(date.getTime())) {
                            return 'Fecha inválida';
                          }
                          return date.toLocaleString();
                        } catch (error) {
                          return 'Error de fecha';
                        }
                      })()}
                    </p>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSyncSource(source)}
                      disabled={isLoading}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sync
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteSource(source.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subir Archivo de Datos</CardTitle>
              <CardDescription>Sube archivos Excel o CSV con datos de producción para calcular OEE</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Seleccionar Archivo</Label>
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {uploadedFile && Object.keys(fieldMapping).length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Mapeo de Campos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries({
                      equipmentId: 'ID del Equipo',
                      timestamp: 'Fecha/Hora',
                      plannedProductionTime: 'Tiempo Planificado (min)',
                      actualProductionTime: 'Tiempo Real (min)',
                      idealCycleTime: 'Tiempo de Ciclo Ideal (min)',
                      totalPieces: 'Piezas Totales',
                      goodPieces: 'Piezas Buenas'
                    }).map(([key, label]) => (
                      <div key={key}>
                        <Label>{label}</Label>
                        <Input
                          value={fieldMapping[key] || ''}
                          onChange={(e) => setFieldMapping({
                            ...fieldMapping,
                            [key]: e.target.value
                          })}
                          placeholder="Nombre de la columna en el archivo"
                        />
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={handleProcessUploadedData} 
                    className="mt-4"
                    disabled={isLoading}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Procesar Datos OEE
                  </Button>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oee" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Datos de OEE Calculados</CardTitle>
              <CardDescription>Visualiza los datos de Eficiencia General del Equipo procesados</CardDescription>
            </CardHeader>
            <CardContent>
              {oeeData.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                      <div className="text-center">
                        <h4 className="text-sm font-medium text-muted-foreground">Promedio OEE</h4>
                        <p className="text-2xl font-bold text-green-600">
                          {formatPercentage(oeeData.reduce((acc, d) => acc + d.oee, 0) / oeeData.length)}
                        </p>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <h4 className="text-sm font-medium text-muted-foreground">Disponibilidad</h4>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatPercentage(oeeData.reduce((acc, d) => acc + d.availability, 0) / oeeData.length)}
                        </p>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <h4 className="text-sm font-medium text-muted-foreground">Rendimiento</h4>
                        <p className="text-2xl font-bold text-orange-600">
                          {formatPercentage(oeeData.reduce((acc, d) => acc + d.performance, 0) / oeeData.length)}
                        </p>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <h4 className="text-sm font-medium text-muted-foreground">Calidad</h4>
                        <p className="text-2xl font-bold text-purple-600">
                          {formatPercentage(oeeData.reduce((acc, d) => acc + d.quality, 0) / oeeData.length)}
                        </p>
                      </div>
                    </Card>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-2 text-left">Equipo</th>
                          <th className="border border-gray-300 p-2 text-left">Fecha</th>
                          <th className="border border-gray-300 p-2 text-right">OEE</th>
                          <th className="border border-gray-300 p-2 text-right">Disponibilidad</th>
                          <th className="border border-gray-300 p-2 text-right">Rendimiento</th>
                          <th className="border border-gray-300 p-2 text-right">Calidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {oeeData.slice(0, 10).map((data, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-2">{data.equipmentId}</td>
                            <td className="border border-gray-300 p-2">
                              {(() => {
                                try {
                                  if (!data.timestamp) return 'N/A';
                                  const date = typeof data.timestamp === 'string' ? new Date(data.timestamp) : data.timestamp;
                                  return date && !isNaN(date.getTime()) ? date.toLocaleDateString() : 'N/A';
                                } catch {
                                  return 'N/A';
                                }
                              })()}
                            </td>
                            <td className="border border-gray-300 p-2 text-right">
                              {formatPercentage(data.oee)}
                            </td>
                            <td className="border border-gray-300 p-2 text-right">
                              {formatPercentage(data.availability)}
                            </td>
                            <td className="border border-gray-300 p-2 text-right">
                              {formatPercentage(data.performance)}
                            </td>
                            <td className="border border-gray-300 p-2 text-right">
                              {formatPercentage(data.quality)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay datos de OEE disponibles</p>
                  <p className="text-sm text-muted-foreground">Sube un archivo o configura una fuente de datos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="erp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conexión a Sistemas ERP</CardTitle>
              <CardDescription>Configura la conexión directa con sistemas empresariales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Próximamente:</strong> Conectores nativos para SAP, Oracle, Microsoft Dynamics, Odoo y otros sistemas ERP.
                  Por ahora, puedes usar archivos Excel/CSV o APIs REST.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'SAP', status: 'En desarrollo', icon: '🏢' },
                  { name: 'Oracle ERP', status: 'Planificado', icon: '🔶' },
                  { name: 'Microsoft Dynamics', status: 'Planificado', icon: '🟦' },
                  { name: 'Odoo', status: 'En desarrollo', icon: '🟣' },
                  { name: 'NetSuite', status: 'Planificado', icon: '🟠' },
                  { name: 'Epicor', status: 'Planificado', icon: '🔷' }
                ].map(erp => (
                  <Card key={erp.name} className="p-4">
                    <div className="text-center space-y-2">
                      <div className="text-2xl">{erp.icon}</div>
                      <h4 className="font-semibold">{erp.name}</h4>
                      <Badge variant="outline">{erp.status}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}