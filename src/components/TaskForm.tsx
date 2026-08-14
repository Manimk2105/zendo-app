import { useState } from 'react';
import { type EnergyLevel } from '../types/todo';
import { Plus, Flame, Zap, Coffee, Clock } from 'lucide-react';

interface TaskFormProps {
  onAdd: (task: { title: string; energyLevel: EnergyLevel; estimatedMinutes: number }) => void;
}

export function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, energyLevel, estimatedMinutes });
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl glass shadow-elegant space-y-4 border border-white/20 animate-fade-in">
      <div className="relative">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's your next win?"
          className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="absolute right-2 top-2 p-2 rounded-lg gradient-primary text-white shadow-lg hover:shadow-glow disabled:opacity-50 disabled:shadow-none transition-all"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-tighter">Energy:</span>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['low', 'medium', 'high'] as EnergyLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setEnergyLevel(level)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  energyLevel === level
                    ? 'bg-white shadow-sm text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {level === 'low' && <Coffee className="w-3.5 h-3.5 text-blue-500" />}
                {level === 'medium' && <Zap className="w-3.5 h-3.5 text-yellow-500" />}
                {level === 'high' && <Flame className="w-3.5 h-3.5 text-orange-500" />}
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Clock className="w-4 h-4 text-slate-400" />
          <input
            type="number"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            min="1"
            max="480"
            className="w-16 px-2 py-1 bg-white/50 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span className="text-xs font-medium text-slate-400">mins</span>
        </div>
      </div>
    </form>
  );
}
