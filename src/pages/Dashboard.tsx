import { useState, useEffect, useMemo } from 'react';
import { type Task, type EnergyLevel } from '../types/todo';
import { storage } from '../services/storage';
import { TaskForm } from '../components/TaskForm';
import { TaskCard } from '../components/TaskCard';
import { FocusOverlay } from '../components/FocusOverlay';
import { Layout, CheckCircle2, Trophy, BarChart3, ListFilter, Search } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial load
  useEffect(() => {
    setTasks(storage.getTasks());
  }, []);

  // Save on change
  useEffect(() => {
    storage.saveTasks(tasks);
  }, [tasks]);

  const addTask = (data: { title: string; energyLevel: EnergyLevel; estimatedMinutes: number }) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: data.title,
      energyLevel: data.energyLevel,
      estimatedMinutes: data.estimatedMinutes,
      isCompleted: false,
      isFocused: false,
      createdAt: Date.now(),
    };
    setTasks([newTask, ...tasks]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const focusTask = (id: string) => {
    setFocusTaskId(id);
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        const matchesFilter = 
          filter === 'all' ? true :
          filter === 'active' ? !t.isCompleted :
          t.isCompleted;
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [tasks, filter, searchQuery]);

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.isCompleted).length;
    const total = tasks.length;
    const minutesSaved = tasks.filter(t => t.isCompleted).reduce((acc, t) => acc + t.estimatedMinutes, 0);
    return { completed, total, minutesSaved };
  }, [tasks]);

  const focusTaskObj = tasks.find(t => t.id === focusTaskId) || null;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 w-full glass border-b">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">
              ZEN<span className="text-primary">DO</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-slate-500">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border text-xs font-bold uppercase tracking-tighter">
              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
              {stats.completed} Daily Wins
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Stats & Add */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Focus on the <span className="text-gradient">Next Win</span>
              </h2>
              <p className="text-slate-500 font-medium">
                ZenDo helps you manage energy, not just time.
              </p>
            </div>

            <TaskForm onAdd={addTask} />

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl glass border flex flex-col gap-1 shadow-elegant">
                <BarChart3 className="w-5 h-5 text-primary mb-2" />
                <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.minutesSaved}</span>
                <span className="text-xs font-bold text-slate-400 uppercase">Minutes Saved</span>
              </div>
              <div className="p-4 rounded-2xl glass border flex flex-col gap-1 shadow-elegant">
                <Layout className="w-5 h-5 text-accent mb-2" />
                <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</span>
                <span className="text-xs font-bold text-slate-400 uppercase">Tasks Logged</span>
              </div>
            </div>
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full sm:w-auto">
                {(['all', 'active', 'completed'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tighter transition-all ${
                      filter === f
                        ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onFocus={focusTask}
                  />
                ))}
              </AnimatePresence>

              {filteredTasks.length === 0 && (
                <div className="py-20 text-center space-y-4 animate-fade-in">
                  <div className="inline-flex p-4 rounded-full bg-slate-50 dark:bg-slate-900">
                    <ListFilter className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">Nothing to show</p>
                    <p className="text-sm text-slate-400">Try changing your filter or add a new task.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <FocusOverlay
        task={focusTaskObj}
        onClose={() => setFocusTaskId(null)}
        onComplete={toggleTask}
      />
    </div>
  );
}
