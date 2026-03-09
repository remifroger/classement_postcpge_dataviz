import React from 'react';
import { METRICS, SCORE_STEPS, Thresholds } from '../constants';
import { Settings2, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RankingEditorProps {
  thresholds: Record<string, Thresholds>;
  onThresholdChange: (metricId: string, score: number, value: number) => void;
  onReset: () => void;
}

export const RankingEditor: React.FC<RankingEditorProps> = ({ thresholds, onThresholdChange, onReset }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden mb-8">
      <div className="p-4 border-b border-black/5 bg-zinc-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-bold text-zinc-900">Configuration des Seuils</h2>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onReset}
            className="text-[10px] text-red-600 hover:text-red-700 font-bold uppercase tracking-widest transition-colors"
          >
            Réinitialiser
          </button>
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Édition en temps réel</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/30">
              <th className="p-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-black/5 min-w-[200px]">Critère</th>
              {SCORE_STEPS.map(step => (
                <th key={step} className="p-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-black/5 text-center">
                  {step.toFixed(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.filter(m => !m.isFixed).map((metric) => (
              <tr key={metric.id} className="hover:bg-zinc-50/50 transition-colors group">
                <td className="p-4 border-b border-black/5">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-900">{metric.label}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{metric.brutKey}</span>
                  </div>
                </td>
                {SCORE_STEPS.map(step => (
                  <td key={step} className="p-2 border-b border-black/5">
                    <input
                      type="number"
                      step="any"
                      value={thresholds[metric.id][step]}
                      onChange={(e) => onThresholdChange(metric.id, step, parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 text-xs text-center bg-zinc-50 border border-black/5 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
