import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { useDateFilter } from '@/hooks/useDateFilter';
import { FieldManager } from '@/lib/field-manager';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Wrench,
  Activity,
  BarChart3,
  PieChart,
  Settings,
  Lock
} from 'lucide-react';
import { Equipment, WorkOrder } from '@/lib/rcm3-data';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  calculateMTBF, 
  calculateMTTR, 
  calculateAvailability, 
  getMaintenanceCostByType,
  formatCurrency,
  formatDate 
} from '@/lib/maintenance-utils';

interface DashboardProps {
  equipment: Equipment[];
  workOrders: WorkOrder[];
}

export default function Dashboard({ equipment, workOrders }: DashboardProps) {
  const { canEditDashboard } = usePermissions();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState({
    showOverview: true,
    showReliability: true,
    showCosts: true,
    showTrends: true,
    title: 'Dashboard Estratégico'
  });
  
  // Date filtering
  const { dateFilter, setStartDate, setEndDate, applyFilter, clearFilter, filterByDateRange } = useDateFilter();
  
  // Custom KPIs from Admin Configuration
  const [customKPIs, setCustomKPIs] = useState<any[]>([]);
  
  // Función para recargar KPIs desde Admin Configuration
  const reloadKPIs = () => {
    try {
      // Cargar KPIs desde localStorage donde los guarda AdminConfiguration
      const stored = localStorage.getItem('admin_kpis');
      if (stored) {
        const adminKPIs = JSON.parse(stored);
        // Solo mostrar KPIs activos
        const activeKPIs = adminKPIs.filter((kpi: any) => kpi.isActive);
        console.log('Admin KPIs loaded:', activeKPIs);
        setCustomKPIs(activeKPIs);
      } else {
        setCustomKPIs([]);
      }
    } catch (error) {
      console.error('Error loading admin KPIs:', error);
      setCustomKPIs([]);
    }
  };
  
  useEffect(() => {
    reloadKPIs();
    
    // Recargar cada 2 segundos para detectar cambios
    const interval = setInterval(reloadKPIs, 2000);
    
    // Recargar cuando cambie localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_kpis') {
        setTimeout(reloadKPIs, 100);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Recargar cuando el componente reciba focus
    const handleFocus = () => {
      setTimeout(reloadKPIs, 100);
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
  
  // Filter data based on date range
  const filteredWorkOrders = filterByDateRange(workOrders);
  const filteredEquipment = filterByDateRange(equipment);

  // KPI Calculations
  const totalEquipment = filteredEquipment.length;
  const totalWorkOrders = filteredWorkOrders.length;
  const completedOrders = filteredWorkOrders.filter(wo => wo.status === 'Completed').length;
  const openOrders = filteredWorkOrders.filter(wo => wo.status === 'Open').length;
  const inProgressOrders = filteredWorkOrders.filter(wo => wo.status === 'In Progress').length;
  
  const totalCost = filteredWorkOrders.reduce((sum, wo) => sum + wo.cost, 0);
  const avgCostPerOrder = totalWorkOrders > 0 ? totalCost / totalWorkOrders : 0;
  
  const completionRate = totalWorkOrders > 0 ? (completedOrders / totalWorkOrders) * 100 : 0;
  
  // Reliability Metrics
  const reliabilityMetrics = filteredEquipment.map(eq => {
    const mtbf = calculateMTBF(filteredWorkOrders, eq.id);
    const mttr = calculateMTTR(filteredWorkOrders, eq.id);
    const availability = calculateAvailability(mtbf, mttr);
    
    return {
      equipment: eq,
      mtbf,
      mttr,
      availability
    };
  });

  const avgAvailability = reliabilityMetrics.length > 0 
    ? reliabilityMetrics.reduce((sum, rm) => sum + rm.availability, 0) / reliabilityMetrics.length 
    : 100;

  // Cost Analysis
  const costByType = getMaintenanceCostByType(filteredWorkOrders);
  
  // Critical Equipment (low availability or high maintenance cost)
  const criticalEquipment = reliabilityMetrics
    .filter(rm => rm.availability < 95 || rm.equipment.criticality === 'Critical')
    .sort((a, b) => a.availability - b.availability);

  // Recent Work Orders
  const recentWorkOrders = filteredWorkOrders
    .filter(wo => wo.createdDate && wo.createdDate instanceof Date)
    .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime())
    .slice(0, 5);

  // Trend Analysis (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentOrders = filteredWorkOrders.filter(wo => wo.createdDate && wo.createdDate instanceof Date && wo.createdDate >= thirtyDaysAgo);
  const preventiveOrders = recentOrders.filter(wo => wo.type === 'Preventive').length;
  const correctiveOrders = recentOrders.filter(wo => wo.type === 'Corrective').length;
  
  const preventiveRatio = recentOrders.length > 0 ? (preventiveOrders / recentOrders.length) * 100 : 0;

  // Equipment by Industry
  const equipmentByIndustry = filteredEquipment.reduce((acc, eq) => {
    acc[eq.industry] = (acc[eq.industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Equipment by Criticality
  const equipmentByCriticality = filteredEquipment.reduce((acc, eq) => {
    acc[eq.criticality] = (acc[eq.criticality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getAvailabilityColor = (availability: number) => {
    if (availability >= 98) return 'text-green-600';
    if (availability >= 95) return 'text-yellow-600';
    return 'text-red-600';
  };

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
          <h2 className="text-2xl font-bold">{dashboardConfig.title}</h2>
          <p className="text-muted-foreground">Indicadores clave de rendimiento y análisis de confiabilidad</p>
        </div>
        {canEditDashboard() && (
          <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Personalizar Dashboard
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar Dashboard</DialogTitle>
                <DialogDescription>
                  Personaliza qué secciones mostrar en el dashboard
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título del Dashboard</Label>
                  <Input
                    id="title"
                    value={dashboardConfig.title}
                    onChange={(e) => setDashboardConfig({...dashboardConfig, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secciones a mostrar:</Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={dashboardConfig.showOverview}
                        onChange={(e) => setDashboardConfig({...dashboardConfig, showOverview: e.target.checked})}
                      />
                      <span>Resumen General</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={dashboardConfig.showReliability}
                        onChange={(e) => setDashboardConfig({...dashboardConfig, showReliability: e.target.checked})}
                      />
                      <span>Confiabilidad</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={dashboardConfig.showCosts}
                        onChange={(e) => setDashboardConfig({...dashboardConfig, showCosts: e.target.checked})}
                      />
                      <span>Análisis de Costos</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={dashboardConfig.showTrends}
                        onChange={(e) => setDashboardConfig({...dashboardConfig, showTrends: e.target.checked})}
                      />
                      <span>Tendencias</span>
                    </label>
                  </div>
                </div>
                <Button onClick={() => setIsCustomizing(false)}>
                  Guardar Configuración
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {!canEditDashboard() && (
          <div className="flex items-center text-muted-foreground">
            <Lock className="h-4 w-4 mr-2" />
            Solo administradores pueden personalizar
          </div>
        )}
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter
        startDate={dateFilter.startDate}
        endDate={dateFilter.endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onApply={applyFilter}
        onClear={clearFilter}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          {dashboardConfig.showOverview && <TabsTrigger value="overview">Resumen General</TabsTrigger>}
          <TabsTrigger value="kpis">KPIs Personalizados</TabsTrigger>
          {dashboardConfig.showReliability && <TabsTrigger value="reliability">Confiabilidad</TabsTrigger>}
          {dashboardConfig.showCosts && <TabsTrigger value="costs">Análisis de Costos</TabsTrigger>}
          {dashboardConfig.showTrends && <TabsTrigger value="trends">Tendencias</TabsTrigger>}
        </TabsList>

        {dashboardConfig.showOverview && (
          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Custom KPIs from Admin Configuration */}
              {customKPIs.map((kpi, index) => (
                <Card key={`admin-kpi-${kpi.id || index}`} className="border-2 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-2xl font-bold">
                          {kpi.target || '0'}
                          {kpi.unit === '%' && '%'}
                        </p>
                        <p className="text-sm text-muted-foreground">{kpi.name}</p>
                        <p className="text-xs text-muted-foreground">{kpi.description}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge className="bg-purple-100 text-purple-800 text-xs">
                        Admin KPI
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Default KPIs */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Wrench className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{totalEquipment}</p>
                      <p className="text-sm text-muted-foreground">Equipos Registrados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{avgAvailability.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">Disponibilidad Promedio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{completionRate.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">Tasa de Completitud</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
                      <p className="text-sm text-muted-foreground">Costo Total Mantenimiento</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Work Orders Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-6 w-6 text-orange-500" />
                      <span>Órdenes Abiertas</span>
                    </div>
                    <span className="text-2xl font-bold">{openOrders}</span>
                  </div>
                  <Progress value={(openOrders / Math.max(totalWorkOrders, 1)) * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-6 w-6 text-blue-500" />
                      <span>En Progreso</span>
                    </div>
                    <span className="text-2xl font-bold">{inProgressOrders}</span>
                  </div>
                  <Progress value={(inProgressOrders / Math.max(totalWorkOrders, 1)) * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <span>Completadas</span>
                    </div>
                    <span className="text-2xl font-bold">{completedOrders}</span>
                  </div>
                  <Progress value={(completedOrders / Math.max(totalWorkOrders, 1)) * 100} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Equipment Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Equipos por Industria</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(equipmentByIndustry).map(([industry, count]) => (
                      <div key={industry} className="flex justify-between items-center">
                        <span className="capitalize">{industry}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={(count / totalEquipment) * 100} className="w-20" />
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Equipos por Criticidad</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(equipmentByCriticality).map(([criticality, count]) => (
                      <div key={criticality} className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Badge className={getCriticalityColor(criticality as Equipment['criticality'])}>
                            {criticality}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={(count / totalEquipment) * 100} className="w-20" />
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Últimas 5 órdenes de trabajo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentWorkOrders.map((wo) => {
                    const equipment_name = equipment.find(eq => eq.id === wo.equipmentId)?.name || 'N/A';
                    return (
                      <div key={wo.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{equipment_name}</p>
                          <p className="text-sm text-muted-foreground">{wo.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={wo.type === 'Emergency' ? 'bg-red-500' : wo.type === 'Corrective' ? 'bg-orange-500' : 'bg-blue-500'}>
                            {wo.type}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">{wo.createdDate ? formatDate(wo.createdDate) : 'N/A'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {dashboardConfig.showReliability && (
          <TabsContent value="reliability" className="space-y-4">
            {/* Critical Equipment Alert */}
            {criticalEquipment.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atención:</strong> {criticalEquipment.length} equipos requieren atención prioritaria por baja disponibilidad o criticidad alta.
                </AlertDescription>
              </Alert>
            )}

            {/* Reliability Metrics Table */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Confiabilidad por Equipo</CardTitle>
                <CardDescription>MTBF: Tiempo Medio Entre Fallas, MTTR: Tiempo Medio de Reparación</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reliabilityMetrics.map((rm) => (
                    <div key={rm.equipment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{rm.equipment.name}</h4>
                          <p className="text-sm text-muted-foreground">{rm.equipment.type} - {rm.equipment.location}</p>
                        </div>
                        <Badge className={getCriticalityColor(rm.equipment.criticality)}>
                          {rm.equipment.criticality}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium">MTBF</p>
                          <p className="text-lg">{rm.mtbf > 0 ? `${rm.mtbf.toFixed(1)} hrs` : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">MTTR</p>
                          <p className="text-lg">{rm.mttr > 0 ? `${rm.mttr.toFixed(1)} hrs` : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Disponibilidad</p>
                          <p className={`text-lg font-bold ${getAvailabilityColor(rm.availability)}`}>
                            {rm.availability.toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <Progress value={rm.availability} className="mt-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {dashboardConfig.showCosts && (
          <TabsContent value="costs" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Costo por Tipo de Mantenimiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(costByType).map(([type, cost]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="font-medium">{type}</span>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(cost)}</p>
                          <p className="text-sm text-muted-foreground">
                            {((cost / totalCost) * 100).toFixed(1)}% del total
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Costos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Costo Total</span>
                      <span className="text-lg font-bold">{formatCurrency(totalCost)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Costo Promedio por Orden</span>
                      <span className="text-lg font-bold">{formatCurrency(avgCostPerOrder)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Órdenes Completadas</span>
                      <span className="text-lg font-bold">{completedOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Costo por Equipo</span>
                      <span className="text-lg font-bold">
                        {formatCurrency(totalEquipment > 0 ? totalCost / totalEquipment : 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* Nueva pestaña de KPIs Personalizados */}
        <TabsContent value="kpis" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Indicadores Personalizados</h3>
              <p className="text-sm text-muted-foreground">
                Todos los KPIs e indicadores creados en Gestión de Campos
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2"
            >
              <Activity className="h-4 w-4" />
              <span>Actualizar KPIs</span>
            </Button>
          </div>

          {customKPIs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {customKPIs.map((kpi, index) => (
                <Card key={`kpi-detail-${kpi.id || index}`} className="border-2 border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-purple-500" />
                      <span>{kpi.label}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{kpi.type}</Badge>
                      {kpi.name.toLowerCase().includes('oee') && (
                        <Badge className="bg-blue-100 text-blue-800">OEE</Badge>
                      )}
                      {kpi.name.toLowerCase().includes('kpi') && (
                        <Badge className="bg-green-100 text-green-800">KPI</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-3xl font-bold text-purple-600">
                          {kpi.defaultValue || kpi.value || '0'}
                          {kpi.name.toLowerCase().includes('oee') && '%'}
                          {kpi.name.toLowerCase().includes('ratio') && '%'}
                        </p>
                        <p className="text-sm text-muted-foreground">Valor actual</p>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Nombre del campo:</span>
                          <span className="font-medium">{kpi.name}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">Requerido:</span>
                          <span className={kpi.required ? 'text-red-600' : 'text-green-600'}>
                            {kpi.required ? 'Sí' : 'No'}
                          </span>
                        </div>
                        {kpi.validation && (
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-muted-foreground">Rango:</span>
                            <span className="font-medium">
                              {kpi.validation.min || 0} - {kpi.validation.max || '∞'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <Badge 
                          className={`${!kpi.isSystem ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                        >
                          {!kpi.isSystem ? 'Activo' : 'Sistema'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ID: {kpi.id}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="pt-6 pb-6">
                <div className="text-center space-y-4">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">No hay KPIs personalizados</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Ve a <strong>Gestión de Campos → Dashboard</strong> para crear nuevos indicadores
                    </p>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Crea campos de tipo "number" para indicadores numéricos</p>
                    <p>• Usa nombres como "OEE", "KPI_Ventas", "Indicador_Calidad"</p>
                    <p>• Los campos aparecerán automáticamente aquí</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Información de debug */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm">Información de Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>Total KPIs encontrados: {customKPIs.length}</p>
                <p>Última actualización: {new Date().toLocaleTimeString()}</p>
                <p>Storage key: custom_fields_config</p>
                {customKPIs.length > 0 && (
                  <div className="mt-2">
                    <p>KPIs detectados:</p>
                    <ul className="list-disc list-inside ml-2">
                      {customKPIs.map((kpi, index) => (
                        <li key={index}>{kpi.name} ({kpi.label})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {dashboardConfig.showTrends && (
          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{preventiveRatio.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">Ratio Preventivo/Correctivo</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Últimos 30 días</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{recentOrders.length}</p>
                      <p className="text-sm text-muted-foreground">Órdenes Recientes</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Últimos 30 días</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    {preventiveRatio > 70 ? (
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-500" />
                    )}
                    <div>
                      <p className="text-2xl font-bold">
                        {preventiveRatio > 70 ? 'Buena' : preventiveRatio > 50 ? 'Regular' : 'Mala'}
                      </p>
                      <p className="text-sm text-muted-foreground">Tendencia Preventiva</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recomendaciones Estratégicas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {avgAvailability < 95 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        La disponibilidad promedio ({avgAvailability.toFixed(1)}%) está por debajo del objetivo (95%). 
                        Considera incrementar las actividades preventivas.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {preventiveRatio < 70 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        El ratio preventivo/correctivo ({preventiveRatio.toFixed(1)}%) es bajo. 
                        Implementa más mantenimientos preventivos para reducir fallas.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {criticalEquipment.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {criticalEquipment.length} equipos críticos requieren atención inmediata. 
                        Revisa los planes de mantenimiento para estos equipos.
                      </AlertDescription>
                    </Alert>
                  )}

                  {Object.keys(costByType).length > 0 && costByType['Corrective'] > (costByType['Preventive'] || 0) && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Los costos correctivos superan a los preventivos. 
                        Aumenta la inversión en mantenimiento preventivo para reducir costos totales.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}