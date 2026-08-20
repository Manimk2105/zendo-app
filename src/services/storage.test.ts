import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage } from './storage';
import { type Task } from '../types/todo';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

describe('Storage Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return an empty array if no tasks exist', () => {
    const tasks = storage.getTasks();
    expect(tasks).toEqual([]);
  });

  it('should save and retrieve tasks successfully', () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Complete purecode assignment',
        energyLevel: 'high',
        estimatedMinutes: 30,
        isCompleted: false,
        isFocused: false,
        createdAt: Date.now()
      }
    ];

    storage.saveTasks(mockTasks);
    const retrievedTasks = storage.getTasks();
    expect(retrievedTasks).toEqual(mockTasks);
    expect(retrievedTasks[0].title).toBe('Complete purecode assignment');
  });

  it('should return an empty array if no focus history exists', () => {
    const history = storage.getHistory();
    expect(history).toEqual([]);
  });
});
