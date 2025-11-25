import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Student } from '../types';
import MatrixBackground from './MatrixBackground';

interface AuthProps {
  onAdminLogin: () => void;
  onStudentLogin: (student: Student) => void;
}

const Auth: React.FC<AuthProps> = ({ onAdminLogin, onStudentLogin }) => {
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Admin State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Student State
  const [usn, setUsn] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      onAdminLogin();
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const usnRegex = /^[0-9A-Za-z]{5,}$/;

    if (!usnRegex.test(usn)) {
      setError('Invalid USN format.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('usn', usn.toUpperCase())
      .single();

    setLoading(false);

    if (error || !data) {
      setError('Student not found. Please contact administration.');
    } else {
      onStudentLogin(data as Student);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <MatrixBackground />

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="bg-surface/80 backdrop-blur-md border border-brand/30 rounded-2xl shadow-[0_0_25px_rgba(229,9,20,0.2)] overflow-hidden">

          {/* Header */}
          <div className="p-8 text-center border-b border-white/5">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tighter">
              <span className="text-brand">&lt;</span>UniNote<span className="text-brand">/&gt;</span>
            </h1>
            <p className="text-gray-400 text-sm font-light">Academic Resources Portal</p>
          </div>

          {/* Toggle */}
          <div className="flex p-2 gap-2">
            <button
              onClick={() => { setRole('student'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${role === 'student'
                  ? 'bg-brand text-white shadow-[0_0_10px_rgba(229,9,20,0.4)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              Student
            </button>
            <button
              onClick={() => { setRole('admin'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${role === 'admin'
                  ? 'bg-brand text-white shadow-[0_0_10px_rgba(229,9,20,0.4)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              Admin
            </button>
          </div>

          {/* Forms */}
          <div className="p-8 pt-4">
            {error && (
              <div className="mb-6 p-3 bg-red-900/20 text-red-400 text-sm rounded border border-red-900/50 flex items-center">
                <span className="mr-2">⚠️</span> {error}
              </div>
            )}

            {role === 'student' ? (
              <form onSubmit={handleStudentLogin} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">University Seat Number</label>
                  <input
                    type="text"
                    value={usn}
                    onChange={(e) => setUsn(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 rounded border border-gray-700 text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder-gray-600"
                    placeholder="e.g. 02JST24UCS043"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand hover:bg-brand-hover text-white font-bold py-3 rounded shadow-[0_4px_14px_0_rgba(229,9,20,0.39)] hover:shadow-[0_6px_20px_rgba(229,9,20,0.23)] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Decrypting...' : 'Access Notes'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 rounded border border-gray-700 text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder-gray-600"
                    placeholder="admin@college.edu"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 rounded border border-gray-700 text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder-gray-600"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-bold py-3 rounded hover:bg-gray-200 shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Login as Admin'}
                </button>
              </form>
            )}
          </div>

          <div className="bg-black/40 p-3 text-center border-t border-white/5">
            <p className="text-[10px] text-gray-600">SECURE SYSTEM // RESTRICTED ACCESS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;