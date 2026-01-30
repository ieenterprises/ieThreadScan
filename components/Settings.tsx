
import React from 'react';
import { Cpu, Zap, Camera, Bell, ShieldCheck } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* AI Preferences */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <Cpu className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900">AI Inspection Engine</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Advanced Multimodal Analysis</p>
              <p className="text-xs text-slate-500">Use Gemini Pro for deeper surface mapping.</p>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Confidence Threshold</p>
              <p className="text-xs text-slate-500">Sensitivity level for defect reporting (85%).</p>
            </div>
            <input type="range" className="w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Workflow Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-900">Workflow & Capture</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Auto-Advance Capture</p>
              <p className="text-xs text-slate-500">Automatically proceed after each capture frame.</p>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">High Quality Frames</p>
              <p className="text-xs text-slate-500">Capture images in 1080p for maximum detail.</p>
            </div>
            <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 py-8">
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Enterprise Edition 2.1.0</span>
        </div>
        <button className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl hover:bg-slate-800 transition-all">
          Sync Inspection Data
        </button>
      </div>
    </div>
  );
};

export default Settings;
