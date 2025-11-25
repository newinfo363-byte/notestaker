import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Student, Note } from '../types';
import { Search, ChevronDown, ChevronRight, FileText, Book } from './Icons';

interface StudentDashboardProps {
  student: Student;
  onLogout: () => void;
}

interface HierarchyData {
  id: string;
  subject_name: string;
  units: {
    id: string;
    unit_title: string;
    topics: {
      id: string;
      topic_title: string;
      notes: Note[]
    }[]
  }[]
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, onLogout }) => {
  const [branchName, setBranchName] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [hierarchy, setHierarchy] = useState<HierarchyData[]>([]);
  const [filteredData, setFilteredData] = useState<HierarchyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadStudentContext = async () => {
      setLoading(true);
      
      const branchReq = supabase.from('branches').select('branch_name').eq('id', student.branch_id).single();
      const sectionReq = supabase.from('sections').select('section_name').eq('id', student.section_id).single();
      
      const [bRes, sRes] = await Promise.all([branchReq, sectionReq]);
      if (bRes.data) setBranchName(bRes.data.branch_name);
      if (sRes.data) setSectionName(sRes.data.section_name);

      const { data, error } = await supabase
        .from('subjects')
        .select(`
          id, 
          subject_name,
          units (
            id,
            unit_title,
            topics (
              id,
              topic_title,
              notes (
                id,
                note_type,
                note_url,
                created_at
              )
            )
          )
        `)
        .eq('section_id', student.section_id);

      if (error) {
        console.error(error);
      } else {
        setHierarchy(data as any || []);
        setFilteredData(data as any || []);
      }
      setLoading(false);
    };

    loadStudentContext();
  }, [student]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(hierarchy);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    
    const filtered = hierarchy.map(sub => {
      const subCopy = { ...sub };
      const subjectMatches = sub.subject_name.toLowerCase().includes(lowerSearch);
      
      const matchingUnits = sub.units.map(unit => {
        const unitMatches = unit.unit_title.toLowerCase().includes(lowerSearch);
        const matchingTopics = unit.topics.filter(topic => 
          topic.topic_title.toLowerCase().includes(lowerSearch)
        );

        if (unitMatches || matchingTopics.length > 0) {
          return {
            ...unit,
            topics: unitMatches ? unit.topics : matchingTopics 
          };
        }
        return null;
      }).filter(Boolean) as typeof sub.units;

      if (subjectMatches || matchingUnits.length > 0) {
        return {
          ...sub,
          units: subjectMatches ? sub.units : matchingUnits
        };
      }
      return null;
    }).filter(Boolean) as HierarchyData[];

    setFilteredData(filtered);
    
    if (filtered.length > 0) {
        const newExpanded: Record<string, boolean> = {};
        filtered.forEach(sub => {
            sub.units.forEach(u => newExpanded[u.id] = true);
        });
        setExpandedUnits(newExpanded);
    }

  }, [searchTerm, hierarchy]);

  const toggleUnit = (id: string) => {
    setExpandedUnits(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-background text-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="bg-surface md:w-72 border-r border-border flex-shrink-0 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 text-brand mb-6">
            <Book className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight font-mono">UniNote<span className="text-white">_Hub</span></span>
          </div>
          
          <div className="mb-6 p-4 bg-black/40 rounded border border-border">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Authenticated As</p>
            <h2 className="font-bold text-white font-mono">{student.usn}</h2>
            <p className="text-xs text-brand mt-1">{branchName} <span className="text-gray-600">/</span> {sectionName}</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search database..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-black rounded border border-border focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm transition-all text-white placeholder-gray-700 font-mono"
            />
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-border">
          <button 
            onClick={onLogout}
            className="w-full flex justify-center items-center gap-2 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors text-sm font-medium border border-transparent hover:border-gray-800"
          >
            Disconnect Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
              <p className="text-brand font-mono text-sm animate-pulse">Loading modules...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            
            {filteredData.length === 0 && (
              <div className="text-center py-20 border border-dashed border-border rounded-xl">
                <p className="text-gray-600 text-lg font-mono">No matching records found.</p>
              </div>
            )}

            {filteredData.map(subject => (
              <div key={subject.id} className="bg-surface rounded-lg shadow-lg border border-border overflow-hidden">
                <div className="bg-gradient-to-r from-brand to-red-900 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2 font-mono">
                    <Book className="w-5 h-5 opacity-80" />
                    {subject.subject_name}
                  </h3>
                  <span className="text-xs bg-black/30 text-white px-2 py-1 rounded">Subject ID: {subject.id.slice(0,4)}</span>
                </div>

                <div className="divide-y divide-border">
                  {subject.units.map(unit => (
                    <div key={unit.id} className="group">
                      <button
                        onClick={() => toggleUnit(unit.id)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
                      >
                        <span className="font-medium text-gray-300 group-hover:text-white transition-colors">{unit.unit_title}</span>
                        {expandedUnits[unit.id] ? (
                          <ChevronDown className="w-5 h-5 text-brand" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-brand" />
                        )}
                      </button>

                      {expandedUnits[unit.id] && (
                        <div className="bg-black/40 px-6 py-6 space-y-6 border-t border-border inset-shadow">
                          {unit.topics.length === 0 && <p className="text-sm text-gray-600 italic font-mono">No topics available.</p>}
                          
                          {unit.topics.map(topic => (
                            <div key={topic.id} className="pl-4 border-l-2 border-border hover:border-brand transition-colors">
                              <h4 className="text-sm font-semibold text-brand mb-3 font-mono">{topic.topic_title}</h4>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {topic.notes.map(note => (
                                  <a 
                                    key={note.id}
                                    href={note.note_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-surface rounded border border-border hover:border-brand/50 hover:shadow-[0_0_15px_rgba(229,9,20,0.1)] transition-all group/note"
                                  >
                                    <div className={`p-2 rounded ${
                                      note.note_type === 'pdf' ? 'bg-red-900/20 text-red-500' :
                                      note.note_type === 'img' ? 'bg-purple-900/20 text-purple-400' :
                                      note.note_type === 'video' ? 'bg-blue-900/20 text-blue-400' :
                                      'bg-yellow-900/20 text-yellow-400'
                                    }`}>
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="overflow-hidden">
                                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{note.note_type}</p>
                                      <p className="text-sm text-gray-300 truncate group-hover/note:text-white font-mono">Access Resource</p>
                                    </div>
                                  </a>
                                ))}
                                {topic.notes.length === 0 && (
                                  <span className="text-xs text-gray-600 font-mono">No data packets.</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;