import React, { useMemo } from 'react';
import { CriterionConfig, ThresholdMap, SchoolData } from '../types';
import { CRITERIA_CONFIG } from '../constants';
import { Settings2, Info, BarChart3 } from 'lucide-react';

interface ThresholdEditorProps {
  thresholds: ThresholdMap;
  onChange: (newThresholds: ThresholdMap) => void;
  data: SchoolData[];
  initialThresholds: ThresholdMap;
}

export const ThresholdEditor: React.FC<ThresholdEditorProps> = ({ thresholds, onChange, data, initialThresholds }) => {
  const scores = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

  const handleThresholdChange = (criterionId: string, scoreIndex: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newThresholds = { ...thresholds };
    if (!newThresholds[criterionId]) {
      newThresholds[criterionId] = new Array(10).fill(0);
    }
    newThresholds[criterionId][scoreIndex] = numValue;
    onChange(newThresholds);
  };

  const handleReset = (criterionId: string) => {
    const newThresholds = { ...thresholds };
    newThresholds[criterionId] = [...initialThresholds[criterionId]];
    onChange(newThresholds);
  };

  const getCriterionStats = useMemo(() => {
    const stats: Record<string, { min: number; max: number; avg: number; values: number[] }> = {};
    
    CRITERIA_CONFIG.forEach(criterion => {
      const values = data.map(s => s[criterion.brutKey]).filter(v => typeof v === 'number');
      if (values.length > 0) {
        stats[criterion.id] = {
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          values: values.sort((a, b) => a - b)
        };
      }
    });
    
    return stats;
  }, [data]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
      <div className="p-6 border-b border-black/5 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Éditeur de Seuils</h2>
            <p className="text-xs text-zinc-500">Définissez la valeur minimale pour chaque score</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            <Info className="w-3 h-3" />
            Scores par demi-point
          </div>
          <p className="text-[10px] text-zinc-400 italic">Initialisé avec les valeurs du CSV</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50">
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-black/5 sticky left-0 bg-zinc-50 z-10">Critère</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-black/5">Distribution</th>
              {scores.map(score => (
                <th key={score} className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-black/5 text-center">
                  Score {score.toFixed(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {CRITERIA_CONFIG.map((criterion) => {
              const stat = getCriterionStats[criterion.id];
              const currentThresholds = thresholds[criterion.id] || [];
              const initialT = initialThresholds[criterion.id] || [];
              const isModified = JSON.stringify(currentThresholds) !== JSON.stringify(initialT);
              
              return (
                <tr key={criterion.id} className={`hover:bg-zinc-50/30 transition-colors ${isModified ? 'bg-indigo-50/10' : ''}`}>
                  <td className="p-4 sticky left-0 bg-white z-10 border-r border-black/5 min-w-[200px]">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-zinc-900">{criterion.label}</p>
                      {isModified && (
                        <button 
                          onClick={() => handleReset(criterion.id)}
                          className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                          title="Réinitialiser aux valeurs du CSV"
                        >
                          Modifié (Reset)
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono mb-2">{criterion.brutKey}</p>
                    <div className="flex gap-1">
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        criterion.type === 'higher_is_better' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {criterion.type === 'higher_is_better' ? 'Croissant' : 'Décroissant'}
                      </span>
                      {criterion.isIndex && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">
                          Index
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 min-w-[180px]">
                    {stat ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                          <span>Min: {stat.min.toLocaleString()}</span>
                          <span>Max: {stat.max.toLocaleString()}</span>
                        </div>
                        <div className="h-8 flex items-end gap-px bg-zinc-50 rounded border border-black/5 p-1">
                          {Array.from({ length: 20 }).map((_, i) => {
                            const range = stat.max - stat.min;
                            const step = range / 20;
                            const start = stat.min + i * step;
                            const end = start + step;
                            const count = stat.values.filter(v => v >= start && v < end).length;
                            const height = stat.values.length > 0 ? (count / stat.values.length) * 100 : 0;
                            
                            return (
                              <div 
                                key={i} 
                                className="flex-1 bg-zinc-300 rounded-t-sm min-h-[1px]" 
                                style={{ height: `${Math.max(2, height * 2)}%` }}
                                title={`${count} écoles entre ${start.toFixed(1)} et ${end.toFixed(1)}`}
                              />
                            );
                          })}
                        </div>
                        <div className="flex justify-center">
                          <span className="text-[9px] text-zinc-400">Moy: {stat.avg.toFixed(1)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-12 text-zinc-300">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                    )}
                  </td>
                  {scores.map((score, idx) => (
                    <td key={score} className="p-2">
                      <input
                        type="number"
                        step="any"
                        value={thresholds[criterion.id]?.[idx] ?? ''}
                        onChange={(e) => handleThresholdChange(criterion.id, idx, e.target.value)}
                        className="w-full px-2 py-1.5 text-center text-sm font-medium bg-zinc-50 border border-black/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="-"
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
