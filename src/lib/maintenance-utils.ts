import { Equipment, WorkOrder, FailureMode } from './rcm3-data';

export const generateEquipmentId = (): string => {
  return 'EQ-' + Date.now().toString(36).toUpperCase();
};

export const generateWorkOrderId = (): string => {
  return 'WO-' + Date.now().toString(36).toUpperCase();
};

export const calculateMTBF = (workOrders: WorkOrder[], equipmentId: string): number => {
  const equipmentOrders = workOrders.filter(wo => 
    wo.equipmentId === equipmentId && wo.type === 'Corrective' && wo.status === 'Completed'
  );
  
  if (equipmentOrders.length < 2) return 0;
  
  const totalTime = equipmentOrders.reduce((acc, wo, index) => {
    if (index === 0) return acc;
    const prevOrder = equipmentOrders[index - 1];
    const timeDiff = wo.createdDate.getTime() - prevOrder.createdDate.getTime();
    return acc + timeDiff;
  }, 0);
  
  return totalTime / (equipmentOrders.length - 1) / (1000 * 60 * 60); // Hours
};

export const calculateMTTR = (workOrders: WorkOrder[], equipmentId: string): number => {
  const equipmentOrders = workOrders.filter(wo => 
    wo.equipmentId === equipmentId && wo.status === 'Completed' && wo.completedDate
  );
  
  if (equipmentOrders.length === 0) return 0;
  
  const totalRepairTime = equipmentOrders.reduce((acc, wo) => {
    if (!wo.completedDate) return acc;
    const repairTime = wo.completedDate.getTime() - wo.createdDate.getTime();
    return acc + repairTime;
  }, 0);
  
  return totalRepairTime / equipmentOrders.length / (1000 * 60 * 60); // Hours
};

export const calculateAvailability = (mtbf: number, mttr: number): number => {
  if (mtbf + mttr === 0) return 100;
  return (mtbf / (mtbf + mttr)) * 100;
};

export const getMaintenanceCostByType = (workOrders: WorkOrder[]): Record<string, number> => {
  return workOrders.reduce((acc, wo) => {
    acc[wo.type] = (acc[wo.type] || 0) + wo.cost;
    return acc;
  }, {} as Record<string, number>);
};

export const getEquipmentsByIndustry = (equipment: Equipment[]): Record<string, number> => {
  return equipment.reduce((acc, eq) => {
    acc[eq.industry] = (acc[eq.industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

export const exportToCSV = (data: Record<string, unknown>[], filename: string): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const exportToPowerBI = (data: Record<string, unknown>): string => {
  // Format data for Power BI consumption
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    data: data,
    metadata: {
      source: 'RCM3 Maintenance System',
      version: '1.0'
    }
  }, null, 2);
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};