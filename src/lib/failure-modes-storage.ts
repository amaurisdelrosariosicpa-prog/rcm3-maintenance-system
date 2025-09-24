// Failure Modes Storage and Management
import { FailureMode, failureModesDatabase } from './rcm3-data';

export class FailureModesStorage {
  private static STORAGE_KEY = 'rcm3_failure_modes';
  private static CUSTOM_STORAGE_KEY = 'rcm3_custom_failure_modes';

  // Get all failure modes (default + custom)
  static getAllFailureModes(): Record<string, FailureMode[]> {
    const defaultModes = this.getDefaultFailureModes();
    const customModes = this.getCustomFailureModes();
    
    // Merge default and custom modes
    const allModes: Record<string, FailureMode[]> = { ...defaultModes };
    
    Object.keys(customModes).forEach(equipmentType => {
      if (allModes[equipmentType]) {
        allModes[equipmentType] = [...allModes[equipmentType], ...customModes[equipmentType]];
      } else {
        allModes[equipmentType] = customModes[equipmentType];
      }
    });
    
    return allModes;
  }

  // Get default failure modes from database
  static getDefaultFailureModes(): Record<string, FailureMode[]> {
    // Return the imported default database
    return failureModesDatabase;
  }

  // Get custom failure modes from localStorage
  static getCustomFailureModes(): Record<string, FailureMode[]> {
    const stored = localStorage.getItem(this.CUSTOM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  // Save custom failure modes
  static saveCustomFailureModes(customModes: Record<string, FailureMode[]>): void {
    localStorage.setItem(this.CUSTOM_STORAGE_KEY, JSON.stringify(customModes));
  }

  // Add a new failure mode
  static addFailureMode(equipmentType: string, failureMode: FailureMode): void {
    const customModes = this.getCustomFailureModes();
    
    if (!customModes[equipmentType]) {
      customModes[equipmentType] = [];
    }
    
    customModes[equipmentType].push(failureMode);
    this.saveCustomFailureModes(customModes);
  }

  // Update an existing failure mode
  static updateFailureMode(equipmentType: string, failureModeId: string, updatedMode: FailureMode): void {
    const customModes = this.getCustomFailureModes();
    
    if (customModes[equipmentType]) {
      const index = customModes[equipmentType].findIndex(fm => fm.id === failureModeId);
      if (index !== -1) {
        customModes[equipmentType][index] = updatedMode;
        this.saveCustomFailureModes(customModes);
      }
    }
  }

  // Delete a failure mode
  static deleteFailureMode(equipmentType: string, failureModeId: string): void {
    const customModes = this.getCustomFailureModes();
    
    if (customModes[equipmentType]) {
      customModes[equipmentType] = customModes[equipmentType].filter(fm => fm.id !== failureModeId);
      
      if (customModes[equipmentType].length === 0) {
        delete customModes[equipmentType];
      }
      
      this.saveCustomFailureModes(customModes);
    }
  }

  // Reset to factory defaults (admin only)
  static resetToFactoryDefaults(): void {
    localStorage.removeItem(this.CUSTOM_STORAGE_KEY);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Export all failure modes
  static exportFailureModes(): string {
    const allModes = this.getAllFailureModes();
    return JSON.stringify(allModes, null, 2);
  }

  // Import failure modes
  static importFailureModes(jsonData: string): boolean {
    try {
      const importedModes = JSON.parse(jsonData);
      this.saveCustomFailureModes(importedModes);
      return true;
    } catch (error) {
      console.error('Error importing failure modes:', error);
      return false;
    }
  }

  // Get failure modes for specific equipment type
  static getFailureModesForEquipment(equipmentType: string): FailureMode[] {
    const allModes = this.getAllFailureModes();
    return allModes[equipmentType] || [];
  }

  // Search failure modes by description or cause
  static searchFailureModes(query: string): FailureMode[] {
    const allModes = this.getAllFailureModes();
    const results: FailureMode[] = [];
    
    Object.values(allModes).forEach(modes => {
      modes.forEach(mode => {
        if (
          mode.description.toLowerCase().includes(query.toLowerCase()) ||
          mode.causes.some(cause => cause.toLowerCase().includes(query.toLowerCase())) ||
          mode.effects.some(effect => effect.toLowerCase().includes(query.toLowerCase()))
        ) {
          results.push(mode);
        }
      });
    });
    
    return results;
  }

  // Get statistics about failure modes
  static getStatistics(): {
    totalEquipmentTypes: number;
    totalFailureModes: number;
    customFailureModes: number;
    defaultFailureModes: number;
  } {
    const allModes = this.getAllFailureModes();
    const customModes = this.getCustomFailureModes();
    const defaultModes = this.getDefaultFailureModes();
    
    const totalFailureModes = Object.values(allModes).reduce((sum, modes) => sum + modes.length, 0);
    const customFailureModesCount = Object.values(customModes).reduce((sum, modes) => sum + modes.length, 0);
    const defaultFailureModesCount = Object.values(defaultModes).reduce((sum, modes) => sum + modes.length, 0);
    
    return {
      totalEquipmentTypes: Object.keys(allModes).length,
      totalFailureModes,
      customFailureModes: customFailureModesCount,
      defaultFailureModes: defaultFailureModesCount
    };
  }
}