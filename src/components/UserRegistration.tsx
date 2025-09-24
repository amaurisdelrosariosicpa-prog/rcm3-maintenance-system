import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Shield, CheckCircle, ArrowLeft } from 'lucide-react';

interface RegistrationRequest {
  name: string;
  email: string;
  department: string;
  requestedRole: string;
  justification: string;
  phone?: string;
  supervisor?: string;
}

export default function UserRegistration() {
  const [formData, setFormData] = useState<RegistrationRequest>({
    name: '',
    email: '',
    department: '',
    requestedRole: 'Usuario',
    justification: '',
    phone: '',
    supervisor: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.department || !formData.justification) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    // Save registration request to localStorage for admin review
    const requests = JSON.parse(localStorage.getItem('rcm3_registration_requests') || '[]');
    const newRequest = {
      ...formData,
      id: `req-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    
    requests.push(newRequest);
    localStorage.setItem('rcm3_registration_requests', JSON.stringify(requests));
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-green-800">¡Solicitud Enviada!</h2>
            <p className="text-muted-foreground">
              Tu solicitud de acceso ha sido enviada al administrador del sistema. 
              Recibirás una notificación cuando sea procesada.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Detalles de tu solicitud:</p>
              <div className="text-sm text-left bg-gray-50 p-3 rounded">
                <p><strong>Nombre:</strong> {formData.name}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Departamento:</strong> {formData.department}</p>
                <p><strong>Rol solicitado:</strong> {formData.requestedRole}</p>
              </div>
            </div>
            <Button onClick={() => window.close()} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Sistema RCM3
          </h1>
          <p className="text-muted-foreground">
            Solicitud de Acceso - Registro de Nuevo Usuario
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Solicitar Acceso al Sistema</span>
            </CardTitle>
            <CardDescription>
              Completa el formulario para solicitar acceso al Sistema RCM3. Un administrador revisará tu solicitud.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Juan Pérez García"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Corporativo *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan.perez@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Departamento *</Label>
                  <Input
                    id="department"
                    type="text"
                    placeholder="Mantenimiento, Operaciones, etc."
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requestedRole">Rol Solicitado *</Label>
                  <Select 
                    value={formData.requestedRole} 
                    onValueChange={(value) => setFormData({ ...formData, requestedRole: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Usuario">Usuario - Acceso básico</SelectItem>
                      <SelectItem value="Técnico">Técnico - Gestión de órdenes</SelectItem>
                      <SelectItem value="Supervisor">Supervisor - Gestión completa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supervisor">Supervisor Directo</Label>
                  <Input
                    id="supervisor"
                    type="text"
                    placeholder="Nombre del supervisor"
                    value={formData.supervisor}
                    onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="justification">Justificación del Acceso *</Label>
                <Textarea
                  id="justification"
                  placeholder="Explica por qué necesitas acceso al sistema y cómo lo utilizarás en tu trabajo..."
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => window.close()}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Enviar Solicitud
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h4 className="font-semibold text-blue-800">Información Importante</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Tu solicitud será revisada por un administrador del sistema</p>
                <p>• Recibirás una notificación por email cuando sea procesada</p>
                <p>• El acceso será otorgado según las políticas de la empresa</p>
                <p>• Los campos marcados con * son obligatorios</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}