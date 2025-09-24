# RCM3 Maintenance Management System - MVP

## Core Features to Implement

### 1. Equipment Registry (src/components/EquipmentRegistry.tsx)
- Equipment registration form with technical specifications
- Equipment list with search and filter capabilities
- Equipment criticality assessment
- Installation date and operational time tracking

### 2. RCM3 Analysis Module (src/components/RCM3Analysis.tsx)
- Equipment criticality evaluation matrix
- Failure mode identification by equipment type
- Failure mode evaluation and assessment
- Preventive actions generation
- Industry-specific templates (industrial, hotel, automotive, aeronautical)

### 3. Work Order Management (src/components/WorkOrderManagement.tsx)
- Work order creation and tracking
- Maintenance type classification (preventive, corrective, predictive)
- Root cause analysis for breakdown maintenance
- Maintenance routines management

### 4. Strategic Dashboard (src/components/Dashboard.tsx)
- Key performance indicators (KPIs)
- Equipment reliability metrics
- Maintenance cost analysis
- Failure trend analysis
- Charts and visualizations

### 5. Data Export (src/components/DataExport.tsx)
- Power BI compatible data export
- Excel format export
- JSON/CSV export options

### 6. Main Application Structure
- src/App.tsx - Updated routing
- src/pages/Index.tsx - Main dashboard page
- src/lib/rcm3-data.ts - RCM3 methodology data and templates
- src/lib/maintenance-utils.ts - Utility functions
- index.html - Updated title and metadata

## File Structure
1. src/components/EquipmentRegistry.tsx
2. src/components/RCM3Analysis.tsx  
3. src/components/WorkOrderManagement.tsx
4. src/components/Dashboard.tsx
5. src/components/DataExport.tsx
6. src/lib/rcm3-data.ts
7. src/lib/maintenance-utils.ts
8. src/pages/Index.tsx (rewrite)

Total: 8 files (within limit)