
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { app, db } from './services/firebase'; 
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';

import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ThreadScanner from './components/ThreadScanner';
import Dashboard from './components/Dashboard';
import AssetHistory from './components/AssetHistory';
import Settings from './components/Settings';
import { IELogo } from './components/IELogo'; 

import { LayoutDashboard, History, Settings as SettingsIcon, Scan, LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppView, SavedScan } from './types';

type Page = 'landing' | 'signin' | 'signup' | 'app';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const storedPage = sessionStorage.getItem('currentPage');
    if (storedPage === 'signin' || storedPage === 'signup') {
        return storedPage as Page;
    }
    return 'landing';
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const [currentView, setCurrentView] = useState<AppView>(AppView.SCANNER);
  const [history, setHistory] = useState<SavedScan[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop sidebar collapse

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setCurrentPage('app');
        sessionStorage.removeItem('currentPage');
      } else {
        setUser(null);
        setCurrentPage(prevPage => prevPage === 'app' ? 'landing' : prevPage);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        const q = query(
          collection(db, 'scans'), 
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const userHistory = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as SavedScan[];
        setHistory(userHistory);
      };
      fetchHistory();
    }
  }, [user]);

  const saveToHistory = async (scan: Omit<SavedScan, 'id' | 'timestamp' | 'userId'>) => {
    if (user) {
      try {
        const docRef = await addDoc(collection(db, "scans"), {
          ...scan,
          userId: user.uid,
          timestamp: serverTimestamp()
        });
        setHistory(prev => [{ ...scan, id: docRef.id, timestamp: Date.now(), userId: user.uid } as SavedScan, ...prev]);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleNavigate = (page: Page) => {
    if (page === 'signin' || page === 'signup') {
      sessionStorage.setItem('currentPage', page);
    } else {
      sessionStorage.removeItem('currentPage');
    }
    setCurrentPage(page);
  };
  
  if (isLoadingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900">Loading...</div>;
  }

  if (!user) {
    switch (currentPage) {
      case 'signin':
        return <SignIn onNavigate={handleNavigate} />;
      case 'signup':
        return <SignUp onNavigate={handleNavigate} />;
      case 'landing':
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  }

  const navItems = [
    { id: AppView.SCANNER, label: 'New Scan', icon: Scan },
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.HISTORY, label: 'Asset History', icon: History },
    { id: AppView.SETTINGS, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100 relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 text-slate-800 transform transition-all duration-300 ease-in-out
        md:translate-x-0 md:static md:h-screen flex flex-col shadow-xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isSidebarCollapsed ? 'w-20' : 'w-64'}
      `}>
        {/* Desktop Collapse Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex absolute -right-3 top-20 bg-blue-600 rounded-full p-1 border border-white text-white z-50 hover:bg-blue-700 transition-colors shadow-lg"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo Area */}
        <div className={`h-16 flex items-center px-4 border-b border-slate-100 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div 
            className="flex items-center space-x-2 cursor-pointer overflow-hidden"
            onClick={() => setCurrentView(AppView.SCANNER)}
          >
            <IELogo className={`w-8 h-8 text-blue-600 flex-shrink-0 transition-all ${isSidebarCollapsed ? 'scale-110' : ''}`} /> 
            <span className={`text-xl font-bold tracking-tight whitespace-nowrap text-slate-900 transition-opacity duration-200 ${isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
              ieThreadScan
            </span>
          </div>
          {!isSidebarCollapsed && (
            <button 
              className="md:hidden text-slate-500 hover:text-slate-800"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setIsSidebarOpen(false);
              }}
              title={isSidebarCollapsed ? item.label : ''}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative
                ${currentView === item.id 
                  ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }
                ${isSidebarCollapsed ? 'justify-center' : ''}
              `}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${currentView === item.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              
              {!isSidebarCollapsed && (
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
              )}

              {/* Tooltip for collapsed state */}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                  {item.label}
                  {/* Triangle pointer */}
                  <div className="absolute top-1/2 -left-1 w-2 h-2 bg-slate-800 rotate-45 transform -translate-y-1/2"></div>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleSignOut} 
            title={isSidebarCollapsed ? "Sign Out" : ""}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all group relative
              ${isSidebarCollapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 text-slate-400 group-hover:text-red-500 transition-colors" />
            {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden text-ellipsis">Sign Out</span>}
            
            {isSidebarCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                  Sign Out
                   <div className="absolute top-1/2 -left-1 w-2 h-2 bg-slate-800 rotate-45 transform -translate-y-1/2"></div>
                </div>
              )}
          </button>
          
          <div className={`mt-6 flex items-center gap-3 px-2 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
             <div className="w-8 h-8 flex-shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
               {user.email ? user.email[0].toUpperCase() : 'U'}
             </div>
             {!isSidebarCollapsed && (
               <div className="flex-1 overflow-hidden min-w-0">
                 <p className="text-sm font-bold text-slate-800 truncate">{user.email?.split('@')[0]}</p>
                 <p className="text-xs text-slate-500 truncate">{user.email}</p>
               </div>
             )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white shadow-sm h-16 flex items-center px-4 justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <IELogo className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-slate-900">ieThreadScan</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-grow p-4 sm:p-8 lg:p-12 overflow-y-auto bg-slate-50">
          <div className="max-w-6xl mx-auto">
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
              {currentView === AppView.SCANNER && user && (
                <ThreadScanner onSave={saveToHistory} />
              )}
              {currentView === AppView.DASHBOARD && (
                <Dashboard history={history} />
              )}
              {currentView === AppView.HISTORY && (
                <AssetHistory history={history} onClear={() => {
                  setHistory([]); 
                }} />
              )}
              {currentView === AppView.SETTINGS && (
                <Settings />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
