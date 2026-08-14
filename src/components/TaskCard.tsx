import { type Task } from '../types/todo';
import { CheckCircle2, Circle, Flame, Zap, Coffee, Trash2, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onFocus: (id: string) => void;
}

export function TaskCard({ task, onToggle, onDelete, onFocus }: TaskCardProps) {
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
        task.isCompleted ? 'opacity-60' : 'hover:shadow-glow'
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
        <h3 className={`font-medium truncate ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
          {task.title}
        </h3>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {getEnergyIcon()}
            {getEnergyLabel()}
          </div>
          <span className="text-[10px] font-medium text-slate-400">
            {task.estimatedMinutes}m est.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {!task.isCompleted && (
          <button
            onClick={() => onFocus(task.id)}
            className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
            title="Focus on this task"
          >
            <Target className="w-4 h-4" />
          </button>
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
