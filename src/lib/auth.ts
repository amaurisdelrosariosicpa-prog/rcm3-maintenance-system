// Authentication and Authorization System

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Supervisor' | 'Técnico' | 'Usuario';
  department: string;
  isActive: boolean;
  allowedModules: string[];
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  error: string | null;
}

// Default users with predefined credentials
export const defaultUsers: User[] = [
  {
    id: 'admin-001',
    username: 'admin',
    password: '@Ruth080703',
    name: 'Administrador Principal',
    email: 'admin@empresa.com',
    role: 'Administrador',
    department: 'Administración',
    isActive: true,
    allowedModules: ['dashboard', 'equipment', 'rcm3', 'workorders', 'scheduling', 'technician', 'inventory', 'user-workspace', 'field-manager', 'config', 'export'],
    createdAt: new Date('2024-01-01'),
    lastLogin: undefined
  },
  {
    id: 'supervisor-001',
    username: 'supervisor',
    password: 'supervisor123',
    name: 'Juan Pérez',
    email: 'juan.perez@empresa.com',
    role: 'Supervisor',
    department: 'Mantenimiento',
    isActive: true,
    allowedModules: ['dashboard', 'equipment', 'workorders', 'scheduling', 'technician', 'inventory', 'user-workspace', 'export'],
    createdAt: new Date('2024-01-15'),
    lastLogin: undefined
  },
  {
    id: 'technician-001',
    username: 'tecnico',
    password: 'tecnico123',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@empresa.com',
    role: 'Técnico',
    department: 'Mantenimiento Mecánico',
    isActive: true,
    allowedModules: ['dashboard', 'workorders', 'technician', 'inventory', 'user-workspace'],
    createdAt: new Date('2024-02-01'),
    lastLogin: undefined
  },
  {
    id: 'user-001',
    username: 'usuario',
    password: 'usuario123',
    name: 'María González',
    email: 'maria.gonzalez@empresa.com',
    role: 'Usuario',
    department: 'Operaciones',
    isActive: true,
    allowedModules: ['dashboard', 'user-workspace'],
    createdAt: new Date('2024-02-15'),
    lastLogin: undefined
  }
];

// Module definitions with permissions
export const moduleDefinitions = [
  { id: 'dashboard', name: 'Dashboard', description: 'Panel principal con métricas y KPIs', icon: 'BarChart3', requiredRole: 'Usuario' },
  { id: 'equipment', name: 'Equipos', description: 'Gestión de equipos y activos', icon: 'Wrench', requiredRole: 'Supervisor' },
  { id: 'rcm3', name: 'Análisis RCM3', description: 'Análisis de confiabilidad y AMEF', icon: 'Settings', requiredRole: 'Supervisor' },
  { id: 'failure-modes', name: 'Modos de Falla', description: 'Gestión de modos de falla por equipo', icon: 'AlertTriangle', requiredRole: 'Supervisor' },
  { id: 'workorders', name: 'Órdenes de Trabajo', description: 'Gestión de órdenes de mantenimiento', icon: 'FileText', requiredRole: 'Técnico' },
  { id: 'scheduling', name: 'Programación', description: 'Programación automática de mantenimiento', icon: 'Calendar', requiredRole: 'Supervisor' },
  { id: 'technician', name: 'Mi Trabajo', description: 'Espacio de trabajo para técnicos', icon: 'User', requiredRole: 'Técnico' },
  { id: 'inventory', name: 'Inventario', description: 'Gestión de repuestos e inventario', icon: 'Package', requiredRole: 'Técnico' },
  { id: 'user-workspace', name: 'Usuario', description: 'Espacio de usuario para solicitudes', icon: 'Users', requiredRole: 'Usuario' },
  { id: 'field-manager', name: 'Gestión de Campos', description: 'Administración de campos personalizados', icon: 'Settings', requiredRole: 'Administrador' },
  { id: 'data-integration', name: 'Integración de Datos', description: 'Conectar ERP, Excel y fuentes externas', icon: 'Database', requiredRole: 'Administrador' },
  { id: 'config', name: 'Configuración', description: 'Configuración del sistema', icon: 'Settings', requiredRole: 'Administrador' },
  { id: 'system-settings', name: 'Sistema', description: 'Configuración avanzada del sistema', icon: 'Monitor', requiredRole: 'Administrador' },
  { id: 'export', name: 'Exportar', description: 'Exportación de datos y reportes', icon: 'Download', requiredRole: 'Supervisor' }
];

// Authentication functions
export class AuthService {
  private static STORAGE_KEY = 'rcm3_auth_state';
  private static USERS_KEY = 'rcm3_users';

  static getUsers(): User[] {
    const stored = localStorage.getItem(this.USERS_KEY);
    if (stored) {
      return JSON.parse(stored).map((user: User) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
      }));
    }
    // Initialize with default users
    this.saveUsers(defaultUsers);
    return defaultUsers;
  }

  static saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  static login(username: string, password: string): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.isActive);
    
    if (!user) {
      return { success: false, error: 'Usuario no encontrado o inactivo' };
    }
    
    if (user.password !== password) {
      return { success: false, error: 'Contraseña incorrecta' };
    }
    
    // Update last login
    user.lastLogin = new Date();
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    this.saveUsers(updatedUsers);
    
    // Save auth state
    const authState: AuthState = {
      isAuthenticated: true,
      currentUser: user,
      error: null
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authState));
    
    return { success: true, user };
  }

  static logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static getCurrentUser(): User | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const authState: AuthState = JSON.parse(stored);
      if (authState.isAuthenticated && authState.currentUser) {
        return {
          ...authState.currentUser,
          createdAt: new Date(authState.currentUser.createdAt),
          lastLogin: authState.currentUser.lastLogin ? new Date(authState.currentUser.lastLogin) : undefined
        };
      }
    }
    return null;
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  static hasModuleAccess(moduleId: string, user?: User): boolean {
    const currentUser = user || this.getCurrentUser();
    if (!currentUser) return false;
    
    // Admin has access to all modules
    if (currentUser.role === 'Administrador') return true;
    
    return currentUser.allowedModules.includes(moduleId);
  }

  static updateUserModuleAccess(userId: string, allowedModules: string[]): boolean {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return false;
    
    users[userIndex].allowedModules = allowedModules;
    this.saveUsers(users);
    
    // Update current session if it's the same user
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const authState: AuthState = {
        isAuthenticated: true,
        currentUser: { ...currentUser, allowedModules },
        error: null
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authState));
    }
    
    return true;
  }

  static createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    
    // Check if username already exists
    if (users.find(u => u.username === userData.username)) {
      throw new Error('El nombre de usuario ya existe');
    }

    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
      throw new Error('El email ya está registrado');
    }

    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date()
    };
    
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  static updateUser(userId: string, updates: Partial<User>): boolean {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return false;
    
    users[userIndex] = { ...users[userIndex], ...updates };
    this.saveUsers(users);
    return true;
  }

  static deleteUser(userId: string): boolean {
    const users = this.getUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    
    if (filteredUsers.length === users.length) return false;
    
    this.saveUsers(filteredUsers);
    return true;
  }
}

// Role hierarchy for access control
export const roleHierarchy = {
  'Usuario': 1,
  'Técnico': 2,
  'Supervisor': 3,
  'Administrador': 4
};

export function hasRoleAccess(userRole: string, requiredRole: string): boolean {
  return roleHierarchy[userRole as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole as keyof typeof roleHierarchy];
}