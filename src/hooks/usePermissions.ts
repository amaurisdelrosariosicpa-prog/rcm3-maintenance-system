import { useState, useEffect } from 'react';
import { AuthService } from '@/lib/auth';

export interface PermissionsHook {
  isAdmin: () => boolean;
  canEditEquipment: () => boolean;
  canEditWorkOrders: () => boolean;
  canEditDashboard: () => boolean;
  canEditInventory: () => boolean;
  canEditScheduling: () => boolean;
  canViewReports: () => boolean;
  canManageUsers: () => boolean;
}

export function usePermissions(): PermissionsHook {
  const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const isAdmin = (): boolean => {
    return currentUser?.role === 'Administrador' || currentUser?.role === 'admin';
  };

  const canEditEquipment = (): boolean => {
    if (!currentUser) return false;
    return ['Administrador', 'admin', 'Supervisor', 'supervisor'].includes(currentUser.role);
  };

  const canEditWorkOrders = (): boolean => {
    if (!currentUser) return false;
    return ['Administrador', 'admin', 'Supervisor', 'supervisor', 'Técnico', 'technician'].includes(currentUser.role);
  };

  const canEditDashboard = (): boolean => {
    return isAdmin();
  };

  const canEditInventory = (): boolean => {
    return isAdmin();
  };

  const canEditScheduling = (): boolean => {
    return isAdmin();
  };

  const canViewReports = (): boolean => {
    if (!currentUser) return false;
    return ['Administrador', 'admin', 'Supervisor', 'supervisor'].includes(currentUser.role);
  };

  const canManageUsers = (): boolean => {
    return isAdmin();
  };

  return {
    isAdmin,
    canEditEquipment,
    canEditWorkOrders,
    canEditDashboard,
    canEditInventory,
    canEditScheduling,
    canViewReports,
    canManageUsers
  };
}