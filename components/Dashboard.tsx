
import React from 'react';
import { SavedScan } from '../types';
import { Activity, CheckCircle, AlertCircle, BarChart3, TrendingUp } from 'lucide-react';

const Dashboard: React.FC<{ history: SavedScan[] }> = ({ history }) => {
  const totalScans = history.length;
  const passCount = history.filter(s => s.result.findings.length === 0).length;
  const failCount = totalScans - passCount;
  const passRate = totalScans > 0 ? ((passCount / totalScans) * 100).toFixed(1) : "0";

  const severeDefects = history.reduce((acc, scan) => 
    acc + scan.result.findings.filter(f => f.severity === 'High').length, 0
  );

  return (
    <div className="space-y-8">
      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Scans', value: totalScans, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pass Rate', value: `${passRate}%`, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Identified Defects', value: history.reduce((acc, s) => acc + s.result.findings.length, 0), icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Critical Actions', value: severeDefects, icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Status</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{stat.value}</div>
            <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Recent Inspections</h3>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-50">
            {history.length > 0 ? (
              history.slice(0, 5).map((scan, i) => (
                <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                    <img src={scan.thumbnail} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-bold text-slate-900">{scan.config.product || "Unnamed Asset"}</h4>
                    <p className="text-xs text-slate-500">{scan.config.connectionType} • {new Date(scan.timestamp).toLocaleString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                    scan.result.findings.length === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {scan.result.findings.length === 0 ? 'Pass' : `${scan.result.findings.length} Defects`}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400">
                <p>No recent activity found. Start a new scan to see data here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Fleet Distribution */}
        <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Fleet Integrity</h3>
            <p className="text-slate-400 text-sm mb-8">Summary of assets that require immediate maintenance intervention.</p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                  <span>Critical Condition</span>
                  <span>{failCount} Assets</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full" 
                    style={{ width: `${totalScans > 0 ? (failCount/totalScans)*100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                  <span>Healthy / Verified</span>
                  <span>{passCount} Assets</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${totalScans > 0 ? (passCount/totalScans)*100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-slate-800 p-4 rounded-xl border border-slate-700">
            <p className="text-xs font-medium text-slate-300">
              <span className="text-blue-400 font-bold">Pro Tip:</span> Regular scanning reduces unplanned downtime by 35% in high-pressure drilling environments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
