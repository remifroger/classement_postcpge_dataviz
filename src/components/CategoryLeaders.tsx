import React, { useMemo } from 'react';
import { SchoolData } from '../types';
import { motion } from 'motion/react';
import { Globe, Award, Briefcase, Users, Leaf, Trophy } from 'lucide-react';

interface CategoryLeadersProps {
  data: SchoolData[];
  onSchoolClick: (school: SchoolData) => void;
}

export const CategoryLeaders: React.FC<CategoryLeadersProps> = ({ data, onSchoolClick }) => {
  const categories = useMemo(() => [
    {
      title: "International",
      icon: Globe,
      color: "text-blue-600",
      bg: "bg-blue-50",
      key: "international_exposition_index_score_5",
      description: "Meilleure exposition & réputation mondiale"
    },
    {
      title: "Excellence",
      icon: Award,
      color: "text-red-600",
      bg: "bg-red-50",
      key: "excellence_attract_select_index_score_5",
      description: "Plus haut niveau académique & sélectivité"
    },
    {
      title: "Insertion Pro",
      icon: Briefcase,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      key: "pro_tx_emploi_cefdg_score_5",
      description: "Meilleurs salaires & taux d'emploi"
    },
    {
      title: "Social",
      icon: Users,
      color: "text-rose-600",
      bg: "bg-rose-50",
      key: "fiche_ecole_ouverture_sociale_index_score_5",
      description: "Meilleure mixité & accessibilité"
    },
    {
      title: "Environnement",
      icon: Leaf,
      color: "text-violet-600",
      bg: "bg-violet-50",
      key: "environnement_label_ddrs_score_2",
      description: "Engagement DDRS le plus fort"
    }
  ], []);

  const leaders = useMemo(() => {
    return categories.map(cat => {
      const sorted = [...data].sort((a, b) => {
        const scoreA = (a as any)[cat.key] || 0;
        const scoreB = (b as any)[cat.key] || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return a.rang - b.rang; // Tie-break with general rank
      });
      return {
        ...cat,
        school: sorted[0],
        score: (sorted[0] as any)[cat.key] || 0
      };
    });
  }, [data, categories]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {leaders.map((leader, idx) => (
        <motion.div
          key={leader.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          onClick={() => onSchoolClick(leader.school)}
          className="bg-white p-5 rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className={`absolute top-0 right-0 w-16 h-16 ${leader.bg} opacity-20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150`} />
          
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 ${leader.bg} rounded-xl`}>
              <leader.icon className={`w-4 h-4 ${leader.color}`} />
            </div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{leader.title}</span>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-zinc-900 group-hover:text-red-600 transition-colors line-clamp-1">
              {leader.school.ecole}
            </h4>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${leader.color.replace('text', 'bg')}`} 
                  style={{ width: `${(leader.score / (leader.title === 'Environnement' ? 2 : 5)) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-black text-zinc-900">{leader.score.toFixed(1)}</span>
            </div>
          </div>

          <p className="mt-3 text-[9px] text-zinc-400 leading-tight italic">
            {leader.description}
          </p>
          
          <div className="absolute bottom-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Trophy className={`w-3 h-3 ${leader.color}`} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
