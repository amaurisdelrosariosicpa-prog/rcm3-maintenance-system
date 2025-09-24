import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Plus, 
  Minus,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { InventoryItem, StockMovement, sampleInventory, sampleStockMovements } from '@/lib/scheduling-data';
import { formatCurrency, formatDate } from '@/lib/maintenance-utils';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface InventoryManagementProps {}

export default function InventoryManagement(_props: InventoryManagementProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>(sampleInventory);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(sampleStockMovements);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    category: 'Mechanical',
    unitOfMeasure: 'Unidad',
    currentStock: 0,
    minStock: 1,
    maxStock: 10,
    unitCost: 0
  });
  const [newMovement, setNewMovement] = useState<Partial<StockMovement>>({
    type: 'IN',
    quantity: 1,
    reason: ''
  });

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock);
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);
  const totalItems = inventory.reduce((sum, item) => sum + item.currentStock, 0);

  const handleAddItem = () => {
    if (!newItem.name || !newItem.partNumber) {
      return;
    }

    const item: InventoryItem = {
      id: `item-${Date.now()}`,
      partNumber: newItem.partNumber!,
      name: newItem.name!,
      description: newItem.description || '',
      category: newItem.category as InventoryItem['category'],
      unitOfMeasure: newItem.unitOfMeasure!,
      currentStock: newItem.currentStock || 0,
      minStock: newItem.minStock || 1,
      maxStock: newItem.maxStock || 10,
      unitCost: newItem.unitCost || 0,
      supplier: newItem.supplier || '',
      location: newItem.location || '',
      lastUpdated: new Date()
    };

    setInventory([...inventory, item]);
    setNewItem({
      category: 'Mechanical',
      unitOfMeasure: 'Unidad',
      currentStock: 0,
      minStock: 1,
      maxStock: 10,
      unitCost: 0
    });
    setShowAddItemForm(false);
  };

  const handleStockMovement = () => {
    if (!selectedItem || !newMovement.quantity || !newMovement.reason) {
      return;
    }

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      itemId: selectedItem.id,
      type: newMovement.type as StockMovement['type'],
      quantity: newMovement.quantity,
      workOrderId: newMovement.workOrderId,
      reason: newMovement.reason,
      date: new Date(),
      performedBy: 'current-user'
    };

    setStockMovements([movement, ...stockMovements]);

    // Update inventory stock
    const updatedInventory = inventory.map(item => {
      if (item.id === selectedItem.id) {
        const newStock = movement.type === 'IN' 
          ? item.currentStock + movement.quantity
          : movement.type === 'OUT'
          ? Math.max(0, item.currentStock - movement.quantity)
          : movement.quantity; // ADJUSTMENT sets absolute value
        
        return {
          ...item,
          currentStock: newStock,
          lastUpdated: new Date()
        };
      }
      return item;
    });

    setInventory(updatedInventory);
    setNewMovement({
      type: 'IN',
      quantity: 1,
      reason: ''
    });
    setSelectedItem(null);
    setShowMovementForm(false);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock <= item.minStock) {
      return { status: 'low', color: 'bg-red-500', text: 'Stock Bajo' };
    }
    if (item.currentStock >= item.maxStock) {
      return { status: 'high', color: 'bg-orange-500', text: 'Stock Alto' };
    }
    return { status: 'normal', color: 'bg-green-500', text: 'Normal' };
  };

  const getCategoryIcon = (category: InventoryItem['category']) => {
    return <Package className="h-4 w-4" />;
  };

  const categories = ['Mechanical', 'Electrical', 'Hydraulic', 'Pneumatic', 'Chemical', 'Tools', 'Safety'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Inventario</h2>
          <p className="text-muted-foreground">Administra repuestos e insumos de mantenimiento</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowAddItemForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Item
          </Button>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{inventory.length}</p>
                <p className="text-sm text-muted-foreground">Items Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{totalItems}</p>
                <p className="text-sm text-muted-foreground">Unidades en Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{lowStockItems.length}</p>
                <p className="text-sm text-muted-foreground">Stock Bajo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
                <p className="text-sm text-muted-foreground">Valor Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atención:</strong> {lowStockItems.length} items tienen stock bajo y requieren reposición.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o número de parte..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add Item Form */}
          {showAddItemForm && (
            <Card>
              <CardHeader>
                <CardTitle>Agregar Nuevo Item</CardTitle>
                <CardDescription>Registra un nuevo repuesto o insumo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="partNumber">Número de Parte</Label>
                    <Input 
                      value={newItem.partNumber || ''} 
                      onChange={(e) => setNewItem({...newItem, partNumber: e.target.value})}
                      placeholder="Ej: FILTER-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input 
                      value={newItem.name || ''} 
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      placeholder="Ej: Filtro de aceite"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select value={newItem.category} onValueChange={(value) => 
                      setNewItem({...newItem, category: value as InventoryItem['category']})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="unitOfMeasure">Unidad de Medida</Label>
                    <Input 
                      value={newItem.unitOfMeasure || ''} 
                      onChange={(e) => setNewItem({...newItem, unitOfMeasure: e.target.value})}
                      placeholder="Ej: Unidad, Litros, Metros"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitCost">Costo Unitario</Label>
                    <Input 
                      type="number" 
                      value={newItem.unitCost || 0}
                      onChange={(e) => setNewItem({...newItem, unitCost: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier">Proveedor</Label>
                    <Input 
                      value={newItem.supplier || ''} 
                      onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                      placeholder="Nombre del proveedor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="minStock">Stock Mínimo</Label>
                    <Input 
                      type="number" 
                      value={newItem.minStock || 1}
                      onChange={(e) => setNewItem({...newItem, minStock: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxStock">Stock Máximo</Label>
                    <Input 
                      type="number" 
                      value={newItem.maxStock || 10}
                      onChange={(e) => setNewItem({...newItem, maxStock: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Ubicación</Label>
                    <Input 
                      value={newItem.location || ''} 
                      onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                      placeholder="Ej: Almacén A-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea 
                    value={newItem.description || ''} 
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Descripción detallada del item"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddItemForm(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddItem}>
                    Agregar Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stock Movement Form */}
          {showMovementForm && selectedItem && (
            <Card>
              <CardHeader>
                <CardTitle>Movimiento de Stock - {selectedItem.name}</CardTitle>
                <CardDescription>Registra entrada, salida o ajuste de inventario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="movementType">Tipo de Movimiento</Label>
                    <Select value={newMovement.type} onValueChange={(value) => 
                      setNewMovement({...newMovement, type: value as StockMovement['type']})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IN">Entrada</SelectItem>
                        <SelectItem value="OUT">Salida</SelectItem>
                        <SelectItem value="ADJUSTMENT">Ajuste</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Cantidad</Label>
                    <Input 
                      type="number" 
                      value={newMovement.quantity || 1}
                      onChange={(e) => setNewMovement({...newMovement, quantity: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="workOrder">Orden de Trabajo (Opcional)</Label>
                    <Input 
                      value={newMovement.workOrderId || ''} 
                      onChange={(e) => setNewMovement({...newMovement, workOrderId: e.target.value})}
                      placeholder="ID de orden de trabajo"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reason">Motivo</Label>
                  <Textarea 
                    value={newMovement.reason || ''} 
                    onChange={(e) => setNewMovement({...newMovement, reason: e.target.value})}
                    placeholder="Motivo del movimiento"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {
                    setShowMovementForm(false);
                    setSelectedItem(null);
                  }}>
                    Cancelar
                  </Button>
                  <Button onClick={handleStockMovement}>
                    Registrar Movimiento
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inventory Items */}
          <div className="space-y-4">
            {filteredInventory.map(item => {
              const stockStatus = getStockStatus(item);
              
              return (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getCategoryIcon(item.category)}
                          <h4 className="font-semibold">{item.name}</h4>
                          <Badge variant="outline">{item.partNumber}</Badge>
                          <Badge className={stockStatus.color}>
                            {stockStatus.text}
                          </Badge>
                          <Badge variant="outline">{item.category}</Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Stock Actual:</span>
                            <p className="text-lg font-bold">{item.currentStock} {item.unitOfMeasure}</p>
                          </div>
                          <div>
                            <span className="font-medium">Min/Max:</span>
                            <p>{item.minStock} / {item.maxStock}</p>
                          </div>
                          <div>
                            <span className="font-medium">Costo Unit:</span>
                            <p>{formatCurrency(item.unitCost)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Valor Total:</span>
                            <p>{formatCurrency(item.currentStock * item.unitCost)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Ubicación:</span>
                            <p>{item.location || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Proveedor:</span>
                            <p>{item.supplier || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowMovementForm(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Movimiento
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredInventory.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No se encontraron items</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Movimientos</CardTitle>
              <CardDescription>Registro de entradas, salidas y ajustes de inventario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stockMovements.slice(0, 20).map(movement => {
                  const item = inventory.find(i => i.id === movement.itemId);
                  const typeColor = movement.type === 'IN' ? 'bg-green-500' : 
                                   movement.type === 'OUT' ? 'bg-red-500' : 'bg-blue-500';
                  
                  return (
                    <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge className={typeColor}>
                          {movement.type === 'IN' ? 'ENTRADA' : 
                           movement.type === 'OUT' ? 'SALIDA' : 'AJUSTE'}
                        </Badge>
                        <div>
                          <p className="font-medium">{item?.name || 'Item N/A'}</p>
                          <p className="text-sm text-muted-foreground">{movement.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {movement.type === 'OUT' ? '-' : '+'}{movement.quantity} {item?.unitOfMeasure}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(movement.date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Items con Stock Bajo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-medium">{item.name}</span>
                      <Badge className="bg-red-500">
                        {item.currentStock}/{item.minStock}
                      </Badge>
                    </div>
                  ))}
                  {lowStockItems.length === 0 && (
                    <p className="text-muted-foreground text-center">
                      Todos los items tienen stock adecuado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valor por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map(category => {
                    const categoryItems = inventory.filter(item => item.category === category);
                    const categoryValue = categoryItems.reduce((sum, item) => 
                      sum + (item.currentStock * item.unitCost), 0
                    );
                    
                    if (categoryValue === 0) return null;
                    
                    return (
                      <div key={category} className="flex justify-between items-center p-2 border rounded">
                        <span className="font-medium">{category}</span>
                        <span className="font-bold">{formatCurrency(categoryValue)}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}