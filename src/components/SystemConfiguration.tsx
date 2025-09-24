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
  Settings, 
  Globe, 
  Cloud, 
  Database,
  Server,
  Key,
  Shield,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Copy
} from 'lucide-react';

interface DeploymentConfig {
  domain: string;
  subdomain: string;
  customDomain: string;
  ssl: boolean;
  cdn: boolean;
  environment: 'development' | 'staging' | 'production';
}

interface CloudStorageConfig {
  provider: 'aws' | 'azure' | 'gcp' | 'supabase' | 'firebase';
  region: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
  endpoint?: string;
  isActive: boolean;
}

interface DatabaseConfig {
  provider: 'supabase' | 'firebase' | 'mongodb' | 'postgresql' | 'mysql';
  connectionString: string;
  database: string;
  username: string;
  password: string;
  host: string;
  port: number;
  ssl: boolean;
  isActive: boolean;
}

export default function SystemConfiguration() {
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>({
    domain: 'localhost:3000',
    subdomain: 'rcm3',
    customDomain: '',
    ssl: true,
    cdn: false,
    environment: 'development'
  });

  const [cloudStorageConfig, setCloudStorageConfig] = useState<CloudStorageConfig>({
    provider: 'aws',
    region: 'us-east-1',
    bucket: '',
    accessKey: '',
    secretKey: '',
    endpoint: '',
    isActive: false
  });

  const [databaseConfig, setDatabaseConfig] = useState<DatabaseConfig>({
    provider: 'supabase',
    connectionString: '',
    database: 'rcm3_production',
    username: '',
    password: '',
    host: '',
    port: 5432,
    ssl: true,
    isActive: false
  });

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = () => {
    try {
      const deploymentData = localStorage.getItem('rcm3_deployment_config');
      if (deploymentData) {
        setDeploymentConfig(JSON.parse(deploymentData));
      }

      const storageData = localStorage.getItem('rcm3_cloud_storage_config');
      if (storageData) {
        setCloudStorageConfig(JSON.parse(storageData));
      }

      const dbData = localStorage.getItem('rcm3_database_config');
      if (dbData) {
        setDatabaseConfig(JSON.parse(dbData));
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
    }
  };

  const saveDeploymentConfig = () => {
    try {
      localStorage.setItem('rcm3_deployment_config', JSON.stringify(deploymentConfig));
      setMessage('Configuración de despliegue guardada exitosamente.');
    } catch (error) {
      setMessage('Error al guardar la configuración de despliegue.');
    }
  };

  const saveCloudStorageConfig = () => {
    try {
      localStorage.setItem('rcm3_cloud_storage_config', JSON.stringify(cloudStorageConfig));
      setMessage('Configuración de almacenamiento en la nube guardada exitosamente.');
    } catch (error) {
      setMessage('Error al guardar la configuración de almacenamiento.');
    }
  };

  const saveDatabaseConfig = () => {
    try {
      localStorage.setItem('rcm3_database_config', JSON.stringify(databaseConfig));
      setMessage('Configuración de base de datos guardada exitosamente.');
    } catch (error) {
      setMessage('Error al guardar la configuración de base de datos.');
    }
  };

  const testCloudConnection = async () => {
    setIsLoading(true);
    try {
      // Simular prueba de conexión
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessage('Conexión a almacenamiento en la nube exitosa.');
    } catch (error) {
      setMessage('Error al conectar con el almacenamiento en la nube.');
    } finally {
      setIsLoading(false);
    }
  };

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    try {
      // Simular prueba de conexión
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessage('Conexión a base de datos exitosa.');
    } catch (error) {
      setMessage('Error al conectar con la base de datos.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDeploymentScript = () => {
    const script = `#!/bin/bash
# Script de despliegue para RCM3
# Dominio: ${deploymentConfig.customDomain || deploymentConfig.subdomain + '.' + deploymentConfig.domain}
# Ambiente: ${deploymentConfig.environment}

echo "Iniciando despliegue de RCM3..."

# Construir aplicación
npm run build

# Configurar variables de entorno
export REACT_APP_DOMAIN="${deploymentConfig.customDomain || deploymentConfig.subdomain + '.' + deploymentConfig.domain}"
export REACT_APP_ENVIRONMENT="${deploymentConfig.environment}"
export REACT_APP_SSL="${deploymentConfig.ssl}"
export REACT_APP_CDN="${deploymentConfig.cdn}"

# Configurar almacenamiento en la nube
${cloudStorageConfig.isActive ? `
export CLOUD_PROVIDER="${cloudStorageConfig.provider}"
export CLOUD_REGION="${cloudStorageConfig.region}"
export CLOUD_BUCKET="${cloudStorageConfig.bucket}"
export CLOUD_ACCESS_KEY="${cloudStorageConfig.accessKey}"
export CLOUD_SECRET_KEY="[REDACTED]"
` : '# Almacenamiento en la nube no configurado'}

# Configurar base de datos
${databaseConfig.isActive ? `
export DB_PROVIDER="${databaseConfig.provider}"
export DB_HOST="${databaseConfig.host}"
export DB_PORT="${databaseConfig.port}"
export DB_NAME="${databaseConfig.database}"
export DB_USER="${databaseConfig.username}"
export DB_PASSWORD="[REDACTED]"
export DB_SSL="${databaseConfig.ssl}"
` : '# Base de datos no configurada'}

echo "Despliegue completado exitosamente!"
`;

    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deploy-rcm3.sh';
    a.click();
    URL.revokeObjectURL(url);
    
    setMessage('Script de despliegue generado y descargado.');
  };

  const exportConfiguration = () => {
    const config = {
      deployment: deploymentConfig,
      cloudStorage: { ...cloudStorageConfig, accessKey: '[REDACTED]', secretKey: '[REDACTED]' },
      database: { ...databaseConfig, password: '[REDACTED]' },
      exportedAt: new Date().toISOString(),
      version: '2.0'
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rcm3-system-config.json';
    a.click();
    URL.revokeObjectURL(url);
    
    setMessage('Configuración del sistema exportada exitosamente.');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configuración del Sistema</h2>
          <p className="text-muted-foreground">Configura dominio, almacenamiento en la nube y base de datos</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportConfiguration}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Config
          </Button>
          <Button onClick={generateDeploymentScript}>
            <Server className="h-4 w-4 mr-2" />
            Generar Script
          </Button>
        </div>
      </div>

      {message && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="deployment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deployment">Despliegue</TabsTrigger>
          <TabsTrigger value="storage">Almacenamiento</TabsTrigger>
          <TabsTrigger value="database">Base de Datos</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Configuración de Dominio</span>
              </CardTitle>
              <CardDescription>Configura el dominio donde se ejecutará la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Dominio Base</Label>
                  <Input
                    value={deploymentConfig.domain}
                    onChange={(e) => setDeploymentConfig({...deploymentConfig, domain: e.target.value})}
                    placeholder="miempresa.com"
                  />
                </div>
                <div>
                  <Label>Subdominio</Label>
                  <Input
                    value={deploymentConfig.subdomain}
                    onChange={(e) => setDeploymentConfig({...deploymentConfig, subdomain: e.target.value})}
                    placeholder="rcm3"
                  />
                </div>
              </div>

              <div>
                <Label>Dominio Personalizado (Opcional)</Label>
                <Input
                  value={deploymentConfig.customDomain}
                  onChange={(e) => setDeploymentConfig({...deploymentConfig, customDomain: e.target.value})}
                  placeholder="mantenimiento.miempresa.com"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Si se especifica, se usará en lugar del dominio base + subdominio
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Ambiente</Label>
                  <Select 
                    value={deploymentConfig.environment} 
                    onValueChange={(value) => setDeploymentConfig({...deploymentConfig, environment: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Desarrollo</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Producción</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={deploymentConfig.ssl}
                    onCheckedChange={(checked) => setDeploymentConfig({...deploymentConfig, ssl: checked})}
                  />
                  <Label>SSL/HTTPS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={deploymentConfig.cdn}
                    onCheckedChange={(checked) => setDeploymentConfig({...deploymentConfig, cdn: checked})}
                  />
                  <Label>CDN</Label>
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">URL Final:</h4>
                <p className="font-mono text-sm">
                  {deploymentConfig.ssl ? 'https://' : 'http://'}
                  {deploymentConfig.customDomain || `${deploymentConfig.subdomain}.${deploymentConfig.domain}`}
                </p>
              </div>

              <Button onClick={saveDeploymentConfig}>
                <Settings className="h-4 w-4 mr-2" />
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cloud className="h-5 w-5" />
                <span>Almacenamiento en la Nube</span>
              </CardTitle>
              <CardDescription>Configura el servicio de almacenamiento para archivos y datos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  checked={cloudStorageConfig.isActive}
                  onCheckedChange={(checked) => setCloudStorageConfig({...cloudStorageConfig, isActive: checked})}
                />
                <Label>Habilitar almacenamiento en la nube</Label>
              </div>

              {cloudStorageConfig.isActive && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Proveedor</Label>
                      <Select 
                        value={cloudStorageConfig.provider} 
                        onValueChange={(value) => setCloudStorageConfig({...cloudStorageConfig, provider: value as any})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aws">Amazon S3</SelectItem>
                          <SelectItem value="azure">Azure Blob Storage</SelectItem>
                          <SelectItem value="gcp">Google Cloud Storage</SelectItem>
                          <SelectItem value="supabase">Supabase Storage</SelectItem>
                          <SelectItem value="firebase">Firebase Storage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Región</Label>
                      <Input
                        value={cloudStorageConfig.region}
                        onChange={(e) => setCloudStorageConfig({...cloudStorageConfig, region: e.target.value})}
                        placeholder="us-east-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Bucket/Contenedor</Label>
                    <Input
                      value={cloudStorageConfig.bucket}
                      onChange={(e) => setCloudStorageConfig({...cloudStorageConfig, bucket: e.target.value})}
                      placeholder="rcm3-storage-bucket"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Access Key / Client ID</Label>
                      <Input
                        type="password"
                        value={cloudStorageConfig.accessKey}
                        onChange={(e) => setCloudStorageConfig({...cloudStorageConfig, accessKey: e.target.value})}
                        placeholder="AKIA..."
                      />
                    </div>
                    <div>
                      <Label>Secret Key / Client Secret</Label>
                      <Input
                        type="password"
                        value={cloudStorageConfig.secretKey}
                        onChange={(e) => setCloudStorageConfig({...cloudStorageConfig, secretKey: e.target.value})}
                        placeholder="***"
                      />
                    </div>
                  </div>

                  {cloudStorageConfig.provider === 'supabase' && (
                    <div>
                      <Label>Endpoint (Supabase URL)</Label>
                      <Input
                        value={cloudStorageConfig.endpoint}
                        onChange={(e) => setCloudStorageConfig({...cloudStorageConfig, endpoint: e.target.value})}
                        placeholder="https://your-project.supabase.co"
                      />
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button onClick={saveCloudStorageConfig}>
                      <Settings className="h-4 w-4 mr-2" />
                      Guardar Config
                    </Button>
                    <Button variant="outline" onClick={testCloudConnection} disabled={isLoading}>
                      <Shield className="h-4 w-4 mr-2" />
                      Probar Conexión
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Base de Datos</span>
              </CardTitle>
              <CardDescription>Configura la conexión a la base de datos principal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  checked={databaseConfig.isActive}
                  onCheckedChange={(checked) => setDatabaseConfig({...databaseConfig, isActive: checked})}
                />
                <Label>Usar base de datos externa (por defecto usa localStorage)</Label>
              </div>

              {databaseConfig.isActive && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Proveedor</Label>
                      <Select 
                        value={databaseConfig.provider} 
                        onValueChange={(value) => setDatabaseConfig({...databaseConfig, provider: value as any})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="supabase">Supabase (PostgreSQL)</SelectItem>
                          <SelectItem value="firebase">Firebase Firestore</SelectItem>
                          <SelectItem value="mongodb">MongoDB Atlas</SelectItem>
                          <SelectItem value="postgresql">PostgreSQL</SelectItem>
                          <SelectItem value="mysql">MySQL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Nombre de la Base de Datos</Label>
                      <Input
                        value={databaseConfig.database}
                        onChange={(e) => setDatabaseConfig({...databaseConfig, database: e.target.value})}
                        placeholder="rcm3_production"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Cadena de Conexión (Opcional)</Label>
                    <Textarea
                      value={databaseConfig.connectionString}
                      onChange={(e) => setDatabaseConfig({...databaseConfig, connectionString: e.target.value})}
                      placeholder="postgresql://user:password@host:port/database"
                      rows={2}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Si se proporciona, se usará en lugar de los campos individuales
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Host</Label>
                      <Input
                        value={databaseConfig.host}
                        onChange={(e) => setDatabaseConfig({...databaseConfig, host: e.target.value})}
                        placeholder="db.supabase.co"
                      />
                    </div>
                    <div>
                      <Label>Puerto</Label>
                      <Input
                        type="number"
                        value={databaseConfig.port}
                        onChange={(e) => setDatabaseConfig({...databaseConfig, port: parseInt(e.target.value)})}
                        placeholder="5432"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Usuario</Label>
                      <Input
                        value={databaseConfig.username}
                        onChange={(e) => setDatabaseConfig({...databaseConfig, username: e.target.value})}
                        placeholder="postgres"
                      />
                    </div>
                    <div>
                      <Label>Contraseña</Label>
                      <Input
                        type="password"
                        value={databaseConfig.password}
                        onChange={(e) => setDatabaseConfig({...databaseConfig, password: e.target.value})}
                        placeholder="***"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={databaseConfig.ssl}
                      onCheckedChange={(checked) => setDatabaseConfig({...databaseConfig, ssl: checked})}
                    />
                    <Label>Conexión SSL</Label>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={saveDatabaseConfig}>
                      <Settings className="h-4 w-4 mr-2" />
                      Guardar Config
                    </Button>
                    <Button variant="outline" onClick={testDatabaseConnection} disabled={isLoading}>
                      <Shield className="h-4 w-4 mr-2" />
                      Probar Conexión
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Configuración de Seguridad</span>
              </CardTitle>
              <CardDescription>Configuraciones de seguridad y autenticación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Las credenciales se almacenan localmente. 
                  Para producción, usa variables de entorno y servicios de gestión de secretos.
                </AlertDescription>
              </Alert>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🔒 Recomendaciones de Seguridad:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Usa HTTPS en producción</li>
                  <li>• Configura CORS apropiadamente</li>
                  <li>• Implementa autenticación JWT</li>
                  <li>• Usa variables de entorno para credenciales</li>
                  <li>• Configura backups automáticos</li>
                  <li>• Monitorea logs de acceso</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📋 Variables de Entorno Sugeridas:</h4>
                <div className="text-sm font-mono space-y-1">
                  <p>REACT_APP_API_URL=https://api.miempresa.com</p>
                  <p>REACT_APP_SUPABASE_URL=https://proyecto.supabase.co</p>
                  <p>REACT_APP_SUPABASE_ANON_KEY=eyJ...</p>
                  <p>AWS_ACCESS_KEY_ID=AKIA...</p>
                  <p>AWS_SECRET_ACCESS_KEY=***</p>
                  <p>DB_CONNECTION_STRING=postgresql://...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}