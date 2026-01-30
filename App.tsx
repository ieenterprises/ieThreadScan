
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { app, db } from './services/firebase'; // Make sure firebase is initialized
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';

import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ThreadScanner from './components/ThreadScanner';
import Dashboard from './components/Dashboard';
import AssetHistory from './components/AssetHistory';
import Settings from './components/Settings';
import { IELogo } from './components/IELogo'; // Import the new logo component

import { LayoutDashboard, History, Settings as SettingsIcon, Scan, LogOut } from 'lucide-react';
import { AppView, SavedScan } from './types';

type Page = 'landing' | 'signin' | 'signup' | 'app';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const [currentView, setCurrentView] = useState<AppView>(AppView.SCANNER);
  const [history, setHistory] = useState<SavedScan[]>([]);

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setCurrentPage('app');
      } else {
        setUser(null);
        setCurrentPage('landing');
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-gray-800 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setCurrentView(AppView.SCANNER)}
          >
            <IELogo className="w-8 h-8" /> 
            <span className="text-xl font-bold tracking-tight">ieThreadScan</span>
          </div>
          
          <div className="flex items-center">
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
                      ? 'bg-gray-600 text-white shadow-md' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="border-l border-gray-700 ml-4 pl-4">
              <button 
                onClick={handleSignOut} 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 sm:text-4xl capitalize">
            {currentView.replace('-', ' ')}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {currentView === AppView.SCANNER && "Professional computer vision inspection for oilfield connections."}
            {currentView === AppView.DASHBOARD && "Real-time analytics and inspection KPIs across your fleet."}
            {currentView === AppView.HISTORY && "Full audit trail and historical condition monitoring."}
            {currentView === AppView.SETTINGS && "Configure scan parameters and AI engine preferences."}
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {currentView === AppView.SCANNER && user && (
            <ThreadScanner onSave={saveToHistory} user={user} />
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
      </main>
    </div>
  );
};

export default App;
