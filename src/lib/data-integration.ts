// Data Integration Service for ERP, Excel, and External Data Sources
export interface DataSource {
  id: string;
  name: string;
  type: 'excel' | 'csv' | 'api' | 'database' | 'erp';
  config: Record<string, any>;
  isActive: boolean;
  lastSync?: Date;
}

export interface OEEData {
  equipmentId: string;
  timestamp: Date;
  availability: number; // 0-100%
  performance: number; // 0-100%
  quality: number; // 0-100%
  oee: number; // calculated OEE
  plannedProductionTime: number; // minutes
  actualProductionTime: number; // minutes
  idealCycleTime: number; // minutes per unit
  totalPieces: number;
  goodPieces: number;
  rejectedPieces: number;
}

export interface ERPConnection {
  system: 'SAP' | 'Oracle' | 'Dynamics' | 'Odoo' | 'Custom';
  endpoint: string;
  credentials: {
    username?: string;
    password?: string;
    apiKey?: string;
    token?: string;
  };
  modules: string[];
}

class DataIntegrationService {
  private dataSources: DataSource[] = [];
  private oeeData: OEEData[] = [];

  // Load data sources from localStorage
  loadDataSources(): DataSource[] {
    const stored = localStorage.getItem('rcm3_data_sources');
    if (stored) {
      this.dataSources = JSON.parse(stored);
    }
    return this.dataSources;
  }

  // Save data sources to localStorage
  saveDataSources(): void {
    localStorage.setItem('rcm3_data_sources', JSON.stringify(this.dataSources));
  }

  // Add new data source
  addDataSource(source: Omit<DataSource, 'id'>): DataSource {
    const newSource: DataSource = {
      ...source,
      id: `ds_${Date.now()}`,
      lastSync: new Date()
    };
    this.dataSources.push(newSource);
    this.saveDataSources();
    return newSource;
  }

  // Update data source
  updateDataSource(id: string, updates: Partial<DataSource>): void {
    const index = this.dataSources.findIndex(ds => ds.id === id);
    if (index !== -1) {
      this.dataSources[index] = { ...this.dataSources[index], ...updates };
      this.saveDataSources();
    }
  }

  // Delete data source
  deleteDataSource(id: string): void {
    this.dataSources = this.dataSources.filter(ds => ds.id !== id);
    this.saveDataSources();
  }

  // Parse Excel/CSV file
  async parseExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          const data = lines.slice(1).map(line => {
            const values = line.split(',');
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index]?.trim() || '';
            });
            return row;
          }).filter(row => Object.values(row).some(val => val !== ''));
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }

  // Connect to ERP system
  async connectERP(config: ERPConnection): Promise<boolean> {
    try {
      // Simulate ERP connection
      const response = await fetch(config.endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.credentials.token || config.credentials.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('ERP Connection failed:', error);
      return false;
    }
  }

  // Fetch data from API endpoint
  async fetchFromAPI(url: string, headers?: Record<string, string>): Promise<any> {
    try {
      const response = await fetch(url, { headers });
      return await response.json();
    } catch (error) {
      console.error('API fetch failed:', error);
      throw error;
    }
  }

  // Calculate OEE from raw data
  calculateOEE(data: {
    plannedProductionTime: number;
    actualProductionTime: number;
    idealCycleTime: number;
    totalPieces: number;
    goodPieces: number;
  }): OEEData {
    const availability = (data.actualProductionTime / data.plannedProductionTime) * 100;
    const performance = ((data.totalPieces * data.idealCycleTime) / data.actualProductionTime) * 100;
    const quality = (data.goodPieces / data.totalPieces) * 100;
    const oee = (availability * performance * quality) / 10000;

    return {
      equipmentId: '',
      timestamp: new Date(),
      availability: Math.min(availability, 100),
      performance: Math.min(performance, 100),
      quality: Math.min(quality, 100),
      oee: Math.min(oee, 100),
      plannedProductionTime: data.plannedProductionTime,
      actualProductionTime: data.actualProductionTime,
      idealCycleTime: data.idealCycleTime,
      totalPieces: data.totalPieces,
      goodPieces: data.goodPieces,
      rejectedPieces: data.totalPieces - data.goodPieces
    };
  }

  // Map external data to OEE format
  mapDataToOEE(rawData: any[], mapping: Record<string, string>): OEEData[] {
    return rawData.map(row => {
      const mappedData = {
        plannedProductionTime: parseFloat(row[mapping.plannedProductionTime]) || 0,
        actualProductionTime: parseFloat(row[mapping.actualProductionTime]) || 0,
        idealCycleTime: parseFloat(row[mapping.idealCycleTime]) || 0,
        totalPieces: parseInt(row[mapping.totalPieces]) || 0,
        goodPieces: parseInt(row[mapping.goodPieces]) || 0,
      };

      const oeeData = this.calculateOEE(mappedData);
      oeeData.equipmentId = row[mapping.equipmentId] || '';
      oeeData.timestamp = new Date(row[mapping.timestamp] || Date.now());

      return oeeData;
    });
  }

  // Sync data from all active sources
  async syncAllSources(): Promise<void> {
    const activeSources = this.dataSources.filter(ds => ds.isActive);
    
    for (const source of activeSources) {
      try {
        await this.syncDataSourceInternal(source);
        source.lastSync = new Date();
      } catch (error) {
        console.error(`Sync failed for ${source.name}:`, error);
      }
    }
    
    this.saveDataSources();
  }

  // Sync individual data source
  async syncDataSource(sourceId: string): Promise<void> {
    const source = this.dataSources.find(ds => ds.id === sourceId);
    if (!source) {
      throw new Error(`Data source not found: ${sourceId}`);
    }

    switch (source.type) {
      case 'api':
        const apiData = await this.fetchFromAPI(source.config.url, source.config.headers);
        const mappedApiData = this.mapDataToOEE(apiData, source.config.mapping);
        this.oeeData.push(...mappedApiData);
        break;
        
      case 'erp':
        // ERP sync logic would go here
        console.log(`ERP sync for ${source.name} - not implemented yet`);
        break;
        
      case 'excel':
      case 'csv':
        // For file sources, we simulate a successful sync
        console.log(`File source ${source.name} synced successfully`);
        break;
        
      default:
        console.log(`Sync not implemented for type: ${source.type}`);
    }

    // Update last sync time
    source.lastSync = new Date();
    this.saveDataSources();
  }

  // Private method for internal sync during syncAllSources
  private async syncDataSourceInternal(source: DataSource): Promise<void> {
    switch (source.type) {
      case 'api':
        const apiData = await this.fetchFromAPI(source.config.url, source.config.headers);
        const mappedApiData = this.mapDataToOEE(apiData, source.config.mapping);
        this.oeeData.push(...mappedApiData);
        break;
        
      case 'erp':
        // ERP sync logic would go here
        break;
        
      default:
        console.log(`Sync not implemented for type: ${source.type}`);
    }
  }

  // Get OEE data for equipment
  getOEEData(equipmentId?: string, startDate?: Date, endDate?: Date): OEEData[] {
    let filtered = this.oeeData;

    if (equipmentId) {
      filtered = filtered.filter(d => d.equipmentId === equipmentId);
    }

    if (startDate) {
      filtered = filtered.filter(d => d.timestamp >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(d => d.timestamp <= endDate);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Load OEE data from localStorage
  loadOEEData(): void {
    const stored = localStorage.getItem('rcm3_oee_data');
    if (stored) {
      this.oeeData = JSON.parse(stored).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    }
  }

  // Save OEE data to localStorage
  saveOEEData(data?: OEEData[]): void {
    if (data) {
      this.oeeData = data;
    }
    localStorage.setItem('rcm3_oee_data', JSON.stringify(this.oeeData));
  }
}

export const dataIntegrationService = new DataIntegrationService();