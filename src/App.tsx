import React, { useEffect, useState, useRef } from 'react';
import { SchoolData, ThresholdMap, CriterionType } from './types';
import { SchoolTable } from './components/SchoolTable';
import { SchoolCharts } from './components/SchoolCharts';
import { SchoolScatterPlot } from './components/SchoolScatterPlot';
import { SchoolDetailModal } from './components/SchoolDetailModal';
import { ThresholdEditor } from './components/ThresholdEditor';
import { CRITERIA_CONFIG, FIXED_CRITERIA } from './constants';
import { 
  GraduationCap, 
  Globe, 
  Briefcase, 
  TrendingUp, 
  AlertCircle,
  Loader2,
  Upload,
  FileText,
  RefreshCw,
  Settings2,
  LayoutDashboard,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';

export default function App() {
  const [originalData, setOriginalData] = useState<SchoolData[]>([]);
  const [thresholds, setThresholds] = useState<ThresholdMap>({});
  const [initialThresholds, setInitialThresholds] = useState<ThresholdMap>({});
  const [viewMode, setViewMode] = useState<'dashboard' | 'edition'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = () => {
    setLoading(false);
    setOriginalData([]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateScore = (value: number, thresholds: number[], type: CriterionType): number => {
    const scores = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
    let bestScore = 0;

    if (type === 'higher_is_better') {
      for (let i = 0; i < thresholds.length; i++) {
        if (value >= thresholds[i]) {
          bestScore = scores[i];
        }
      }
    } else {
      // For lower is better, we assume thresholds are ordered from highest to lowest value
      // Score 0.5: <= 100
      // Score 1.0: <= 90
      // ...
      // Score 5.0: <= 10
      for (let i = 0; i < thresholds.length; i++) {
        if (value <= thresholds[i]) {
          bestScore = scores[i];
        }
      }
    }
    return bestScore;
  };

  const processedData = React.useMemo(() => {
    if (originalData.length === 0) return [];

    const newData = originalData.map(school => {
      const updatedSchool = { ...school };
      
      // 1. Calculate scores from thresholds ONLY if they have been modified
      CRITERIA_CONFIG.forEach(criterion => {
        const thresholdValues = thresholds[criterion.id];
        const initialT = initialThresholds[criterion.id];
        
        // Check if thresholds for this criterion have been modified by the user
        const isModified = initialT && JSON.stringify(thresholdValues) !== JSON.stringify(initialT);
        
        if (isModified && thresholdValues) {
          updatedSchool[criterion.scoreKey] = calculateScore(
            updatedSchool[criterion.brutKey],
            thresholdValues,
            criterion.type
          );
        }
        // If not modified, updatedSchool[criterion.scoreKey] remains the value from the CSV
      });

      // 2. Calculate note_finale
      // Using the explicit formula provided by the user (13 items)
      // Note: Sub-criteria are NOT added to the total, only the index scores and standalone scores are.
      const scoreKeys = [
        'fiche_ecole_ouverture_sociale_index_score_5',
        'excellence_duree_grade_master_score_5',
        'excellence_labels_internationaux_score_5',
        'encadrement_index_score_5',
        'excellence_attract_select_index_score_5',
        'excellence_prepa_score_5',
        'excellence_part_dble_diplomes_fr_score_5',
        'pro_salaire_sortie_src_insersup_score_5',
        'pro_tx_emploi_cefdg_score_5',
        'international_part_partenaires_accrdt_score_5',
        'international_reputation_index_score_5',
        'international_exposition_index_score_5',
        'environnement_label_ddrs_score_2'
      ];

      const totalScore = scoreKeys.reduce((acc, key) => acc + (updatedSchool[key] || 0), 0);

      updatedSchool.note_finale = totalScore;
      return updatedSchool;
    });

    // 4. Update ranking
    return [...newData]
      .sort((a, b) => b.note_finale - a.note_finale)
      .map((school, index) => ({ ...school, rang: index + 1 }));
  }, [originalData, thresholds]);

  const handleExportCSV = () => {
    if (processedData.length === 0) return;
    
    // Sort by rank before exporting
    const exportData = [...processedData].sort((a, b) => a.rang - b.rang);
    
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `classement_ecoles_modifie_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parseFrenchNumber = (val: any) => {
            if (val === null || val === undefined || val === '') return 0;
            if (typeof val === 'number') return val;
            const normalized = String(val).replace(',', '.').replace(/\s/g, '');
            const parsed = parseFloat(normalized);
            return isNaN(parsed) ? 0 : parsed;
          };

          const cleanedData = results.data.map((row: any, index: number) => {
            const cleaned: any = { ...row, id_ecole: index + 1 };
            Object.keys(row).forEach(key => {
              if (key.endsWith('_brut') || key.endsWith('_score_5') || key.endsWith('_score_2') || key === 'note_finale' || key === 'rang' || key === 'id_ecole' || key === 'excellence_moy_bac_integres') {
                cleaned[key] = parseFrenchNumber(row[key]);
              }
            });
            return cleaned;
          });

          setOriginalData(cleanedData);
          
          // Infer thresholds from the imported CSV data
          const inferredThresholds: ThresholdMap = {};
          const scores = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

          CRITERIA_CONFIG.forEach(criterion => {
            const thresholdValues = new Array(10).fill(0);
            
            scores.forEach((score, idx) => {
              const schoolsWithScore = cleanedData.filter(s => s[criterion.scoreKey] === score);
              if (schoolsWithScore.length > 0) {
                const brutValues = schoolsWithScore.map(s => s[criterion.brutKey]);
                if (criterion.type === 'higher_is_better') {
                  thresholdValues[idx] = Math.min(...brutValues);
                } else {
                  thresholdValues[idx] = Math.max(...brutValues);
                }
              } else {
                // Fallback if no school has this exact score
                thresholdValues[idx] = idx > 0 ? thresholdValues[idx - 1] : 0;
              }
            });
            
            inferredThresholds[criterion.id] = thresholdValues;
          });

          setThresholds(inferredThresholds);
          setInitialThresholds(inferredThresholds);

        } catch (err) {
          setError(err instanceof Error ? err.message : 'Import failed');
        } finally {
          setImporting(false);
        }
      },
      error: (err) => {
        setError(err.message);
        setImporting(false);
      }
    });
  };

  if (loading && originalData.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          <p className="text-sm font-medium text-zinc-500">Chargement des données...</p>
        </div>
      </div>
    );
  }

  const stats = processedData.length > 0 ? [
    { label: 'Écoles Classées', value: processedData.length, icon: GraduationCap, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Moyenne Note Finale', value: (processedData.reduce((acc, curr) => acc + curr.note_finale, 0) / processedData.length).toFixed(2), icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ] : [];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-red-100 selection:text-red-900">
      <header className="bg-white border-b border-black/5 sticky top-0 z-20 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Classement <span className="text-red-600">Post-CPGE</span></h1>
          </div>
          
          <div className="flex items-center gap-3">
            {processedData.length > 0 && (
              <>
                <div className="flex bg-zinc-100 p-1 rounded-xl mr-2">
                  <button
                    onClick={() => setViewMode('dashboard')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      viewMode === 'dashboard' 
                        ? 'bg-white text-zinc-900 shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => setViewMode('edition')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      viewMode === 'edition' 
                        ? 'bg-white text-zinc-900 shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    Édition
                  </button>
                </div>

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-xs font-semibold rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${importing ? 'animate-spin' : ''}`} />
                  Changer de CSV
                </button>
              </>
            )}
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Session Temporaire</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept=".csv" 
          className="hidden" 
        />

        {processedData.length === 0 ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl w-full bg-white p-10 rounded-3xl shadow-xl border border-black/5 text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Initialisation de l'Application</h2>
              <p className="text-zinc-500 mb-8 leading-relaxed">
                Veuillez importer un fichier CSV contenant les données des écoles pour commencer. 
              </p>
              
              <div className="grid grid-cols-1 gap-4 mb-8 text-left">
                <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-2xl border border-black/5">
                  <FileText className="w-5 h-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Format CSV requis</p>
                    <p className="text-xs text-zinc-500">Colonnes: ecole, type, rang, note_finale, etc.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-3"
              >
                {importing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                {importing ? "Importation..." : "Choisir un fichier CSV"}
              </button>
              
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-left">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-black/5 flex items-center gap-4"
                >
                  <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold tracking-tight text-zinc-900">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {viewMode === 'dashboard' ? (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <SchoolCharts data={processedData} onSchoolClick={setSelectedSchool} />
                  <SchoolScatterPlot data={processedData} onSchoolClick={setSelectedSchool} />
                  <SchoolTable data={processedData} onSchoolClick={setSelectedSchool} />
                </motion.div>
              ) : (
                <motion.div
                  key="edition"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ThresholdEditor 
                    thresholds={thresholds} 
                    onChange={setThresholds} 
                    data={originalData}
                    initialThresholds={initialThresholds}
                  />
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">Aperçu du Classement Temps Réel</h3>
                      <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md"
                      >
                        <Download className="w-4 h-4" />
                        Exporter en CSV
                      </button>
                    </div>
                    <SchoolTable data={processedData} onSchoolClick={setSelectedSchool} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>

      <SchoolDetailModal 
        school={selectedSchool} 
        onClose={() => setSelectedSchool(null)} 
      />

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-black/5 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-400 text-sm">
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-900">Méthodologie</a>
            <a href="#" className="hover:text-zinc-900">Sources</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
