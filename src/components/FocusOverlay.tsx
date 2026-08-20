import { useState, useEffect, useRef } from 'react';
import { type Task } from '../types/todo';
import { X, Target, CheckCircle2, Flame, Zap, Coffee, Clock, Play, Pause, RotateCcw, Volume2, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundGenerator } from '../services/soundGenerator';

interface FocusOverlayProps {
  task: Task | null;
  onClose: () => void;
  onComplete: (id: string, actualMinutes?: number) => void;
}

export function FocusOverlay({ task, onClose, onComplete }: FocusOverlayProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeSound, setActiveSound] = useState<'none' | 'rain' | 'breeze'>('none');
  const timerRef = useRef<any>(null);

  // Sync timeLeft and status when task changes
  useEffect(() => {
    if (task) {
      setTimeLeft(task.estimatedMinutes * 60);
      setIsRunning(false);
      setActiveSound('none');
    }
  }, [task]);

  // Stop sounds on unmount
  useEffect(() => {
    return () => {
      soundGenerator.stopAll();
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isRunning && task) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer complete! Play Zen Bell and finish
            setIsRunning(false);
            soundGenerator.playBell();
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, task]);

  // Handle ambient sound switches
  const handleSoundChange = (sound: 'none' | 'rain' | 'breeze') => {
    setActiveSound(sound);
    soundGenerator.stopAll();
    
    if (sound === 'rain') {
      soundGenerator.playRain();
    } else if (sound === 'breeze') {
      soundGenerator.playBreeze();
    }
  };

  if (!task) return null;

  const getEnergyIcon = () => {
    switch (task.energyLevel) {
      case 'high': return <Flame className="w-6 h-6 text-orange-500" />;
      case 'medium': return <Zap className="w-6 h-6 text-yellow-500" />;
      case 'low': return <Coffee className="w-6 h-6 text-blue-500" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (task.estimatedMinutes * 60)) * 100;

  const handleFinish = () => {
    const minutesFocused = Math.max(1, Math.round((task.estimatedMinutes * 60 - timeLeft) / 60));
    soundGenerator.playBell();
    onComplete(task.id, minutesFocused);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-2xl dark:bg-slate-950/95"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors z-50"
        >
          <X className="w-6 h-6 text-slate-500" />
        </button>

        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          className="max-w-xl w-full px-6 py-8 text-center space-y-8 flex flex-col items-center justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest">
            <Target className="w-4 h-4 animate-pulse" />
            Mindful Focus Session
          </div>

          <div className="space-y-2 max-w-md">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              {task.title}
            </h1>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                {getEnergyIcon()}
                {task.energyLevel.charAt(0).toUpperCase() + task.energyLevel.slice(1)} Energy
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {task.estimatedMinutes} mins est.
              </span>
            </div>
          </div>

          {/* Interactive Circular Timer Visualizer */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="6"
                fill="transparent"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-primary"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 44}
                animate={{ strokeDashoffset: (2 * Math.PI * 44) * (1 - progress / 100) }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            
            <div className="text-center z-10 space-y-1">
              <div className="text-5xl font-black tracking-tight font-mono text-slate-900 dark:text-white">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {isRunning ? 'Flow State Active' : 'Zen Paused'}
              </div>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setTimeLeft(task.estimatedMinutes * 60);
                setIsRunning(false);
              }}
              className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:scale-105 active:scale-95 shadow-md"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-8 py-4 rounded-2xl gradient-primary text-white font-black text-lg shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-white" /> Pause Flow
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" /> Enter Flow
                </>
              )}
            </button>

            <button
              onClick={handleFinish}
              className="p-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
              title="Finish Task Directly"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>

          {/* Ambient Sounds Picker */}
          <div className="bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-2xl border w-full max-w-sm space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Zen Ambient Sounds
            </div>
            <div className="flex items-center gap-2 justify-center">
              <button
                onClick={() => handleSoundChange('none')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSound === 'none'
                    ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Off
              </button>
              <button
                onClick={() => handleSoundChange('rain')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeSound === 'rain'
                    ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" /> Rain
              </button>
              <button
                onClick={() => handleSoundChange('breeze')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeSound === 'breeze'
                    ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Wind className="w-3.5 h-3.5" /> Breeze
              </button>
            </div>
          </div>
          
          <p className="text-xs font-medium text-slate-400">
            Let the sound guide your breathing. Inhale calm, exhale distractions.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
