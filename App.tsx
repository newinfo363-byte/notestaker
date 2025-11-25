<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import StudentDashboard from './components/StudentDashboard';
import { supabase } from './services/supabaseClient';
import { Student } from './types';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Check for cached sessions (no Supabase auth for admin anymore)
    const checkUser = async () => {
      // Check for cached student session
      const cachedStudent = localStorage.getItem('student_session');
      if (cachedStudent) {
        setStudentData(JSON.parse(cachedStudent));
      }

      // Check for cached admin session
      const cachedAdmin = localStorage.getItem('admin_session');
      if (cachedAdmin === 'true') {
        setIsAdmin(true);
      }

      setCheckingSession(false);
    };

    checkUser();
  }, []);

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setStudentData(null);
    localStorage.removeItem('student_session');
    localStorage.setItem('admin_session', 'true');
  };

  const handleStudentLogin = (student: Student) => {
    setStudentData(student);
    localStorage.setItem('student_session', JSON.stringify(student));
    setIsAdmin(false);
  };

  const handleLogout = async () => {
    setIsAdmin(false);
    setStudentData(null);
    localStorage.removeItem('student_session');
    localStorage.removeItem('admin_session');
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
=======
import React, { useState } from 'react';
import { ViewMode } from './types';
import { AdminPanel } from './components/AdminPanel';
import { StudentView } from './components/StudentView';
import { GraduationCap, Lock } from 'lucide-react';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode | null>(null);

  const handleAdminClick = () => setViewMode('ADMIN');
  const handleStudentClick = () => setViewMode('STUDENT');
  const handleBackToHome = () => setViewMode(null);

  if (!viewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-cyan-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center space-y-8">
          <div className="flex justify-center">
            <div className="bg-green-100 p-4 rounded-full">
              <GraduationCap className="w-16 h-16 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">NotesFlow</h1>
            <p className="text-gray-500 mt-2">Academic Resources Portal</p>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={handleStudentClick}
              className="w-full bg-primary hover:bg-teal-800 text-white text-lg font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-md flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-6 h-6" />
              Student Access
            </button>
            
            <button 
              onClick={handleAdminClick}
              className="w-full bg-white border-2 border-gray-200 hover:border-primary text-gray-600 hover:text-primary font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Admin Login
            </button>
          </div>

          <div className="text-xs text-gray-400 pt-4">
            v1.0.0 • Secure • Fast
          </div>
        </div>
>>>>>>> 2269a98efa93291e9c7a0df51eac2f843fc0a902
      </div>
    );
  }

<<<<<<< HEAD
  if (isAdmin) {
    return <AdminPanel onLogout={handleLogout} />;
  }

  if (studentData) {
    return <StudentDashboard student={studentData} onLogout={handleLogout} />;
  }

  return <Auth onAdminLogin={handleAdminLogin} onStudentLogin={handleStudentLogin} />;
=======
  return (
    <div className="min-h-screen bg-gray-50">
       {viewMode === 'ADMIN' ? (
         <AdminPanel onLogout={handleBackToHome} />
       ) : (
         <StudentView onExit={handleBackToHome} />
       )}
    </div>
  );
>>>>>>> 2269a98efa93291e9c7a0df51eac2f843fc0a902
}

export default App;
