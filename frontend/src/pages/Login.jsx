// src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError("Failed to sign in. Check your email/password.");
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
           <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-xl shadow-sky-200">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M3 11 22 2 13 21 11 13 3 11z"/></svg>
           </div>
           <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
           <p className="text-sm text-slate-500">Sign in to track your green miles</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="email" 
              placeholder="Email address" 
              className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-4 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-4 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-70"
          >
            {isLoading ? <Loader className="animate-spin" size={20} /> : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs font-semibold text-slate-400">
          Don't have an account? <Link to="/signup" className="text-sky-600 cursor-pointer hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;