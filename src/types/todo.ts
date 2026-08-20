export type EnergyLevel = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  energyLevel: EnergyLevel;
  estimatedMinutes: number;
  isCompleted: boolean;
  isFocused: boolean;
  isPaused?: boolean;
  createdAt: number;
}

export interface FocusSession {
  id: string;
  taskId: string;
  taskTitle: string;
  energyLevel: EnergyLevel;
  minutesFocused: number;
  completedAt: number;
}

