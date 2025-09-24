import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building, 
  Upload, 
  Save, 
  Cloud, 
  HardDrive,
  Globe,
  Download,
  Settings,
  Database,
  Shield
} from 'lucide-react';

interface CompanyConfig {
  name: string;
  logo: string;
  industry: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  storageProvider: 'local' | 'sharepoint' | 'googledrive' | 'azure' | 'aws';
  storageConfig: {
    endpoint?: string;
    credentials?: string;
    bucket?: string;
  };
  deploymentUrl?: string;
}

export default function CompanySettings() {
  const [config, setConfig] = useState<CompanyConfig>({
    name: 'Mi Empresa',
    logo: '',
    industry: 'industrial',
    address: '',
    phone: '',
    email: '',
    website: '',
    storageProvider: 'local',
    storageConfig: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load existing configuration
    const savedConfig = localStorage.getItem('rcm3_company_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setConfig({ ...config, logo: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsLoading(true);
    localStorage.setItem('rcm3_company_config', JSON.stringify(config));
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setMessage('Configuración guardada exitosamente');
      setTimeout(() => setMessage(''), 3000);
    }, 1000);
  };

  const handleExportApp = () => {
    // Create downloadable package
    const appData = {
      config,
      users: localStorage.getItem('rcm3_users'),
      equipment: localStorage.getItem('rcm3_equipment'),
      workOrders: localStorage.getItem('rcm3_work_orders'),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rcm3-app-${config.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateDeploymentUrl = () => {
    const baseUrl = window.location.origin;
    const companySlug = config.name.toLowerCase().replace(/\s+/g, '-');
    const deploymentUrl = `${baseUrl}/${companySlug}`;
    setConfig({ ...config, deploymentUrl });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configuración de Empresa</h2>
        <p className="text-muted-foreground">Personaliza la aplicación para tu organización</p>
      </div>

      {message && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Información de la Empresa</span>
            </CardTitle>
            <CardDescription>Configura los datos básicos de tu organización</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nombre de la Empresa</Label>
              <Input
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="Mi Empresa S.A."
              />
            </div>

            <div>
              <Label>Logo de la Empresa</Label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {config.logo && (
                  <div className="flex items-center space-x-2">
                    <img src={config.logo} alt="Logo" className="w-12 h-12 object-cover rounded" />
                    <span className="text-sm text-muted-foreground">Logo cargado</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Industria</Label>
              <Select value={config.industry} onValueChange={(value) => setConfig({ ...config, industry: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="servicio">Servicio</SelectItem>
                  <SelectItem value="salud">Salud</SelectItem>
                  <SelectItem value="educacion">Educación</SelectItem>
                  <SelectItem value="minero">Minero</SelectItem>
                  <SelectItem value="logistica">Logística</SelectItem>
                  <SelectItem value="comercio">Comercio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Dirección</Label>
              <Textarea
                value={config.address}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                placeholder="Dirección completa de la empresa"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Teléfono</Label>
                <Input
                  value={config.phone}
                  onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  placeholder="contacto@empresa.com"
                />
              </div>
            </div>

            <div>
              <Label>Sitio Web</Label>
              <Input
                value={config.website}
                onChange={(e) => setConfig({ ...config, website: e.target.value })}
                placeholder="https://www.empresa.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cloud Storage Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cloud className="h-5 w-5" />
              <span>Almacenamiento en la Nube</span>
            </CardTitle>
            <CardDescription>Configura dónde se guardarán los datos del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Proveedor de Almacenamiento</Label>
              <Select 
                value={config.storageProvider} 
                onValueChange={(value) => setConfig({ 
                  ...config, 
                  storageProvider: value as CompanyConfig['storageProvider'] 
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="w-4 h-4" />
                      <span>Almacenamiento Local</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="sharepoint">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4" />
                      <span>Microsoft SharePoint</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="googledrive">
                    <div className="flex items-center space-x-2">
                      <Cloud className="w-4 h-4" />
                      <span>Google Drive</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="azure">
                    <div className="flex items-center space-x-2">
                      <Cloud className="w-4 h-4" />
                      <span>Azure Blob Storage</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="aws">
                    <div className="flex items-center space-x-2">
                      <Cloud className="w-4 h-4" />
                      <span>Amazon S3</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.storageProvider !== 'local' && (
              <>
                <div>
                  <Label>Endpoint/URL del Servicio</Label>
                  <Input
                    value={config.storageConfig.endpoint || ''}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      storageConfig: { ...config.storageConfig, endpoint: e.target.value }
                    })}
                    placeholder={
                      config.storageProvider === 'sharepoint' ? 'https://empresa.sharepoint.com' :
                      config.storageProvider === 'azure' ? 'https://cuenta.blob.core.windows.net' :
                      config.storageProvider === 'aws' ? 'https://s3.region.amazonaws.com' :
                      'URL del servicio'
                    }
                  />
                </div>

                <div>
                  <Label>Credenciales/Token de Acceso</Label>
                  <Input
                    type="password"
                    value={config.storageConfig.credentials || ''}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      storageConfig: { ...config.storageConfig, credentials: e.target.value }
                    })}
                    placeholder="Token de acceso o credenciales"
                  />
                </div>

                <div>
                  <Label>Contenedor/Bucket</Label>
                  <Input
                    value={config.storageConfig.bucket || ''}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      storageConfig: { ...config.storageConfig, bucket: e.target.value }
                    })}
                    placeholder="Nombre del contenedor o bucket"
                  />
                </div>
              </>
            )}

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Proveedor actual:</strong> {
                  config.storageProvider === 'local' ? 'Almacenamiento Local (navegador)' :
                  config.storageProvider === 'sharepoint' ? 'Microsoft SharePoint' :
                  config.storageProvider === 'googledrive' ? 'Google Drive' :
                  config.storageProvider === 'azure' ? 'Azure Blob Storage' :
                  config.storageProvider === 'aws' ? 'Amazon S3' : 'No configurado'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Opciones de Despliegue</span>
          </CardTitle>
          <CardDescription>Configura cómo se desplegará la aplicación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>URL de Despliegue</Label>
              <div className="flex space-x-2">
                <Input
                  value={config.deploymentUrl || ''}
                  onChange={(e) => setConfig({ ...config, deploymentUrl: e.target.value })}
                  placeholder="https://mi-empresa.rcm3.app"
                />
                <Button variant="outline" onClick={generateDeploymentUrl}>
                  Generar
                </Button>
              </div>
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleExportApp} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Descargar App Completa
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-center space-y-2">
                <HardDrive className="h-8 w-8 mx-auto text-blue-500" />
                <h4 className="font-semibold">Aplicación Local</h4>
                <p className="text-sm text-muted-foreground">Descarga para usar sin internet</p>
                <Button size="sm" variant="outline" onClick={handleExportApp}>
                  Descargar
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center space-y-2">
                <Globe className="h-8 w-8 mx-auto text-green-500" />
                <h4 className="font-semibold">Google Sites</h4>
                <p className="text-sm text-muted-foreground">Publica en Google Sites</p>
                <Button size="sm" variant="outline" disabled>
                  Próximamente
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center space-y-2">
                <Cloud className="h-8 w-8 mx-auto text-purple-500" />
                <h4 className="font-semibold">Hosting en la Nube</h4>
                <p className="text-sm text-muted-foreground">Despliega en servicios cloud</p>
                <Button size="sm" variant="outline" disabled>
                  Próximamente
                </Button>
              </div>
            </Card>
          </div>

          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <strong>Instrucciones de despliegue:</strong>
              <br />1. Descarga la aplicación completa usando el botón "Descargar App Completa"
              <br />2. El archivo descargado contiene toda la configuración y datos
              <br />3. Para usar en otra computadora, simplemente abre el archivo index.html
              <br />4. Para despliegue web, sube los archivos a tu servicio de hosting preferido
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Settings className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Configuración
            </>
          )}
        </Button>
      </div>
    </div>
  );
}