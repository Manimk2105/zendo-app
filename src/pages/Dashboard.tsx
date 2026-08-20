import { useState, useEffect, useMemo } from 'react';
import { type Task, type EnergyLevel, type FocusSession } from '../types/todo';
import { storage } from '../services/storage';
import { TaskForm } from '../components/TaskForm';
import { TaskCard } from '../components/TaskCard';
import { FocusOverlay } from '../components/FocusOverlay';
import { Layout, CheckCircle2, Trophy, BarChart3, ListFilter, Search, Calendar, Award, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<FocusSession[]>([]);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial load
  useEffect(() => {
    setTasks(storage.getTasks());
    setHistory(storage.getHistory());
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
      isPaused: false,
      createdAt: Date.now(),
    };
    setTasks([newTask, ...tasks]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const togglePauseTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, isPaused: !t.isPaused } : t));
  };

  const completeTask = (id: string, actualMinutes?: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Toggle completed state and clear paused state
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, isCompleted: true, isPaused: false } : t);
    setTasks(updatedTasks);

    // Create a new focus session log
    const minutes = actualMinutes !== undefined ? actualMinutes : task.estimatedMinutes;
    const newSession: FocusSession = {
      id: crypto.randomUUID(),
      taskId: task.id,
      taskTitle: task.title,
      energyLevel: task.energyLevel,
      minutesFocused: minutes,
      completedAt: Date.now()
    };
    const updatedHistory = [newSession, ...history];
    setHistory(updatedHistory);
    storage.saveHistory(updatedHistory);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your mindfulness focus history?")) {
      setHistory([]);
      storage.saveHistory([]);
    }
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
    const totalMinutesFocused = history.reduce((acc, s) => acc + s.minutesFocused, 0);
    return { completed, total, totalMinutesFocused };
  }, [tasks, history]);

  // Calculate Streak of consecutive days with at least one focus session
  const streak = useMemo(() => {
    if (history.length === 0) return 0;
    
    const dates = Array.from(new Set(history.map(s => new Date(s.completedAt).toDateString())));
    const todayStr = new Date().toDateString();
    const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
    
    if (!dates.includes(todayStr) && !dates.includes(yesterdayStr)) {
      return 0;
    }
    
    let currentStreak = 0;
    const checkDate = new Date();
    
    while (true) {
      const dateStr = checkDate.toDateString();
      if (dates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak;
  }, [history]);

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
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border text-xs font-bold uppercase tracking-tighter">
              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
              {streak} Day Zen Streak
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
              <p className="text-slate-500 font-medium text-sm">
                ZenDo helps you manage energy, flow through tasks, and track mindfulness with ambient sounds.
              </p>
            </div>

            <TaskForm onAdd={addTask} />

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl glass border flex flex-col gap-1 shadow-elegant">
                <BarChart3 className="w-5 h-5 text-primary mb-2" />
                <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalMinutesFocused}</span>
                <span className="text-xs font-bold text-slate-400 uppercase">Focused Mins</span>
              </div>
              <div className="p-4 rounded-2xl glass border flex flex-col gap-1 shadow-elegant">
                <Layout className="w-5 h-5 text-accent mb-2" />
                <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</span>
                <span className="text-xs font-bold text-slate-400 uppercase">Tasks Logged</span>
              </div>
            </div>

            {/* Unique Feature: Mindful Focus History Log */}
            <div className="p-6 rounded-2xl glass border shadow-elegant space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Mindful History
                  </h3>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-950 transition-colors"
                    title="Clear history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <div className="text-center py-6 space-y-2">
                    <Award className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-400">No sessions recorded yet.</p>
                    <p className="text-[11px] text-slate-400">Complete a focus session with the timer to log history!</p>
                  </div>
                ) : (
                  history.map((session) => (
                    <div
                      key={session.id}
                      className="p-3 rounded-xl bg-white/55 dark:bg-slate-900/55 border text-xs flex items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {session.taskTitle}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {new Date(session.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.energyLevel} energy
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-primary/10 text-primary font-extrabold text-[10px]">
                          +{session.minutesFocused}m
                        </span>
                      </div>
                    </div>
                  ))
                )}
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
                    onPauseToggle={togglePauseTask}
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
        onComplete={completeTask}
      />
    </div>
  );
}
