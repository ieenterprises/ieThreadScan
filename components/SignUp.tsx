import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { IELogo } from './IELogo'; // Import the new logo component

const SignUp: React.FC<{ onNavigate: (page: 'signin' | 'app' | 'landing') => void }> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      onNavigate('app');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative">
        <div className="absolute top-8 left-8 flex gap-4">
            <button
                onClick={() => onNavigate('landing')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
            </button>
            <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all"
            >
                <RotateCcw className="w-4 h-4" />
                Refresh
            </button>
        </div>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <IELogo className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create an Account</h1>
          <p className="text-gray-600 mt-2">Start your journey with ieThreadScan.</p>
        </div>

        <form onSubmit={handleSignUp} className="bg-white shadow-2xl rounded-2xl p-8 space-y-6">
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Confirm Password</label>
            <input 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none"
              required
            />
          </div>
          <div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
              {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
            </button>
          </div>
        </form>

        <p className="text-center text-gray-600 mt-8">
          Already have an account?{' '}
          <button onClick={() => onNavigate('signin')} className="font-bold text-blue-600 hover:underline">Sign In</button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;