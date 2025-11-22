import React, { useState, useEffect } from 'react';
import { Branch, Section, Subject, Unit, Topic, Note } from '../types';
import { dataService } from '../services/dataService';
import { 
  Search, ChevronRight, ChevronDown, FileText, Image, 
  Video, Type, Home, Menu, X, Download, ExternalLink 
} from 'lucide-react';

interface StudentViewProps {
  onExit: () => void;
}

// Extracted Component to fix TypeScript issue with 'key' prop on inline component
const NoteCard = ({ note }: { note: Note }) => {
  const icon = {
    'pdf': <FileText className="w-6 h-6 text-red-500" />,
    'img': <Image className="w-6 h-6 text-blue-500" />,
    'video': <Video className="w-6 h-6 text-purple-500" />,
    'text': <Type className="w-6 h-6 text-gray-500" />
  }[note.type];

  const handleView = () => {
    if (note.type === 'text' || !note.url) return; // Text is shown inline, do nothing.
    window.open(note.url, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = () => {
    if (!note.url) return;
    const link = document.createElement('a');
    link.href = note.url;
    link.download = note.title || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{note.title}</h4>
          <p className="text-xs text-gray-500">{new Date(note.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      
      {note.type === 'text' && note.content && (
        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{note.content}</p>
      )}

      <div className="flex gap-2 mt-auto pt-2">
        <button onClick={handleView} className="flex-1 bg-primary text-white text-sm py-2 rounded flex items-center justify-center gap-2 hover:bg-teal-800 disabled:opacity-50" disabled={note.type === 'text'}>
           <ExternalLink className="w-4 h-4" /> View
        </button>
        {note.type === 'pdf' && note.url && (
          <button onClick={handleDownload} className="px-3 border border-gray-300 rounded hover:bg-gray-50">
            <Download className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export const StudentView: React.FC<StudentViewProps> = ({ onExit }) => {
  // Data
  const [branches, setBranches] = useState<Branch[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  // Selection State
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Content Data
  const [units, setUnits] = useState<Unit[]>([]);
  const [topicsMap, setTopicsMap] = useState<Record<string, Topic[]>>({});
  const [notesMap, setNotesMap] = useState<Record<string, Note[]>>({});

  // UI State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  // --- Initialization ---
  useEffect(() => {
    dataService.getBranches().then(setBranches);
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      dataService.getSections(selectedBranch).then(setSections);
      setSelectedSection(null);
      setSubjects([]);
    }
  }, [selectedBranch]);

  useEffect(() => {
    if (selectedSection) {
      dataService.getSubjects(selectedSection).then(setSubjects);
      setSelectedSubject(null);
    }
  }, [selectedSection]);

  // --- Load Content when Subject Selected ---
  useEffect(() => {
    if (selectedSubject) {
      loadSubjectContent(selectedSubject.id);
      setMobileMenuOpen(false); // Close menu on mobile after selection
    }
  }, [selectedSubject]);

  const loadSubjectContent = async (subjectId: string) => {
    const us = await dataService.getUnits(subjectId);
    setUnits(us);
    
    // Load topics for all units (simulated eagerness for UX)
    const tMap: Record<string, Topic[]> = {};
    const nMap: Record<string, Note[]> = {};
    
    for (const u of us) {
      const ts = await dataService.getTopics(u.id);
      tMap[u.id] = ts;
      
      for (const t of ts) {
        const ns = await dataService.getNotes(t.id);
        nMap[t.id] = ns;
      }
    }
    setTopicsMap(tMap);
    setNotesMap(nMap);
  };

  const toggleUnit = (unitId: string) => {
    const newSet = new Set(expandedUnits);
    if (newSet.has(unitId)) newSet.delete(unitId);
    else newSet.add(unitId);
    setExpandedUnits(newSet);
  };

  // Filter logic
  const filteredUnits = units.filter(u => {
    if (!searchQuery) return true;
    const matchesUnit = u.title.toLowerCase().includes(searchQuery.toLowerCase());
    const unitTopics = topicsMap[u.id] || [];
    const matchesTopic = unitTopics.some(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesUnit || matchesTopic;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 text-gray-600" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="font-bold text-xl text-primary flex items-center gap-2">
              <span className="bg-primary text-white p-1 rounded">NF</span> NotesFlow
            </div>
          </div>
          
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search units or topics..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-primary outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <button onClick={onExit} className="text-gray-500 hover:text-gray-900 text-sm font-medium">
            Exit
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full flex">
        
        {/* Sidebar Navigation (Desktop) */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-[calc(100vh-64px)] md:overflow-y-auto
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-4 flex justify-between items-center md:hidden border-b">
            <span className="font-bold text-gray-700">Browse Subjects</span>
            <button onClick={() => setMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
          </div>

          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">1. Select Branch</h3>
              <select 
                className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary outline-none"
                value={selectedBranch || ''}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="">-- Choose Branch --</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            {selectedBranch && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">2. Select Section</h3>
                <div className="space-y-1">
                  {sections.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSection(s.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${selectedSection === s.id ? 'bg-secondary text-white font-medium shadow-md' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedSection && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">3. Select Subject</h3>
                <div className="space-y-1">
                  {subjects.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSubject(s)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between ${selectedSubject?.id === s.id ? 'bg-primary text-white font-medium shadow-md' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      {s.name}
                      {selectedSubject?.id === s.id && <ChevronRight className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Overlay */}
        {mobileMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)]">
          {!selectedSubject ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4">
              <div className="bg-green-100 p-6 rounded-full">
                <Home className="w-12 h-12 text-primary opacity-50" />
              </div>
              <h2 className="text-2xl font-bold text-gray-700">Welcome to NotesFlow</h2>
              <p className="max-w-md">Select your Branch, Section, and Subject from the menu to start browsing notes, videos, and resources.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{selectedSubject.name}</h1>
                <p className="text-gray-500 mt-1">Browse units and topics below</p>
              </div>

              {/* Search Bar Mobile */}
              <div className="md:hidden mb-6">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full p-3 border rounded-lg shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {filteredUnits.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                  <p className="text-gray-400">No content found matching your criteria.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUnits.map(unit => (
                    <div key={unit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <button 
                        onClick={() => toggleUnit(unit.id)}
                        className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors text-left"
                      >
                        <span className="text-lg font-bold text-gray-800">{unit.title}</span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedUnits.has(unit.id) ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Topics Accordion Body */}
                      {expandedUnits.has(unit.id) && (
                        <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-6">
                          {(topicsMap[unit.id] || []).map(topic => (
                            <div key={topic.id} className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                              <div className="mb-4 border-b border-gray-100 pb-2">
                                <h3 className="text-lg font-semibold text-primary">{topic.title}</h3>
                                <p className="text-sm text-gray-500">{topic.description}</p>
                              </div>

                              {/* Notes Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(notesMap[topic.id] || []).map(note => (
                                  <NoteCard key={note.id} note={note} />
                                ))}
                                {(notesMap[topic.id] || []).length === 0 && (
                                  <p className="text-sm text-gray-400 italic col-span-full">No notes uploaded yet.</p>
                                )}
                              </div>
                            </div>
                          ))}
                          {(topicsMap[unit.id] || []).length === 0 && (
                            <p className="text-center text-gray-400 italic">No topics available.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};