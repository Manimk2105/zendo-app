import { type Task } from '../types/todo';
import { X, Target, CheckCircle2, Flame, Zap, Coffee, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FocusOverlayProps {
  task: Task | null;
  onClose: () => void;
  onComplete: (id: string) => void;
}

export function FocusOverlay({ task, onClose, onComplete }: FocusOverlayProps) {
  if (!task) return null;

  const getEnergyIcon = () => {
    switch (task.energyLevel) {
      case 'high': return <Flame className="w-8 h-8 text-orange-500" />;
      case 'medium': return <Zap className="w-8 h-8 text-yellow-500" />;
      case 'low': return <Coffee className="w-8 h-8 text-blue-500" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xl"
      >
        <button
          onClick={onClose}
          className="absolute top-8 right-8 p-3 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-6 h-6 text-slate-500" />
        </button>

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="max-w-2xl w-full p-12 text-center"
        >
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm uppercase tracking-widest">
            <Target className="w-4 h-4 animate-pulse" />
            Current Focus
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-8">
            {task.title}
          </h1>

          <div className="flex items-center justify-center gap-8 mb-12">
            <div className="flex flex-col items-center gap-2">
              <div className="p-4 rounded-2xl bg-white shadow-elegant">
                {getEnergyIcon()}
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Energy Need</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-4 rounded-2xl bg-white shadow-elegant flex items-center gap-2">
                <Clock className="w-8 h-8 text-primary" />
                <span className="text-2xl font-black text-slate-900">{task.estimatedMinutes}</span>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Minutes Est.</span>
            </div>
          </div>

          <button
            onClick={() => {
              onComplete(task.id);
              onClose();
            }}
            className="group flex items-center gap-3 px-10 py-5 rounded-2xl gradient-primary text-white text-xl font-bold shadow-glow hover:scale-105 active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-6 h-6" />
            Finish Task
          </button>
          
          <p className="mt-8 text-slate-400 font-medium">
            You've got this. Take a deep breath and start.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
