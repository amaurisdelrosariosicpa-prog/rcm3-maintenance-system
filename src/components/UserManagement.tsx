import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  Plus, 
  Edit,
  Trash2,
  Save,
  Shield,
  User,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { AuthService, User as UserType, moduleDefinitions } from '@/lib/auth';

interface UserManagementProps {
  currentUser: UserType;
}

export default function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newUser, setNewUser] = useState<Partial<UserType>>({
    role: 'Usuario',
    isActive: true,
    allowedModules: ['dashboard', 'user-workspace']
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = AuthService.getUsers();
    setUsers(allUsers);
  };

  const handleCreateUser = () => {
    if (!newUser.username || !newUser.password || !newUser.name || !newUser.email) {
      return;
    }

    try {
      const createdUser = AuthService.createUser({
        username: newUser.username!,
        password: newUser.password!,
        name: newUser.name!,
        email: newUser.email!,
        role: newUser.role as UserType['role'],
        department: newUser.department || '',
        isActive: newUser.isActive || true,
        allowedModules: newUser.allowedModules || ['dashboard', 'user-workspace']
      });

      loadUsers();
      setShowAddForm(false);
      setNewUser({
        role: 'Usuario',
        isActive: true,
        allowedModules: ['dashboard', 'user-workspace']
      });
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;

    try {
      AuthService.updateUser(selectedUser.id, selectedUser);
      loadUsers();
      setShowEditForm(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
      alert('No puedes eliminar tu propia cuenta');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      AuthService.deleteUser(userId);
      loadUsers();
    }
  };

  const handleModuleAccessChange = (userId: string, moduleId: string, hasAccess: boolean) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    let updatedModules = [...user.allowedModules];
    
    if (hasAccess && !updatedModules.includes(moduleId)) {
      updatedModules.push(moduleId);
    } else if (!hasAccess && updatedModules.includes(moduleId)) {
      updatedModules = updatedModules.filter(m => m !== moduleId);
    }

    AuthService.updateUserModuleAccess(userId, updatedModules);
    loadUsers();
  };

  const getRoleColor = (role: UserType['role']) => {
    switch (role) {
      case 'Administrador': return 'bg-red-500';
      case 'Supervisor': return 'bg-blue-500';
      case 'Técnico': return 'bg-green-500';
      case 'Usuario': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getDefaultModulesForRole = (role: UserType['role']): string[] => {
    switch (role) {
      case 'Administrador':
        return moduleDefinitions.map(m => m.id);
      case 'Supervisor':
        return ['dashboard', 'equipment', 'workorders', 'scheduling', 'technician', 'inventory', 'user-workspace', 'export'];
      case 'Técnico':
        return ['dashboard', 'workorders', 'technician', 'inventory', 'user-workspace'];
      case 'Usuario':
        return ['dashboard', 'user-workspace'];
      default:
        return ['dashboard'];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">Administra usuarios y permisos de acceso</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="permissions">Permisos por Módulo</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Add User Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Crear Nuevo Usuario</CardTitle>
                <CardDescription>Completa la información del nuevo usuario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre de Usuario</Label>
                    <Input
                      value={newUser.username || ''}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      placeholder="usuario123"
                    />
                  </div>
                  <div>
                    <Label>Contraseña</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={newUser.password || ''}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Contraseña segura"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Nombre Completo</Label>
                    <Input
                      value={newUser.name || ''}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newUser.email || ''}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="juan@empresa.com"
                    />
                  </div>
                  <div>
                    <Label>Rol</Label>
                    <Select 
                      value={newUser.role} 
                      onValueChange={(value) => {
                        const role = value as UserType['role'];
                        setNewUser({ 
                          ...newUser, 
                          role,
                          allowedModules: getDefaultModulesForRole(role)
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Usuario">Usuario</SelectItem>
                        <SelectItem value="Técnico">Técnico</SelectItem>
                        <SelectItem value="Supervisor">Supervisor</SelectItem>
                        <SelectItem value="Administrador">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Departamento</Label>
                    <Input
                      value={newUser.department || ''}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      placeholder="Mantenimiento"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Módulos Permitidos</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {moduleDefinitions.map(module => (
                      <div key={module.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`new-${module.id}`}
                          checked={newUser.allowedModules?.includes(module.id) || false}
                          onCheckedChange={(checked) => {
                            const currentModules = newUser.allowedModules || [];
                            const updatedModules = checked
                              ? [...currentModules, module.id]
                              : currentModules.filter(m => m !== module.id);
                            setNewUser({ ...newUser, allowedModules: updatedModules });
                          }}
                        />
                        <Label htmlFor={`new-${module.id}`} className="text-sm">
                          {module.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateUser}>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Usuario
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users List */}
          <div className="space-y-4">
            {users.map(user => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold">{user.name}</h4>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                        <Badge variant="outline">{user.username}</Badge>
                        {user.isActive ? (
                          <Badge className="bg-green-500">Activo</Badge>
                        ) : (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Email:</span>
                          <p>{user.email}</p>
                        </div>
                        <div>
                          <span className="font-medium">Departamento:</span>
                          <p>{user.department || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium">Último acceso:</span>
                          <p>{user.lastLogin?.toLocaleDateString() || 'Nunca'}</p>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <span className="font-medium text-sm">Módulos permitidos:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.allowedModules.map(moduleId => {
                            const module = moduleDefinitions.find(m => m.id === moduleId);
                            return (
                              <Badge key={moduleId} variant="outline" className="text-xs">
                                {module?.name || moduleId}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.id !== currentUser.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Permisos por Módulo</CardTitle>
              <CardDescription>Gestiona el acceso de cada usuario a los módulos del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold">Usuario</th>
                      {moduleDefinitions.map(module => (
                        <th key={module.id} className="text-center p-2 font-semibold text-xs">
                          {module.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.role}</p>
                          </div>
                        </td>
                        {moduleDefinitions.map(module => (
                          <td key={module.id} className="text-center p-2">
                            <Checkbox
                              checked={user.allowedModules.includes(module.id)}
                              onCheckedChange={(checked) => 
                                handleModuleAccessChange(user.id, module.id, checked as boolean)
                              }
                              disabled={user.role === 'Administrador'} // Admin always has access
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Modal */}
      {showEditForm && selectedUser && (
        <Card className="fixed inset-0 z-50 bg-white m-4 overflow-auto">
          <CardHeader>
            <CardTitle>Editar Usuario: {selectedUser.name}</CardTitle>
            <CardDescription>Modifica la información del usuario</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nombre Completo</Label>
                <Input
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Rol</Label>
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(value) => setSelectedUser({ 
                    ...selectedUser, 
                    role: value as UserType['role'] 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Usuario">Usuario</SelectItem>
                    <SelectItem value="Técnico">Técnico</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Departamento</Label>
                <Input
                  value={selectedUser.department}
                  onChange={(e) => setSelectedUser({ ...selectedUser, department: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={selectedUser.isActive}
                onCheckedChange={(checked) => setSelectedUser({ ...selectedUser, isActive: checked })}
              />
              <Label>Usuario Activo</Label>
            </div>

            <div>
              <Label className="text-base font-semibold">Módulos Permitidos</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {moduleDefinitions.map(module => (
                  <div key={module.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${module.id}`}
                      checked={selectedUser.allowedModules.includes(module.id)}
                      onCheckedChange={(checked) => {
                        const updatedModules = checked
                          ? [...selectedUser.allowedModules, module.id]
                          : selectedUser.allowedModules.filter(m => m !== module.id);
                        setSelectedUser({ ...selectedUser, allowedModules: updatedModules });
                      }}
                    />
                    <Label htmlFor={`edit-${module.id}`} className="text-sm">
                      {module.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateUser}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}