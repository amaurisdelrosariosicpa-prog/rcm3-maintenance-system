import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Settings, 
  ArrowUp, 
  ArrowDown, 
  Lock,
  AlertTriangle,
  Info
} from 'lucide-react';
import { FieldManager as FM, CustomField, ModuleFields } from '@/lib/field-manager';
import { usePermissions } from '@/hooks/usePermissions';

export default function FieldManager() {
  const { isAdmin } = usePermissions();
  const [fieldsConfig, setFieldsConfig] = useState<ModuleFields>(FM.getFieldsConfig());
  const [activeModule, setActiveModule] = useState<keyof ModuleFields>('equipment');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: 'text' as CustomField['type'],
    required: false,
    placeholder: '',
    options: '',
    defaultValue: '',
    validationMin: '',
    validationMax: '',
    validationPattern: '',
    validationMessage: ''
  });

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Acceso Restringido</h3>
          <p className="text-muted-foreground">Solo los administradores pueden gestionar campos personalizados.</p>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({
      name: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      options: '',
      defaultValue: '',
      validationMin: '',
      validationMax: '',
      validationPattern: '',
      validationMessage: ''
    });
    setEditingField(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const fieldData: Omit<CustomField, 'id' | 'isSystem'> = {
      name: formData.name,
      label: formData.label,
      type: formData.type,
      required: formData.required,
      placeholder: formData.placeholder || undefined,
      options: formData.options ? formData.options.split(',').map(o => o.trim()) : undefined,
      defaultValue: formData.defaultValue || undefined,
      validation: {
        min: formData.validationMin ? Number(formData.validationMin) : undefined,
        max: formData.validationMax ? Number(formData.validationMax) : undefined,
        pattern: formData.validationPattern || undefined,
        message: formData.validationMessage || undefined
      },
      order: fieldsConfig[activeModule].length + 1
    };

    if (editingField) {
      FM.updateField(activeModule, editingField.id, fieldData);
    } else {
      FM.addCustomField(activeModule, fieldData);
    }

    setFieldsConfig(FM.getFieldsConfig());
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (field: CustomField) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      placeholder: field.placeholder || '',
      options: field.options?.join(', ') || '',
      defaultValue: field.defaultValue || '',
      validationMin: field.validation?.min?.toString() || '',
      validationMax: field.validation?.max?.toString() || '',
      validationPattern: field.validation?.pattern || '',
      validationMessage: field.validation?.message || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (fieldId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este campo personalizado?')) {
      FM.deleteCustomField(activeModule, fieldId);
      setFieldsConfig(FM.getFieldsConfig());
    }
  };

  const handleReorder = (fieldId: string, direction: 'up' | 'down') => {
    const fields = fieldsConfig[activeModule];
    const fieldIndex = fields.findIndex(f => f.id === fieldId);
    
    if (fieldIndex === -1) return;
    
    const newIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    
    const reorderedFields = [...fields];
    [reorderedFields[fieldIndex], reorderedFields[newIndex]] = [reorderedFields[newIndex], reorderedFields[fieldIndex]];
    
    const fieldIds = reorderedFields.map(f => f.id);
    FM.reorderFields(activeModule, fieldIds);
    setFieldsConfig(FM.getFieldsConfig());
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝';
      case 'number': return '🔢';
      case 'select': return '📋';
      case 'textarea': return '📄';
      case 'date': return '📅';
      case 'checkbox': return '☑️';
      case 'email': return '📧';
      case 'tel': return '📞';
      default: return '📝';
    }
  };

  const moduleFields = fieldsConfig[activeModule];
  const systemFields = moduleFields.filter(f => f.isSystem);
  const customFields = moduleFields.filter(f => !f.isSystem);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Campos Personalizados</h2>
          <p className="text-muted-foreground">Personaliza los campos de los formularios de cada módulo</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Campo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingField ? 'Editar Campo' : 'Nuevo Campo Personalizado'}</DialogTitle>
              <DialogDescription>
                {editingField ? 'Modifica las propiedades del campo' : 'Crea un nuevo campo para el módulo seleccionado'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Campo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="nombreCampo (sin espacios)"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="label">Etiqueta</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({...formData, label: e.target.value})}
                    placeholder="Etiqueta visible del campo"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo de Campo</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as CustomField['type']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="select">Lista Desplegable</SelectItem>
                      <SelectItem value="textarea">Área de Texto</SelectItem>
                      <SelectItem value="date">Fecha</SelectItem>
                      <SelectItem value="checkbox">Casilla de Verificación</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="tel">Teléfono</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="required"
                    checked={formData.required}
                    onCheckedChange={(checked) => setFormData({...formData, required: checked})}
                  />
                  <Label htmlFor="required">Campo Requerido</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="placeholder">Placeholder</Label>
                <Input
                  id="placeholder"
                  value={formData.placeholder}
                  onChange={(e) => setFormData({...formData, placeholder: e.target.value})}
                  placeholder="Texto de ayuda para el usuario"
                />
              </div>

              {formData.type === 'select' && (
                <div>
                  <Label htmlFor="options">Opciones (separadas por comas)</Label>
                  <Textarea
                    id="options"
                    value={formData.options}
                    onChange={(e) => setFormData({...formData, options: e.target.value})}
                    placeholder="Opción 1, Opción 2, Opción 3"
                    rows={3}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="defaultValue">Valor por Defecto</Label>
                <Input
                  id="defaultValue"
                  value={formData.defaultValue}
                  onChange={(e) => setFormData({...formData, defaultValue: e.target.value})}
                  placeholder="Valor inicial del campo"
                />
              </div>

              {(formData.type === 'number' || formData.type === 'text') && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Validación</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.type === 'number' && (
                      <>
                        <div>
                          <Label htmlFor="validationMin">Valor Mínimo</Label>
                          <Input
                            id="validationMin"
                            type="number"
                            value={formData.validationMin}
                            onChange={(e) => setFormData({...formData, validationMin: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="validationMax">Valor Máximo</Label>
                          <Input
                            id="validationMax"
                            type="number"
                            value={formData.validationMax}
                            onChange={(e) => setFormData({...formData, validationMax: e.target.value})}
                          />
                        </div>
                      </>
                    )}
                    {formData.type === 'text' && (
                      <div className="col-span-2">
                        <Label htmlFor="validationPattern">Patrón (RegEx)</Label>
                        <Input
                          id="validationPattern"
                          value={formData.validationPattern}
                          onChange={(e) => setFormData({...formData, validationPattern: e.target.value})}
                          placeholder="^[A-Z]{2,3}-\d{4}$"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="validationMessage">Mensaje de Error</Label>
                    <Input
                      id="validationMessage"
                      value={formData.validationMessage}
                      onChange={(e) => setFormData({...formData, validationMessage: e.target.value})}
                      placeholder="Mensaje personalizado de error"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingField ? 'Actualizar' : 'Crear'} Campo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeModule} onValueChange={(value) => setActiveModule(value as keyof ModuleFields)}>
        <TabsList>
          <TabsTrigger value="equipment">Equipos</TabsTrigger>
          <TabsTrigger value="workorders">Órdenes de Trabajo</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="scheduling">Programación</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value={activeModule} className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Los campos del sistema (marcados con 🔒) no se pueden eliminar, pero sí se pueden modificar sus propiedades.
              Los campos personalizados se pueden agregar, editar y eliminar libremente.
            </AlertDescription>
          </Alert>

          {/* Campos del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Campos del Sistema</span>
              </CardTitle>
              <CardDescription>
                Campos básicos del módulo que no se pueden eliminar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Requerido</TableHead>
                    <TableHead>Orden</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systemFields.map((field) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{getFieldTypeIcon(field.type)}</span>
                          <div>
                            <div className="font-medium">{field.label}</div>
                            <div className="text-sm text-muted-foreground">{field.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{field.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {field.required ? (
                          <Badge variant="destructive">Requerido</Badge>
                        ) : (
                          <Badge variant="secondary">Opcional</Badge>
                        )}
                      </TableCell>
                      <TableCell>{field.order}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(field)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleReorder(field.id, 'up')}
                            disabled={field.order === 1}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleReorder(field.id, 'down')}
                            disabled={field.order === systemFields.length}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Campos Personalizados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Campos Personalizados</span>
              </CardTitle>
              <CardDescription>
                Campos adicionales creados por los administradores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customFields.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No hay campos personalizados</h3>
                  <p className="text-muted-foreground mb-4">
                    Agrega campos personalizados para adaptar el formulario a tus necesidades
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Campo
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Requerido</TableHead>
                      <TableHead>Orden</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customFields.map((field) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{getFieldTypeIcon(field.type)}</span>
                            <div>
                              <div className="font-medium">{field.label}</div>
                              <div className="text-sm text-muted-foreground">{field.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{field.type}</Badge>
                        </TableCell>
                        <TableCell>
                          {field.required ? (
                            <Badge variant="destructive">Requerido</Badge>
                          ) : (
                            <Badge variant="secondary">Opcional</Badge>
                          )}
                        </TableCell>
                        <TableCell>{field.order}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEdit(field)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleReorder(field.id, 'up')}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleReorder(field.id, 'down')}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDelete(field.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}