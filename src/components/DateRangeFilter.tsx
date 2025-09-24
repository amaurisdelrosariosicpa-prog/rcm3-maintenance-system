import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, X } from 'lucide-react';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear: () => void;
  onApply: () => void;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  onApply
}: DateRangeFilterProps) {
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtrar por fechas:</span>
          </div>
          
          <div className="flex-1 min-w-32">
            <Label htmlFor="start-date" className="text-xs">Fecha inicio</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex-1 min-w-32">
            <Label htmlFor="end-date" className="text-xs">Fecha fin</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={onApply} size="sm">
              Aplicar
            </Button>
            <Button onClick={onClear} variant="outline" size="sm">
              <X className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}