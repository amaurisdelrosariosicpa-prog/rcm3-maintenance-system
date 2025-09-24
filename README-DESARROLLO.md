# 🚀 RCM3 Sistema de Mantenimiento - Guía de Desarrollo

## 📋 Descripción
Sistema completo de gestión de mantenimiento con análisis RCM3, desarrollado en React + TypeScript + Vite.

## 🛠️ Tecnologías Utilizadas
- **Frontend:** React 18 + TypeScript
- **UI Components:** Shadcn/ui + Tailwind CSS
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **Icons:** Lucide React
- **Storage:** LocalStorage (navegador)

## 📁 Estructura del Proyecto
```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base Shadcn/ui
│   ├── LoginForm.tsx   # Formulario de login
│   ├── Sidebar.tsx     # Navegación lateral
│   ├── UserManagement.tsx        # Gestión de usuarios
│   ├── UserRegistration.tsx      # Registro de usuarios
│   ├── CompanySettings.tsx       # Configuración empresa
│   └── EquipmentManagement.tsx   # Gestión de equipos
├── lib/                # Librerías y utilidades
│   ├── auth.ts         # Sistema de autenticación
│   ├── rcm3-data.ts    # Datos de órdenes de trabajo
│   ├── maintenance-data.ts  # Estructuras de mantenimiento
│   └── utils.ts        # Utilidades generales
├── pages/              # Páginas principales
│   ├── Index.tsx       # Página principal
│   ├── Register.tsx    # Página de registro
│   └── NotFound.tsx    # Página 404
└── hooks/              # Custom React hooks
```

## 🚀 Instalación y Configuración

### 1. Requisitos Previos
- Node.js 18+ 
- npm o pnpm

### 2. Instalación
```bash
# Descomprimir el archivo ZIP
unzip rcm3-complete-source.zip
cd rcm3-complete-source

# Instalar dependencias
npm install
# o
pnpm install
```

### 3. Comandos Disponibles
```bash
# Desarrollo (servidor local)
npm run dev          # http://localhost:5173

# Construcción para producción
npm run build        # Genera carpeta dist/

# Verificar código
npm run lint         # ESLint + TypeScript

# Vista previa de build
npm run preview      # Previsualiza dist/
```

## 👥 Sistema de Usuarios

### Usuarios Demo Incluidos:
- **Supervisor:** `supervisor` / `supervisor123`
- **Técnico:** `tecnico` / `tecnico123`
- **Usuario:** `usuario` / `usuario123`

### Roles y Permisos:
- **Administrador:** Acceso total + gestión de usuarios
- **Supervisor:** Gestión de equipos, órdenes, programación
- **Técnico:** Órdenes de trabajo, inventario, mi trabajo
- **Usuario:** Dashboard básico, solicitudes

## 📊 Funcionalidades Implementadas

### ✅ Completadas:
1. **Sistema de Autenticación** - Login/logout con roles
2. **Gestión de Usuarios** - CRUD completo (solo admin)
3. **Navegación por Roles** - Sidebar dinámico según permisos
4. **Gestión de Equipos** - Basado en Excel "BD Confiabilidad"
5. **Órdenes de Trabajo** - Sistema básico implementado
6. **Configuración Empresa** - Logo y configuraciones
7. **Registro de Usuarios** - Solicitudes de acceso

### 🔄 En Desarrollo:
- Dashboard con KPIs de mantenimiento
- Calendario de mantenimiento
- Inventario de repuestos
- Análisis de fallas (RCA)
- Reportes y exportación

## 🗄️ Estructura de Datos

### Principales Entidades:
```typescript
// Equipos (basado en Excel)
interface Equipment {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  criticalityLevel: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  status: 'Operativo' | 'Mantenimiento' | 'Fuera de Servicio';
  // ... más campos
}

// Planes de Mantenimiento
interface MaintenancePlan {
  id: string;
  equipmentId: string;
  planType: 'Preventivo' | 'Predictivo' | 'Correctivo';
  frequency: number;
  // ... más campos
}

// Usuarios
interface User {
  id: string;
  username: string;
  role: 'Administrador' | 'Supervisor' | 'Técnico' | 'Usuario';
  allowedModules: string[];
  // ... más campos
}
```

## 🔧 Desarrollo y Personalización

### Agregar Nuevos Módulos:
1. Crear componente en `src/components/`
2. Agregar definición en `src/lib/auth.ts` (moduleDefinitions)
3. Actualizar `src/components/Sidebar.tsx`
4. Configurar permisos por rol

### Modificar Datos:
- **Equipos:** `src/lib/maintenance-data.ts`
- **Usuarios:** `src/lib/auth.ts`
- **Órdenes:** `src/lib/rcm3-data.ts`

### Personalizar UI:
- **Colores:** `tailwind.config.ts`
- **Componentes:** `src/components/ui/`
- **Estilos:** `src/index.css`

## 📱 Despliegue

### Web App (Recomendado):
```bash
npm run build
# Subir carpeta dist/ a servidor web
```

### Aplicación Desktop (Electron):
```bash
npm install electron electron-builder --save-dev
npm run dist
# Genera .exe en electron-dist/
```

## 🐛 Solución de Problemas

### Errores Comunes:
1. **Puerto ocupado:** Cambiar puerto en `vite.config.ts`
2. **Dependencias:** Eliminar `node_modules/` y reinstalar
3. **Build errors:** Ejecutar `npm run lint` para verificar

### Logs y Debug:
- Datos en LocalStorage del navegador
- Console.log en herramientas de desarrollador
- Network tab para verificar recursos

## 📞 Soporte
- **Documentación:** Este archivo README
- **Código:** Comentarios en archivos TypeScript
- **UI:** Componentes Shadcn/ui documentados

## 🔄 Próximas Mejoras Sugeridas
1. **Dashboard de KPIs** - Métricas visuales de mantenimiento
2. **Calendario de Tareas** - Vista temporal de programación
3. **Módulo de Inventario** - Control de stock y repuestos
4. **Análisis de Fallas** - RCA y trending de problemas
5. **Reportes Avanzados** - Exportación PDF/Excel
6. **Integración Backend** - Base de datos real (opcional)

---
**Versión:** 2.0.0  
**Fecha:** Septiembre 2024  
**Desarrollado con:** React + TypeScript + Vite + Shadcn/ui