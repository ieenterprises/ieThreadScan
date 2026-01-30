import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { IELogo } from './IELogo'; // Import the new logo component

const SignIn: React.FC<{ onNavigate: (page: 'signup' | 'app') => void }> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onNavigate('app');
    } catch (error: any) { 
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <IELogo className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sign In to ieThreadScan</h1>
          <p className="text-gray-600 mt-2">Welcome back, please enter your details.</p>
        </div>

        <form onSubmit={handleSignIn} className="bg-white shadow-2xl rounded-2xl p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
              {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
            </button>
          </div>
        </form>

        <p className="text-center text-gray-600 mt-8">
          Don't have an account?{' '}
          <button onClick={() => onNavigate('signup')} className="font-bold text-blue-600 hover:underline">Sign Up</button>
        </p>
      </div>
    </div>
  );
};

export default SignIn;