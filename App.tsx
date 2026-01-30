
import React, { useState, useEffect } from 'react';
import ThreadScanner from './components/ThreadScanner';
import Dashboard from './components/Dashboard';
import AssetHistory from './components/AssetHistory';
import Settings from './components/Settings';
import { ShieldCheck, LayoutDashboard, History, Settings as SettingsIcon, Scan } from 'lucide-react';
import { AppView, SavedScan } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.SCANNER);
  const [history, setHistory] = useState<SavedScan[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('thread_scan_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveToHistory = (scan: SavedScan) => {
    const newHistory = [scan, ...history];
    setHistory(newHistory);
    localStorage.setItem('thread_scan_history', JSON.stringify(newHistory));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation / Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setCurrentView(AppView.SCANNER)}
          >
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">AI ThreadScan</span>
          </div>
          
          <nav className="hidden md:flex space-x-1">
            {[
              { id: AppView.SCANNER, label: 'New Scan', icon: Scan },
              { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
              { id: AppView.HISTORY, label: 'Asset History', icon: History },
              { id: AppView.SETTINGS, label: 'Settings', icon: SettingsIcon },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentView === item.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="md:hidden">
             <button className="p-2 text-slate-400">
               <ShieldCheck className="w-6 h-6" />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl capitalize">
            {currentView.replace('-', ' ')}
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            {currentView === AppView.SCANNER && "Professional computer vision inspection for oilfield connections."}
            {currentView === AppView.DASHBOARD && "Real-time analytics and inspection KPIs across your fleet."}
            {currentView === AppView.HISTORY && "Full audit trail and historical condition monitoring."}
            {currentView === AppView.SETTINGS && "Configure scan parameters and AI engine preferences."}
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {currentView === AppView.SCANNER && (
            <ThreadScanner onSave={saveToHistory} />
          )}
          {currentView === AppView.DASHBOARD && (
            <Dashboard history={history} />
          )}
          {currentView === AppView.HISTORY && (
            <AssetHistory history={history} onClear={() => {
              setHistory([]);
              localStorage.removeItem('thread_scan_history');
            }} />
          )}
          {currentView === AppView.SETTINGS && (
            <Settings />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <p>© 2024 AI Thread Inspector Pro. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="hover:text-slate-800">Privacy Policy</a>
            <a href="#" className="hover:text-slate-800">Terms of Service</a>
            <a href="#" className="hover:text-slate-800">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
