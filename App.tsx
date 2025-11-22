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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
       {viewMode === 'ADMIN' ? (
         <AdminPanel onLogout={handleBackToHome} />
       ) : (
         <StudentView onExit={handleBackToHome} />
       )}
    </div>
  );
}

export default App;
