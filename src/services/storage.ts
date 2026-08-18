import { type Task, type FocusSession } from '../types/todo';

const STORAGE_KEY = 'zendo_tasks';
const HISTORY_KEY = 'zendo_focus_history';

export const storage = {
  getTasks: (): Task[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load tasks', error);
      return [];
    }
  },
  
  saveTasks: (tasks: Task[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks', error);
    }
  },

  getHistory: (): FocusSession[] => {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load focus history', error);
      return [];
    }
  },

  saveHistory: (sessions: FocusSession[]): void => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save focus history', error);
    }
  }
};
