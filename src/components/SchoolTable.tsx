import React, { useState, useMemo } from 'react';
import { SchoolData } from '../types';
import { ArrowUpDown, Search, Filter } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SchoolTableProps {
  data: SchoolData[];
  onSchoolClick: (school: SchoolData) => void;
}

export const SchoolTable: React.FC<SchoolTableProps> = ({ data, onSchoolClick }) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof SchoolData; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const sortedData = useMemo(() => {
    let sortableData = [...data];
    if (searchTerm) {
      sortableData = sortableData.filter(item => 
        item.ecole.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig, searchTerm]);

  const requestSort = (key: keyof SchoolData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
      <div className="p-4 border-bottom border-black/5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">Classement des Écoles</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher une école..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-black/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 border-y border-black/5">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => requestSort('rang')}>
                <div className="flex items-center gap-1">Rang <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => requestSort('ecole')}>
                <div className="flex items-center gap-1">École <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => requestSort('type')}>
                <div className="flex items-center gap-1">Type <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => requestSort('note_finale')}>
                <div className="flex items-center gap-1">Note Finale <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Excellence</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">International</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Pro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {sortedData.map((school) => (
              <tr 
                key={school.id_ecole} 
                onClick={() => onSchoolClick(school)}
                className="hover:bg-zinc-50 transition-colors group cursor-pointer"
              >
                <td className="px-4 py-4 text-sm font-mono text-zinc-500">#{school.rang}</td>
                <td className="px-4 py-4 text-sm font-medium text-zinc-900">{school.ecole}</td>
                <td className="px-4 py-4 text-sm text-zinc-500">
                  <span className="px-2 py-1 bg-zinc-100 rounded-lg text-xs font-medium">{school.type}</span>
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-red-600">{school.note_finale.toFixed(2)}</td>
                <td className="px-4 py-4 text-sm text-zinc-500">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500" 
                        style={{ width: `${(school.excellence_attract_select_index_score_5 / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium">{school.excellence_attract_select_index_score_5}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-zinc-500">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500" 
                        style={{ width: `${(school.international_exposition_index_score_5 / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium">{school.international_exposition_index_score_5}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-zinc-500">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500" 
                        style={{ width: `${(school.pro_tx_emploi_cefdg_score_5 / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium">{school.pro_tx_emploi_cefdg_score_5}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
