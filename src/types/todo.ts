export type EnergyLevel = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  energyLevel: EnergyLevel;
  estimatedMinutes: number;
  isCompleted: boolean;
  isFocused: boolean;
  createdAt: number;
}
