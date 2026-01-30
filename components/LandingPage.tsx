
import React from 'react';
import { IELogo } from './IELogo'; // Import the new logo component

const LandingPage: React.FC<{ onNavigate: (page: 'signin' | 'signup') => void }> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
      <div className="text-center max-w-2xl">
        <div className="inline-block bg-gray-700 p-4 rounded-2xl mb-6">
          <IELogo className="w-16 h-16" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">Welcome to ieThreadScan</h1>
        <p className="text-xl text-gray-400 mb-12">
          AI-powered thread inspection for the oil and gas industry. Ensure the integrity of your connections with cutting-edge computer vision analysis.
        </p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => onNavigate('signin')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all shadow-lg"
          >
            Sign In
          </button>
          <button 
            onClick={() => onNavigate('signup')}
            className="bg-white text-gray-900 font-bold py-3 px-8 rounded-xl text-lg transition-all shadow-lg hover:bg-gray-200"
          >
            Sign Up
          </button>
        </div>
      </div>
      <footer className="absolute bottom-8 text-gray-500 text-sm">
        <p>© 2024 ieThreadScan. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
