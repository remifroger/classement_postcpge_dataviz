import React, { useState, useMemo, useEffect } from 'react';
import { SchoolData } from '../types';
import { CRITERIA_CONFIG } from '../constants';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Plus, X, Info } from 'lucide-react';

interface SchoolChartsProps {
  data: SchoolData[];
  onSchoolClick: (school: SchoolData) => void;
}

export const SchoolCharts: React.FC<SchoolChartsProps> = ({ data, onSchoolClick }) => {
  const sortedData = useMemo(() => [...data].sort((a, b) => a.rang - b.rang), [data]);
  const reliefRef = React.useRef<HTMLDivElement>(null);
  
  // State for Radar Chart selection
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<number[]>([]);
  const [reliefMetric, setReliefMetric] = useState<string>('note_finale');

  // Initialize selection when data arrives
  useEffect(() => {
    if (selectedSchoolIds.length === 0 && sortedData.length > 0) {
      setSelectedSchoolIds(sortedData.slice(0, 5).map(s => Number(s.id_ecole)));
    }
  }, [sortedData]);

  const selectedSchools = useMemo(() => 
    sortedData.filter(s => selectedSchoolIds.includes(Number(s.id_ecole))),
    [sortedData, selectedSchoolIds]
  );

  const toggleSchool = (id: number | string) => {
    const numericId = Number(id);
    setSelectedSchoolIds(prev => {
      const isSelected = prev.includes(numericId);
      if (isSelected) {
        if (prev.length <= 1) return prev;
        return prev.filter(sid => sid !== numericId);
      } else {
        if (prev.length >= 5) return prev;
        return [...prev, numericId];
      }
    });
  };

  // Prepare data for radar chart
  const radarData = useMemo(() => {
    const metrics = [
      { subject: 'International', key: 'international_exposition_index_score_5' },
      { subject: 'Excellence', key: 'excellence_attract_select_index_score_5' },
      { subject: 'Pro', key: 'pro_tx_emploi_cefdg_score_5' },
      { subject: 'Encadrement', key: 'encadrement_index_score_5' },
      { subject: 'Ouverture Sociale', key: 'fiche_ecole_ouverture_sociale_index_score_5' },
    ];

    return metrics.map(metric => {
      const entry: any = { subject: metric.subject, fullMark: 5 };
      selectedSchools.forEach(school => {
        // Use ID as key to avoid issues with special characters in school names
        entry[`school_${school.id_ecole}`] = (school as any)[metric.key] || 0;
      });
      return entry;
    });
  }, [selectedSchools]);

  const COLORS = [
    '#dc2626', // Red
    '#2563eb', // Blue
    '#16a34a', // Green
    '#9333ea', // Purple
    '#ea580c', // Orange
  ];

  // Relief Ranking Calculation
  const reliefData = useMemo(() => {
    const data = reliefMetric === 'note_finale' 
      ? sortedData 
      : [...sortedData].sort((a, b) => {
          const valA = (a as any)[reliefMetric] || 0;
          const valB = (b as any)[reliefMetric] || 0;
          return valB - valA;
        });

    // Handle ex-aequo by calculating horizontal offsets
    const scoreGroups: Record<string, number> = {};
    return data.map(school => {
      const score = ((school as any)[reliefMetric] || 0).toFixed(1);
      const tieIndex = scoreGroups[score] || 0;
      scoreGroups[score] = tieIndex + 1;
      return { ...school, tieIndex };
    });
  }, [sortedData, reliefMetric]);

  const maxScore = reliefData.length > 0 ? (reliefData[0] as any)[reliefMetric] || 0 : 100;
  const minScore = reliefData.length > 0 ? (reliefData[reliefData.length - 1] as any)[reliefMetric] || 0 : 0;
  const scoreRange = maxScore - minScore;
  const RELIEF_HEIGHT = reliefMetric === 'note_finale' ? 2000 : 800; 

  const scrollToRelief = () => {
    reliefRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-col gap-8 mb-12">
      {/* Relief Ranking */}
      <div 
        ref={reliefRef}
        id="relief-ranking"
        className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 flex flex-col"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-zinc-900">Classement en Relief</h3>
            <p className="text-sm text-zinc-500">Écarts réels basés sur {reliefMetric === 'note_finale' ? 'la note finale' : 'le critère sélectionné'}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Visualiser par</label>
              <select 
                value={reliefMetric} 
                onChange={(e) => setReliefMetric(e.target.value)}
                className="bg-zinc-50 border border-black/5 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <option value="note_finale">Note Finale (Total)</option>
                {CRITERIA_CONFIG.map(c => (
                  <option key={c.scoreKey} value={c.scoreKey}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="p-2 bg-zinc-50 rounded-lg group relative cursor-help">
              <Info className="w-4 h-4 text-zinc-400" />
              <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-zinc-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                La distance verticale entre les écoles représente l'écart de points réel sur le critère choisi.
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex-1 min-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
          <div className="relative" style={{ height: `${RELIEF_HEIGHT}px` }}>
            {/* The Track Line */}
            <div className="absolute left-12 top-0 bottom-0 w-px bg-zinc-100" />
            
            {reliefData.map((school, index) => {
              const currentScore = (school as any)[reliefMetric] || 0;
              const position = scoreRange === 0 ? 0 : ((maxScore - currentScore) / scoreRange) * (RELIEF_HEIGHT - 60);
              const horizontalOffset = (school as any).tieIndex * 45;

              return (
                <motion.div
                  key={school.id_ecole}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: horizontalOffset }}
                  whileHover={{ zIndex: 100, scale: 1.05, x: horizontalOffset + 10 }}
                  transition={{ 
                    delay: index * 0.01,
                    scale: { duration: 0.2 },
                    zIndex: { duration: 0 },
                    x: { duration: 0.2 }
                  }}
                  className="absolute left-0 flex items-center group w-fit"
                  style={{ top: `${position}px`, zIndex: reliefData.length - index }}
                >
                  <div className="w-12 text-right pr-4 text-[10px] font-bold text-zinc-400 tabular-nums shrink-0">
                    {currentScore.toFixed(1)}
                  </div>
                  
                  <div className="relative flex items-center w-[280px] shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 border-2 border-white shadow-sm z-10 group-hover:scale-125 group-hover:bg-red-500 transition-all" />
                    <div 
                      onClick={() => onSchoolClick(school)}
                      className="ml-4 flex items-center gap-3 bg-white group-hover:bg-white p-2.5 rounded-xl border border-black/5 group-hover:border-red-200 shadow-sm group-hover:shadow-xl transition-all w-full cursor-pointer overflow-hidden"
                    >
                      <span className="text-[10px] font-black text-zinc-300 w-4 shrink-0">{school.rang}</span>
                      <span className="text-xs font-semibold text-zinc-700 truncate flex-1">{school.ecole}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSchool(school.id_ecole);
                          }}
                          className={`p-1 rounded-md transition-colors ${selectedSchoolIds.includes(school.id_ecole) ? 'bg-red-100 text-red-600' : 'bg-zinc-100 text-zinc-400 hover:text-zinc-600'}`}
                          title={selectedSchoolIds.includes(school.id_ecole) ? "Retirer du comparateur" : "Ajouter au comparateur"}
                        >
                          {selectedSchoolIds.includes(school.id_ecole) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Radar Chart Comparison */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 flex flex-col">
        <div className="mb-8">
          <h3 className="text-xl font-bold tracking-tight text-zinc-900">Comparateur de Profils</h3>
          <p className="text-sm text-zinc-500">Sélectionnez jusqu'à 5 écoles pour comparer</p>
        </div>

        {/* Selection UI */}
                <div className="flex flex-wrap gap-2 mb-8">
          <AnimatePresence>
            {selectedSchools.map((school, index) => (
              <motion.div
                key={school.id_ecole}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/5 text-[11px] font-bold"
                style={{ backgroundColor: `${COLORS[index % COLORS.length]}10`, color: COLORS[index % COLORS.length] }}
              >
                <span className="truncate max-w-[120px]">{school.ecole}</span>
                <button onClick={() => toggleSchool(school.id_ecole)} className="hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {selectedSchoolIds.length < 5 && (
            <button 
              onClick={scrollToRelief}
              className="px-3 py-1.5 rounded-full bg-zinc-50 border border-dashed border-zinc-200 text-[10px] text-zinc-400 font-medium flex items-center hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
            >
              Ajoutez via le classement ↑
            </button>
          )}
        </div>

        <div className="h-[500px] w-full flex items-center justify-center">
          {radarData.length > 0 && selectedSchools.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                {selectedSchools.map((school, index) => (
                  <Radar
                    key={school.id_ecole}
                    name={school.ecole}
                    dataKey={`school_${school.id_ecole}`}
                    stroke={COLORS[index % COLORS.length]}
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={0.1}
                    strokeWidth={3}
                  />
                ))}
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ paddingTop: '40px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-zinc-400 text-sm italic py-20">Aucune école sélectionnée pour la comparaison</div>
          )}
        </div>

        <div className="mt-8 p-4 bg-zinc-50 rounded-2xl border border-black/5">
          <p className="text-[10px] text-zinc-400 leading-relaxed">
            Utilisez le radar pour visualiser les forces relatives de chaque école sur les 5 piliers : International, Excellence académique, Insertion Pro, Encadrement et Ouverture Sociale.
          </p>
        </div>
      </div>
    </div>
  );
};
