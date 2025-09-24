import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  Wrench, 
  Settings, 
  FileText, 
  Calendar,
  User,
  Package,
  Users,
  Download,
  Menu,
  X,
  LogOut,
  Building,
  ChevronDown,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { AuthService, User as AuthUser, moduleDefinitions } from '@/lib/auth';

interface SidebarProps {
  currentUser: AuthUser;
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
  onLogout: () => void;
  companyLogo?: string;
}

const moduleIcons = {
  dashboard: BarChart3,
  equipment: Wrench,
  rcm3: Settings,
  'failure-modes': AlertTriangle,
  workorders: FileText,
  scheduling: Calendar,
  technician: User,
  inventory: Package,
  'user-workspace': Users,
  config: Settings,
  'system-settings': Settings,
  export: Download
};

export default function Sidebar({ currentUser, activeModule, onModuleChange, onLogout, companyLogo }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);

  const availableModules = moduleDefinitions.filter(module => 
    AuthService.hasModuleAccess(module.id, currentUser)
  );

  const getRoleColor = (role: AuthUser['role']) => {
    switch (role) {
      case 'Administrador': return 'bg-red-500';
      case 'Supervisor': return 'bg-blue-500';
      case 'Técnico': return 'bg-green-500';
      case 'Usuario': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const configSubModules = [
    { id: 'work-orders', name: 'Órdenes de Trabajo', icon: FileText },
    { id: 'admin', name: 'Administración', icon: Settings },
    { id: 'users', name: 'Gestión de Usuarios', icon: Users }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white border-r shadow-lg z-40 transition-transform duration-300
        ${isCollapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
        ${isCollapsed ? 'md:w-16' : 'w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              {companyLogo ? (
                <img 
                  src={companyLogo} 
                  alt="Logo" 
                  className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} rounded object-cover`}
                />
              ) : (
                <Building className={`${isCollapsed ? 'w-6 h-6' : 'w-8 h-8'} text-blue-600`} />
              )}
              {!isCollapsed && (
                <div>
                  <h2 className="font-bold text-lg text-blue-600">RCM3</h2>
                  <p className="text-xs text-muted-foreground">Sistema de Mantenimiento</p>
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{currentUser.name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={`${getRoleColor(currentUser.role)} text-xs`}>
                      {currentUser.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{currentUser.department}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {availableModules.map(module => {
                const Icon = moduleIcons[module.id as keyof typeof moduleIcons] || Settings;
                
                if (module.id === 'config') {
                  return (
                    <div key={module.id}>
                      <Button
                        variant={activeModule === module.id ? "default" : "ghost"}
                        className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'}`}
                        onClick={() => {
                          setIsConfigExpanded(!isConfigExpanded);
                          onModuleChange(module.id);
                        }}
                      >
                        <Icon className="w-4 h-4" />
                        {!isCollapsed && (
                          <>
                            <span className="ml-2 flex-1 text-left">{module.name}</span>
                            {isConfigExpanded ? 
                              <ChevronDown className="w-4 h-4" /> : 
                              <ChevronRight className="w-4 h-4" />
                            }
                          </>
                        )}
                      </Button>
                      
                      {!isCollapsed && isConfigExpanded && (
                        <div className="ml-6 mt-1 space-y-1">
                          {configSubModules.map(subModule => {
                            const SubIcon = subModule.icon;
                            return (
                              <Button
                                key={subModule.id}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-sm"
                                onClick={() => onModuleChange(`config-${subModule.id}`)}
                              >
                                <SubIcon className="w-3 h-3" />
                                <span className="ml-2">{subModule.name}</span>
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                
                return (
                  <Button
                    key={module.id}
                    variant={activeModule === module.id ? "default" : "ghost"}
                    className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'}`}
                    onClick={() => onModuleChange(module.id)}
                  >
                    <Icon className="w-4 h-4" />
                    {!isCollapsed && <span className="ml-2">{module.name}</span>}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className={`w-full ${isCollapsed ? 'px-2' : 'px-3'}`}
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span className="ml-2">Cerrar Sesión</span>}
            </Button>
            
            {!isCollapsed && (
              <div className="mt-2 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(true)}
                  className="text-xs"
                >
                  Contraer menú
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}