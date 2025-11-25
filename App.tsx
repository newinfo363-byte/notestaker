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
      </div>
    );
  }

  if (isAdmin) {
    return <AdminPanel onLogout={handleLogout} />;
  }

  if (studentData) {
    return <StudentDashboard student={studentData} onLogout={handleLogout} />;
  }

  return <Auth onAdminLogin={handleAdminLogin} onStudentLogin={handleStudentLogin} />;
}

export default App;
