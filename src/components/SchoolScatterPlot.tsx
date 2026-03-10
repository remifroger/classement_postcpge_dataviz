import React, { useMemo, useState } from 'react';
import { SchoolData } from '../types';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, Label
} from 'recharts';
import { CRITERIA_CONFIG } from '../constants';
import { Info, Maximize2 } from 'lucide-react';

interface SchoolScatterPlotProps {
  data: SchoolData[];
  onSchoolClick: (school: SchoolData) => void;
}

export const SchoolScatterPlot: React.FC<SchoolScatterPlotProps> = ({ data, onSchoolClick }) => {
  const [xAxisKey, setXAxisKey] = useState('excellence_attract_select_index_score_5');
  const [yAxisKey, setYAxisKey] = useState('pro_salaire_sortie_src_insersup_score_5');

  const scatterData = useMemo(() => {
    return data.map(school => ({
      name: school.ecole,
      x: (school as any)[xAxisKey] || 0,
      y: (school as any)[yAxisKey] || 0,
      z: school.note_finale,
      school: school
    }));
  }, [data, xAxisKey, yAxisKey]);

  const xLabel = CRITERIA_CONFIG.find(c => c.scoreKey === xAxisKey)?.label || xAxisKey;
  const yLabel = CRITERIA_CONFIG.find(c => c.scoreKey === yAxisKey)?.label || yAxisKey;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-900 text-white p-3 rounded-xl shadow-xl border border-white/10 text-[11px]">
          <p className="font-black mb-1 text-red-400 uppercase tracking-wider">{data.name}</p>
          <div className="space-y-0.5 opacity-80">
            <p>{xLabel}: <span className="font-bold text-white">{data.x.toFixed(2)}</span></p>
            <p>{yLabel}: <span className="font-bold text-white">{data.y.toFixed(2)}</span></p>
            <p>Note Finale: <span className="font-bold text-white">{data.z.toFixed(1)}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-zinc-900">Analyse des Corrélations</h3>
          <p className="text-sm text-zinc-500">Identifiez les rapports force/prix ou sélectivité/salaire</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Axe X</label>
            <select 
              value={xAxisKey} 
              onChange={(e) => setXAxisKey(e.target.value)}
              className="bg-zinc-50 border border-black/5 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-red-500/20"
            >
              {CRITERIA_CONFIG.map(c => (
                <option key={c.scoreKey} value={c.scoreKey}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Axe Y</label>
            <select 
              value={yAxisKey} 
              onChange={(e) => setYAxisKey(e.target.value)}
              className="bg-zinc-50 border border-black/5 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-red-500/20"
            >
              {CRITERIA_CONFIG.map(c => (
                <option key={c.scoreKey} value={c.scoreKey}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="h-[400px] w-full relative">
        <div className="absolute top-0 right-0 flex items-center gap-2 text-[10px] text-zinc-400 italic">
          <Info className="w-3 h-3" />
          La taille du point dépend de la note finale
        </div>
        
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
            <XAxis 
              type="number" 
              dataKey="x" 
              name={xLabel} 
              domain={[0, 5]} 
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={{ stroke: '#f1f5f9' }}
              tickLine={false}
            >
              <Label value={xLabel} position="bottom" offset={20} style={{ fontSize: '10px', fontWeight: 700, fill: '#64748b', textTransform: 'uppercase' }} />
            </XAxis>
            <YAxis 
              type="number" 
              dataKey="y" 
              name={yLabel} 
              domain={[0, 5]} 
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={{ stroke: '#f1f5f9' }}
              tickLine={false}
            >
              <Label value={yLabel} angle={-90} position="left" offset={0} style={{ fontSize: '10px', fontWeight: 700, fill: '#64748b', textTransform: 'uppercase' }} />
            </YAxis>
            <ZAxis type="number" dataKey="z" range={[50, 400]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter 
              name="Écoles" 
              data={scatterData} 
              onClick={(d) => onSchoolClick(d.school)}
              className="cursor-pointer"
            >
              {scatterData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.z > 45 ? '#dc2626' : entry.z > 35 ? '#ef4444' : '#fca5a5'} 
                  fillOpacity={0.6}
                  stroke={entry.z > 45 ? '#991b1b' : '#ef4444'}
                  strokeWidth={1}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <h4 className="text-[10px] font-black text-blue-700 uppercase mb-1 tracking-widest">Zone de Performance</h4>
          <p className="text-[11px] text-blue-600 leading-relaxed">
            Les écoles en haut à droite excellent sur les deux critères sélectionnés simultanément.
          </p>
        </div>
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <h4 className="text-[10px] font-black text-amber-700 uppercase mb-1 tracking-widest">Zone d'Opportunité</h4>
          <p className="text-[11px] text-amber-600 leading-relaxed">
            Cherchez les points larges (bonne note globale) situés en dehors de la diagonale principale.
          </p>
        </div>
      </div>
    </div>
  );
};
