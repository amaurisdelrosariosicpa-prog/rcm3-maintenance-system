import { useState, useMemo } from 'react';

export interface DateFilterState {
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export function useDateFilter() {
  const [dateFilter, setDateFilter] = useState<DateFilterState>({
    startDate: '',
    endDate: '',
    isActive: false
  });

  const setStartDate = (date: string) => {
    setDateFilter(prev => ({ ...prev, startDate: date }));
  };

  const setEndDate = (date: string) => {
    setDateFilter(prev => ({ ...prev, endDate: date }));
  };

  const applyFilter = () => {
    if (dateFilter.startDate || dateFilter.endDate) {
      setDateFilter(prev => ({ ...prev, isActive: true }));
    }
  };

  const clearFilter = () => {
    setDateFilter({
      startDate: '',
      endDate: '',
      isActive: false
    });
  };

  const filterByDateRange = useMemo(() => {
    return <T extends { createdAt?: Date | string; installationDate?: Date | string; dueDate?: Date | string; timestamp?: Date | string }>(
      items: T[]
    ): T[] => {
      if (!dateFilter.isActive || (!dateFilter.startDate && !dateFilter.endDate)) {
        return items;
      }

      return items.filter(item => {
        // Try different date fields that might exist on the item
        const itemDate = item.createdAt || item.installationDate || item.dueDate || item.timestamp;
        
        if (!itemDate) return true; // Keep items without dates

        const date = typeof itemDate === 'string' ? new Date(itemDate) : itemDate;
        
        if (isNaN(date.getTime())) return true; // Keep items with invalid dates

        const start = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
        const end = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

        if (start && end) {
          return date >= start && date <= end;
        } else if (start) {
          return date >= start;
        } else if (end) {
          return date <= end;
        }

        return true;
      });
    };
  }, [dateFilter]);

  return {
    dateFilter,
    setStartDate,
    setEndDate,
    applyFilter,
    clearFilter,
    filterByDateRange
  };
}