import { type Task } from '../types/todo';
import { CheckCircle2, Circle, Flame, Zap, Coffee, Trash2, Target, Pause, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onFocus: (id: string) => void;
  onPauseToggle: (id: string) => void;
}

export function TaskCard({ task, onToggle, onDelete, onFocus, onPauseToggle }: TaskCardProps) {
  const getEnergyIcon = () => {
    switch (task.energyLevel) {
      case 'high': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Coffee className="w-4 h-4 text-blue-500" />;
    }
  };

  const getEnergyLabel = () => {
    return task.energyLevel.charAt(0).toUpperCase() + task.energyLevel.slice(1);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 glass shadow-elegant hover:-translate-y-0.5 ${
        task.isCompleted ? 'opacity-60' : task.isPaused ? 'border-amber-200/50 bg-amber-50/10 dark:bg-amber-950/5' : 'hover:shadow-glow'
      }`}
    >
      <button
        onClick={() => onToggle(task.id)}
        className="flex-shrink-0 transition-transform duration-200 hover:scale-110 active:scale-90"
      >
        {task.isCompleted ? (
          <CheckCircle2 className="w-6 h-6 text-green-500 fill-green-50" />
        ) : (
          <Circle className="w-6 h-6 text-slate-300 hover:text-primary transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <h3 className={`font-medium truncate ${task.isCompleted ? 'line-through text-slate-400' : task.isPaused ? 'text-slate-500 dark:text-slate-400 italic' : 'text-slate-900 dark:text-white'}`}>
          {task.title}
        </h3>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {getEnergyIcon()}
            {getEnergyLabel()}
          </div>
          <span className="text-[10px] font-medium text-slate-400">
            {task.estimatedMinutes}m est.
          </span>
          {task.isPaused && !task.isCompleted && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Pause className="w-2.5 h-2.5 fill-amber-600 dark:fill-amber-400" />
              On Hold
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {!task.isCompleted && (
          <>
            <button
              onClick={() => onPauseToggle(task.id)}
              className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-500 transition-colors"
              title={task.isPaused ? "Resume task" : "Pause / Hold task"}
            >
              {task.isPaused ? <Play className="w-4 h-4 fill-amber-500/10" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onFocus(task.id)}
              className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
              title="Focus on this task"
            >
              <Target className="w-4 h-4" />
            </button>
          </>
        )}
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
