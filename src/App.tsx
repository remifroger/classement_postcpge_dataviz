import React, { useEffect, useState, useRef } from 'react';
import { SchoolData } from './types';
import { SchoolTable } from './components/SchoolTable';
import { SchoolCharts } from './components/SchoolCharts';
import { SchoolDetailModal } from './components/SchoolDetailModal';
import { 
  GraduationCap, 
  Globe, 
  Briefcase, 
  TrendingUp, 
  AlertCircle,
  Loader2,
  Upload,
  FileText,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import Papa from 'papaparse';

export default function App() {
  const [data, setData] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/schools');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parseFrenchNumber = (val: any) => {
            if (val === null || val === undefined || val === '') return 0;
            if (typeof val === 'number') return val;
            // Replace comma with dot and parse
            const normalized = String(val).replace(',', '.').replace(/\s/g, '');
            const parsed = parseFloat(normalized);
            return isNaN(parsed) ? 0 : parsed;
          };

          // Clean data and handle French number format (commas)
          const cleanedData = results.data.map((row: any) => {
            const cleaned: any = { ...row };
            // Apply numeric parsing to all known numeric fields
            const numericFields = [
              'note_finale', 'rang', 
              'excellence_attract_select_index_score_5', 
              'international_exposition_index_score_5', 
              'pro_tx_emploi_cefdg_score_5', 
              'encadrement_index_score_5', 
              'fiche_ecole_ouverture_sociale_index_score_5'
            ];

            // Also handle any field ending in _brut or _score_5 or _score_2
            Object.keys(row).forEach(key => {
              if (key.endsWith('_brut') || key.endsWith('_score_5') || key.endsWith('_score_2') || key === 'note_finale' || key === 'rang' || key === 'id_ecole') {
                cleaned[key] = parseFrenchNumber(row[key]);
              }
            });

            return cleaned;
          });

          const response = await fetch('/api/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleanedData),
          });

          if (!response.ok) throw new Error('Import failed');
          
          await fetchData();
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

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-sm font-medium text-zinc-500">Chargement des données...</p>
        </div>
      </div>
    );
  }

  const stats = data.length > 0 ? [
    { label: 'Écoles Classées', value: data.length, icon: GraduationCap, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Moyenne Note Finale', value: (data.reduce((acc, curr) => acc + curr.note_finale, 0) / data.length).toFixed(2), icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ] : [];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <header className="bg-white border-b border-black/5 sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Classement <span className="text-red-600">Post-CPGE</span></h1>
          </div>
          <div className="flex items-center gap-4">
            {data.length > 0 && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-xs font-semibold rounded-lg transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${importing ? 'animate-spin' : ''}`} />
                Ré-importer CSV
              </button>
            )}
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Classement 2026</span>
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

        {data.length === 0 ? (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
            <SchoolCharts data={data} onSchoolClick={setSelectedSchool} />
            <SchoolTable data={data} onSchoolClick={setSelectedSchool} />
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
