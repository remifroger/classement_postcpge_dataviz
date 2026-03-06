import React from 'react';
import { SchoolData } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, Globe, Briefcase, Users, ChevronDown, ChevronRight } from 'lucide-react';

interface Metric {
  label: string;
  value: number;
  max: number;
  brut?: string | number;
}

interface Section {
  title: string;
  icon: any;
  color: string;
  barColor: string;
  bg: string;
  metrics: Metric[];
}

interface SchoolDetailModalProps {
  school: SchoolData | null;
  onClose: () => void;
}

export const SchoolDetailModal: React.FC<SchoolDetailModalProps> = ({ school, onClose }) => {
  if (!school) return null;

  const sections: Section[] = [
    {
      title: "Excellence Académique",
      icon: Award,
      color: "text-red-600",
      barColor: "bg-red-600",
      bg: "bg-red-50",
      metrics: [
        { label: "Attractivité & Sélectivité", value: school.excellence_attract_select_index_score_5, max: 5, brut: school.excellence_attract_select_index_brut },
        { label: "Part de Prépas", value: school.excellence_prepa_score_5, max: 5, brut: school.excellence_prepa_brut },
        { label: "Double Diplômes FR", value: school.excellence_part_dble_diplomes_fr_score_5, max: 5, brut: school.excellence_part_dble_diplomes_fr_brut },
        { label: "Impact Recherche", value: school.excellence_impact_rech_index_score_5, max: 5, brut: school.excellence_impact_rech_index_brut },
        { label: "Labels Internationaux", value: school.excellence_labels_internationaux_score_5, max: 5, brut: school.excellence_labels_internationaux_brut },
        { label: "Durée Grade Master", value: school.excellence_duree_grade_master_score_5, max: 5 },
      ]
    },
    {
      title: "International",
      icon: Globe,
      color: "text-orange-600",
      barColor: "bg-orange-600",
      bg: "bg-orange-50",
      metrics: [
        { label: "Exposition Internationale", value: school.international_exposition_index_score_5, max: 5, brut: school.international_exposition_index_brut },
        { label: "Réputation Internationale", value: school.international_reputation_index_score_5, max: 5, brut: school.international_reputation_index_brut },
        { label: "Partenaires Accrédités", value: school.international_part_partenaires_accrdt_score_5, max: 5, brut: school.international_part_partenaires_accrdt_brut },
      ]
    },
    {
      title: "Insertion Professionnelle",
      icon: Briefcase,
      color: "text-amber-600",
      barColor: "bg-amber-600",
      bg: "bg-amber-50",
      metrics: [
        { label: "Taux d'Emploi", value: school.pro_tx_emploi_cefdg_score_5, max: 5, brut: school.pro_tx_emploi_cefdg_brut },
        { label: "Salaire de Sortie", value: school.pro_salaire_sortie_src_insersup_score_5, max: 5, brut: school.pro_salaire_sortie_src_insersup_brut },
      ]
    },
    {
      title: "Encadrement & Social",
      icon: Users,
      color: "text-rose-600",
      barColor: "bg-rose-600",
      bg: "bg-rose-50",
      metrics: [
        { label: "Index Encadrement", value: school.encadrement_index_score_5, max: 5, brut: school.encadrement_index_brut },
        { label: "Ouverture Sociale", value: school.fiche_ecole_ouverture_sociale_index_score_5, max: 5, brut: school.fiche_ecole_ouverture_sociale_index_brut },
        { label: "Environnement (DDRS)", value: school.environnement_label_ddrs_score_2, max: 2 },
      ]
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-zinc-100 flex items-start justify-between bg-zinc-50/50">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-red-600/20">
                {school.rang}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="px-2 py-0.5 bg-zinc-200 text-zinc-600 text-[10px] font-bold rounded uppercase tracking-wider">
                    {school.type}
                  </span>
                  <span className="text-sm font-bold text-red-600">
                    Note: {school.note_finale.toFixed(2)}/100
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                  {school.ecole}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sections.map((section) => (
                <div key={section.title} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${section.bg} rounded-lg`}>
                      <section.icon className={`w-5 h-5 ${section.color}`} />
                    </div>
                    <h3 className="font-bold text-zinc-900 tracking-tight">{section.title}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {section.metrics.map((metric) => (
                      <div key={metric.label} className="space-y-2">
                        <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-zinc-700">{metric.label}</span>
                            {metric.brut !== undefined && (
                              <span className="text-[9px] font-medium text-zinc-400 lowercase italic">
                                Donnée brute: {typeof metric.brut === 'number' ? metric.brut.toLocaleString() : metric.brut}
                              </span>
                            )}
                          </div>
                          <span className="text-zinc-900">{metric.value.toFixed(2)} / {metric.max}</span>
                        </div>
                        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(metric.value / metric.max) * 100}%` }}
                            className={`h-full ${section.barColor}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all active:scale-95"
            >
              Fermer la fiche
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
