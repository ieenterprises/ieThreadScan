
import React from 'react';
import { SavedScan } from '../types';
import { Search, Download, Trash2, ExternalLink, Calendar } from 'lucide-react';

const AssetHistory: React.FC<{ history: SavedScan[], onClear: () => void }> = ({ history, onClear }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search assets..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={onClear}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Clear Data
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Asset Info</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Configuration</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Scan Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.length > 0 ? (
              history.map((scan) => (
                <tr key={scan.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden flex-shrink-0">
                        <img src={scan.thumbnail} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{scan.config.product || "Unnamed Asset"}</p>
                        <p className="text-xs text-slate-500">SN: {scan.id.split('-')[0].toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-600">
                      <p className="font-bold">{scan.config.connectionType}</p>
                      <p>{scan.config.connectionStandard}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Calendar className="w-3 h-3" />
                      {new Date(scan.timestamp).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight ${
                      scan.result.findings.length === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {scan.result.findings.length === 0 ? 'Clear' : 'Defect Detected'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No historical data available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetHistory;
