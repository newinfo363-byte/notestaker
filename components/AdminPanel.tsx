<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { supabase, uploadFileToStorage } from '../services/supabaseClient';
import { NoteType } from '../types';
import { ChevronRight, Plus, Trash2, Upload, Folder, FileText, ArrowLeft } from './Icons';

type Level = 'branches' | 'sections' | 'subjects' | 'units' | 'topics' | 'notes';
=======
import React, { useState, useEffect, useRef } from 'react';
import { ADMIN_PASSWORD } from '../constants';
import { Branch, Section, Subject, Unit, Topic, Note, NoteType } from '../types';
import { dataService } from '../services/dataService';
import { 
  LayoutDashboard, LogOut, FolderTree, ChevronRight, Plus, Trash2, 
  FileText, Image, Video, Type, Save, X, UploadCloud, Loader2, Link as LinkIcon
} from 'lucide-react';
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");
>>>>>>> 2269a98efa93291e9c7a0df51eac2f843fc0a902

interface AdminPanelProps {
  onLogout: () => void;
}

<<<<<<< HEAD
const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  // Navigation State
  const [path, setPath] = useState<{ id: string, name: string, level: Level }[]>([]);
  const [currentLevel, setCurrentLevel] = useState<Level>('branches');
  const [parentId, setParentId] = useState<string | null>(null);

  // Data State
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [newItemName, setNewItemName] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [noteType, setNoteType] = useState<NoteType>('pdf');
  const [textNoteContent, setTextNoteContent] = useState('');

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel, parentId]);

  const fetchItems = async () => {
    setLoading(true);
    let query;

    switch (currentLevel) {
      case 'branches':
        query = supabase.from('branches').select('*').order('created_at');
        break;
      case 'sections':
        query = supabase.from('sections').select('*').eq('branch_id', parentId!).order('section_name');
        break;
      case 'subjects':
        query = supabase.from('subjects').select('*').eq('section_id', parentId!).order('subject_name');
        break;
      case 'units':
        query = supabase.from('units').select('*').eq('subject_id', parentId!).order('unit_title');
        break;
      case 'topics':
        query = supabase.from('topics').select('*').eq('unit_id', parentId!).order('topic_title');
        break;
      case 'notes':
        query = supabase.from('notes').select('*').eq('topic_id', parentId!).order('created_at');
        break;
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data');
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const handleDrillDown = (item: any, name: string) => {
    const nextLevelMap: Record<Level, Level> = {
      branches: 'sections',
      sections: 'subjects',
      subjects: 'units',
      units: 'topics',
      topics: 'notes',
      notes: 'notes' // Terminal
    };
    
    const next = nextLevelMap[currentLevel];
    if (currentLevel === 'notes') return;

    setPath([...path, { id: item.id, name: name, level: currentLevel }]);
    setParentId(item.id);
    setCurrentLevel(next);
  };

  const handleGoBack = () => {
    if (path.length === 0) return;
    const newPath = [...path];
    newPath.pop();
    setPath(newPath);
    
    if (newPath.length === 0) {
      setCurrentLevel('branches');
      setParentId(null);
    } else {
      const last = newPath[newPath.length - 1];
      const levelMap: Record<Level, Level> = {
        branches: 'sections',
        sections: 'subjects',
        subjects: 'units',
        units: 'topics',
        topics: 'notes',
        notes: 'notes'
      };
      setCurrentLevel(levelMap[last.level]);
      setParentId(last.id);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName && currentLevel !== 'notes') return;
    setLoading(true);

    let insertQuery;
    let payload: any = {};

    switch (currentLevel) {
      case 'branches':
        payload = { branch_name: newItemName };
        insertQuery = supabase.from('branches').insert(payload);
        break;
      case 'sections':
        payload = { branch_id: parentId, section_name: newItemName };
        insertQuery = supabase.from('sections').insert(payload);
        break;
      case 'subjects':
        payload = { section_id: parentId, subject_name: newItemName };
        insertQuery = supabase.from('subjects').insert(payload);
        break;
      case 'units':
        payload = { subject_id: parentId, unit_title: newItemName };
        insertQuery = supabase.from('units').insert(payload);
        break;
      case 'topics':
        payload = { unit_id: parentId, topic_title: newItemName };
        insertQuery = supabase.from('topics').insert(payload);
        break;
      case 'notes':
        await handleAddNote();
        setLoading(false);
        return; 
    }

    const { error } = await insertQuery;
    if (error) {
      alert(`Error adding ${currentLevel}: ` + error.message);
    } else {
      setNewItemName('');
      fetchItems();
    }
    setLoading(false);
  };

  const handleAddNote = async () => {
    let url = '';
    
    if (noteType === 'text' || noteType === 'video') {
      url = textNoteContent;
    } else if (uploadFile) {
      const filePath = `${parentId}/${Date.now()}_${uploadFile.name}`;
      const publicUrl = await uploadFileToStorage(uploadFile, filePath);
      if (!publicUrl) {
        alert("Upload failed");
        return;
      }
      url = publicUrl;
    } else {
      alert("Please provide content");
      return;
    }

    const { error } = await supabase.from('notes').insert({
      topic_id: parentId,
      note_type: noteType,
      note_url: url
    });

    if (error) alert(error.message);
    else {
      setTextNoteContent('');
      setUploadFile(null);
      fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will delete all sub-items.')) return;
    
    const { error } = await supabase.from(currentLevel).delete().eq('id', id);
    if (error) alert('Error deleting: ' + error.message);
    else fetchItems();
  };

  const getTitle = (item: any) => {
    return item.branch_name || item.section_name || item.subject_name || item.unit_title || item.topic_title || item.note_url;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-gray-200">
      {/* Header */}
      <header className="bg-surface border-b border-border p-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-brand text-white p-2 rounded shadow-[0_0_10px_rgba(229,9,20,0.5)]">
            <Folder className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Admin<span className="text-brand">Panel</span></h1>
        </div>
        <button onClick={onLogout} className="text-sm text-gray-400 hover:text-brand font-medium transition-colors border border-border px-4 py-2 rounded hover:border-brand">
          Logout
        </button>
      </header>

      {/* Breadcrumb & Controls */}
      <div className="bg-surface/50 p-4 border-b border-border">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 flex-wrap font-mono">
            <button 
              onClick={() => { setPath([]); setCurrentLevel('branches'); setParentId(null); }}
              className={`hover:text-brand transition-colors ${path.length === 0 ? 'text-brand font-bold' : ''}`}
            >
              root
            </button>
            {path.map((p, idx) => (
              <React.Fragment key={p.id}>
                <ChevronRight className="w-4 h-4 text-gray-600" />
                <span className={idx === path.length - 1 ? 'text-brand font-bold' : 'hover:text-white cursor-pointer'}>
                  {p.name}
                </span>
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold capitalize text-white flex items-center gap-2">
              <span className="text-brand">/</span> {currentLevel}
            </h2>
            {path.length > 0 && (
              <button onClick={handleGoBack} className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-6xl mx-auto w-full space-y-6">
          
          {/* Add New Item Card */}
          <div className="bg-surface border border-border rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-white">Add New {currentLevel.slice(0, -1)}</h3>
            
            {currentLevel === 'notes' ? (
              <div className="space-y-4">
                <div className="flex gap-4 mb-4">
                  {(['pdf', 'img', 'video', 'text'] as NoteType[]).map(type => (
                    <button 
                      key={type}
                      onClick={() => setNoteType(type)}
                      className={`px-4 py-2 rounded border transition-all text-sm font-medium uppercase tracking-wider ${
                        noteType === type 
                          ? 'bg-brand text-white border-brand shadow-[0_0_10px_rgba(229,9,20,0.3)]' 
                          : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {(noteType === 'pdf' || noteType === 'img') && (
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-brand/50 transition-colors bg-black/20">
                    <Upload className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                    <input 
                      type="file" 
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      accept={noteType === 'pdf' ? '.pdf' : 'image/*'}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-brand file:text-white hover:file:bg-brand-hover cursor-pointer"
                    />
                  </div>
                )}

                {(noteType === 'video' || noteType === 'text') && (
                  <textarea
                    className="w-full p-3 bg-black/50 border border-gray-700 rounded-lg focus:ring-1 focus:ring-brand focus:border-brand outline-none text-white placeholder-gray-600"
                    placeholder={noteType === 'video' ? "Enter YouTube Embed URL..." : "Write your note here..."}
                    value={textNoteContent}
                    onChange={(e) => setTextNoteContent(e.target.value)}
                    rows={3}
                  />
                )}

                <button 
                  onClick={handleAddItem} 
                  disabled={loading}
                  className="w-full bg-brand hover:bg-brand-hover text-white font-semibold py-3 px-4 rounded transition-colors flex justify-center items-center gap-2 uppercase tracking-wide disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Upload Data'}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={`Enter ${currentLevel.slice(0, -1)} name...`}
                  className="flex-1 p-3 bg-black/50 border border-gray-700 rounded focus:ring-1 focus:ring-brand focus:border-brand outline-none text-white placeholder-gray-600"
                />
                <button 
                  onClick={handleAddItem}
                  disabled={loading || !newItemName}
                  className="bg-brand hover:bg-brand-hover text-white px-6 rounded font-medium flex items-center gap-2 disabled:opacity-50 shadow-[0_0_10px_rgba(229,9,20,0.2)]"
                >
                  <Plus className="w-5 h-5" /> Add
                </button>
              </div>
            )}
          </div>

          {/* List Items */}
          <div className="bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
            {items.length === 0 ? (
              <div className="p-8 text-center text-gray-600 font-mono">system.query: No data found.</div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.id} className="p-4 hover:bg-white/5 flex justify-between items-center group transition-colors">
                    <div 
                      className={`flex items-center gap-3 flex-1 ${currentLevel !== 'notes' ? 'cursor-pointer' : ''}`}
                      onClick={() => handleDrillDown(item, getTitle(item))}
                    >
                      {currentLevel === 'notes' ? (
                        <FileText className="w-5 h-5 text-gray-500 group-hover:text-brand transition-colors" />
                      ) : (
                        <Folder className="w-5 h-5 text-brand group-hover:text-white transition-colors" />
                      )}
                      
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-200 group-hover:text-white font-mono tracking-tight">{getTitle(item)}</span>
                        {currentLevel === 'notes' && (
                           <span className="text-[10px] text-brand uppercase border border-brand/30 px-2 py-0.5 rounded w-fit mt-1">{item.note_type}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {currentLevel !== 'notes' && (
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white" />
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
=======
export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // State for hierarchy navigation
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const [notes, setNotes] = useState<Note[]>([]);

  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'BRANCH'|'SECTION'|'SUBJECT'|'UNIT'|'TOPIC'|'NOTE'|null>(null);

  // Note Upload State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteType, setNoteType] = useState<NoteType>(NoteType.TEXT);
  const [noteContent, setNoteContent] = useState('');
  const [noteUrl, setNoteUrl] = useState('');
  const [isVideoUpload, setIsVideoUpload] = useState(false); // Toggle for Video Link vs Upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Authentication ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      fetchBranches();
    } else {
      setError('Invalid Access Key');
    }
  };

  // --- Fetchers ---
  const fetchBranches = async () => {
    const data = await dataService.getBranches();
    setBranches(data);
  };

  useEffect(() => {
    if (selectedBranch) {
      dataService.getSections(selectedBranch.id).then(setSections);
      setSelectedSection(null);
    } else {
      setSections([]);
    }
  }, [selectedBranch]);

  useEffect(() => {
    if (selectedSection) {
      dataService.getSubjects(selectedSection.id).then(setSubjects);
      setSelectedSubject(null);
    } else {
      setSubjects([]);
    }
  }, [selectedSection]);

  useEffect(() => {
    if (selectedSubject) {
      dataService.getUnits(selectedSubject.id).then(setUnits);
      setSelectedUnit(null);
    } else {
      setUnits([]);
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedUnit) {
      dataService.getTopics(selectedUnit.id).then(setTopics);
      setSelectedTopic(null);
    } else {
      setTopics([]);
    }
  }, [selectedUnit]);

  useEffect(() => {
    if (selectedTopic) {
      dataService.getNotes(selectedTopic.id).then(setNotes);
    } else {
      setNotes([]);
    }
  }, [selectedTopic]);

  // --- Handlers ---

  const openModal = (type: typeof modalType) => {
    setModalType(type);
    setNewItemName('');
    setNewItemDesc('');
    setNoteTitle('');
    setNoteContent('');
    setNoteUrl('');
    setNoteType(NoteType.TEXT); // Default
    setIsVideoUpload(false);
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // If no title set, use filename
      if (!noteTitle) setNoteTitle(file.name);
      
      // Convert to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setNoteUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    if (!modalType) return;
    setIsSaving(true);

    try {
      if (modalType === 'BRANCH' && newItemName) {
        await dataService.addBranch(newItemName);
        fetchBranches();
      } else if (modalType === 'SECTION' && selectedBranch && newItemName) {
        const s = await dataService.addSection(selectedBranch.id, newItemName);
        setSections([...sections, s]);
      } else if (modalType === 'SUBJECT' && selectedSection && newItemName) {
        const s = await dataService.addSubject(selectedSection.id, newItemName);
        setSubjects([...subjects, s]);
      } else if (modalType === 'UNIT' && selectedSubject && newItemName) {
        const u = await dataService.addUnit(selectedSubject.id, newItemName);
        setUnits([...units, u]);
      } else if (modalType === 'TOPIC' && selectedUnit && newItemName) {
        const t = await dataService.addTopic(selectedUnit.id, newItemName, newItemDesc);
        setTopics([...topics, t]);
      } else if (modalType === 'NOTE' && selectedTopic && noteTitle) {
        const n = await dataService.addNote(selectedTopic.id, noteType, noteTitle, noteContent, noteUrl);
        setNotes([...notes, n]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create item. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!window.confirm("Are you sure? This will delete all children items.")) return;
    
    if (type === 'BRANCH') {
      await dataService.deleteBranch(id);
      fetchBranches();
      setSelectedBranch(null);
    } else if (type === 'SECTION') {
      await dataService.deleteSection(id);
      setSections(sections.filter(s => s.id !== id));
      setSelectedSection(null);
    } else if (type === 'SUBJECT') {
      await dataService.deleteSubject(id);
      setSubjects(subjects.filter(s => s.id !== id));
      setSelectedSubject(null);
    } else if (type === 'UNIT') {
      await dataService.deleteUnit(id);
      setUnits(units.filter(u => u.id !== id));
      setSelectedUnit(null);
    } else if (type === 'TOPIC') {
      await dataService.deleteTopic(id);
      setTopics(topics.filter(t => t.id !== id));
      setSelectedTopic(null);
    } else if (type === 'NOTE') {
      await dataService.deleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
    }
  };

  // --- Render Helpers ---

  const Breadcrumbs = () => (
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 overflow-x-auto whitespace-nowrap pb-2">
      <span className={selectedBranch ? "text-primary font-bold" : ""}>{selectedBranch?.name || "Select Branch"}</span>
      {selectedBranch && <ChevronRight className="w-4 h-4" />}
      <span className={selectedSection ? "text-primary font-bold" : ""}>{selectedSection?.name || (selectedBranch ? "Select Section" : "")}</span>
      {selectedSection && <ChevronRight className="w-4 h-4" />}
      <span className={selectedSubject ? "text-primary font-bold" : ""}>{selectedSubject?.name || (selectedSection ? "Select Subject" : "")}</span>
    </div>
  );

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("update", (data) => {
      console.log("Received update:", data);
      // Handle the update, e.g., refresh data
    });

    return () => {
      socket.off("connect");
      socket.off("update");
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-96">
          <div className="flex justify-center mb-6">
             <div className="bg-red-100 p-3 rounded-full">
               <LayoutDashboard className="w-8 h-8 text-red-500" />
             </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Admin Access</h2>
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Admin Password"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-black transition">
              Unlock Dashboard
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* --- Sidebar (Branch/Section/Subject) --- */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-900 text-white">
          <h1 className="font-bold text-lg flex items-center gap-2">
            <FolderTree className="w-5 h-5" /> Structure
          </h1>
          <button onClick={onLogout} className="text-gray-400 hover:text-white"><LogOut className="w-5 h-5" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Branches */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Branches</h3>
              <button onClick={() => openModal('BRANCH')} className="text-primary hover:bg-green-50 p-1 rounded"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="space-y-1">
              {branches.map(b => (
                <div key={b.id} className={`group flex items-center justify-between p-2 rounded-md cursor-pointer ${selectedBranch?.id === b.id ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-700'}`} onClick={() => setSelectedBranch(b)}>
                  <span className="truncate">{b.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete('BRANCH', b.id); }} className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-white rounded p-1"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Sections */}
          {selectedBranch && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sections ({selectedBranch.name})</h3>
                <button onClick={() => openModal('SECTION')} className="text-primary hover:bg-green-50 p-1 rounded"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="space-y-1">
                {sections.map(s => (
                  <div key={s.id} className={`group flex items-center justify-between p-2 rounded-md cursor-pointer ${selectedSection?.id === s.id ? 'bg-secondary text-white' : 'hover:bg-gray-100 text-gray-700'}`} onClick={() => setSelectedSection(s)}>
                    <span className="truncate">{s.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete('SECTION', s.id); }} className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-white rounded p-1"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
                {sections.length === 0 && <p className="text-sm text-gray-400 italic">No sections yet</p>}
              </div>
            </div>
          )}

          {/* Subjects */}
          {selectedSection && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subjects ({selectedSection.name})</h3>
                <button onClick={() => openModal('SUBJECT')} className="text-primary hover:bg-green-50 p-1 rounded"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="space-y-1">
                {subjects.map(s => (
                  <div key={s.id} className={`group flex items-center justify-between p-2 rounded-md cursor-pointer ${selectedSubject?.id === s.id ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`} onClick={() => setSelectedSubject(s)}>
                    <span className="truncate">{s.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete('SUBJECT', s.id); }} className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-white rounded p-1"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
                {subjects.length === 0 && <p className="text-sm text-gray-400 italic">No subjects yet</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Main Content (Units/Topics/Notes) --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
           <Breadcrumbs />
           <h2 className="text-2xl font-bold text-gray-800">
             {selectedSubject ? selectedSubject.name : "Select a Subject to Manage Content"}
           </h2>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {!selectedSubject ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a Branch, Section, and Subject from the sidebar.
            </div>
          ) : (
            <div className="space-y-8">
              {/* Units Header */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-700">Units</h3>
                <button onClick={() => openModal('UNIT')} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-800 shadow-sm"><Plus className="w-4 h-4" /> Add Unit</button>
              </div>

              {/* Units List */}
              <div className="space-y-4">
                {units.map(unit => (
                  <div key={unit.id} className={`border rounded-xl bg-white shadow-sm transition-all ${selectedUnit?.id === unit.id ? 'ring-2 ring-primary' : ''}`}>
                    <div className="p-4 flex justify-between items-center cursor-pointer bg-gray-50 rounded-t-xl" onClick={() => setSelectedUnit(selectedUnit?.id === unit.id ? null : unit)}>
                      <div className="font-semibold text-lg text-gray-800">{unit.title}</div>
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => {e.stopPropagation(); handleDelete('UNIT', unit.id)}} className="text-red-400 hover:text-red-600 p-2"><Trash2 className="w-4 h-4" /></button>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${selectedUnit?.id === unit.id ? 'rotate-90' : ''}`} />
                      </div>
                    </div>

                    {/* Topics Area */}
                    {selectedUnit?.id === unit.id && (
                      <div className="p-4 border-t bg-white rounded-b-xl">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-sm font-bold text-gray-500 uppercase">Topics in {unit.title}</h4>
                          <button onClick={() => openModal('TOPIC')} className="text-sm text-secondary flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> Add Topic</button>
                        </div>

                        {topics.length === 0 && <p className="text-gray-400 text-sm italic text-center py-4">No topics added yet.</p>}

                        <div className="space-y-3">
                          {topics.map(topic => (
                            <div key={topic.id} className="pl-4 border-l-2 border-gray-200">
                              <div className="flex justify-between items-start group">
                                <div onClick={() => setSelectedTopic(selectedTopic?.id === topic.id ? null : topic)} className="cursor-pointer w-full">
                                  <h5 className={`font-medium ${selectedTopic?.id === topic.id ? 'text-primary' : 'text-gray-800'}`}>{topic.title}</h5>
                                  <p className="text-sm text-gray-500">{topic.description}</p>
                                </div>
                                <button onClick={() => handleDelete('TOPIC', topic.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                              </div>

                              {/* Notes Area */}
                              {selectedTopic?.id === topic.id && (
                                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-gray-400">RESOURCES / NOTES</span>
                                    <button 
                                      onClick={() => openModal('NOTE')} 
                                      className="bg-secondary text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-sky-600 shadow-sm flex items-center gap-1"
                                    >
                                      <Plus className="w-3 h-3" /> Add Resource
                                    </button>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {notes.map(note => (
                                      <div key={note.id} className="bg-white p-3 rounded border flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                          {note.type === 'pdf' && <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />}
                                          {note.type === 'img' && <Image className="w-8 h-8 text-blue-500 flex-shrink-0" />}
                                          {note.type === 'video' && <Video className="w-8 h-8 text-purple-500 flex-shrink-0" />}
                                          {note.type === 'text' && <Type className="w-8 h-8 text-gray-500 flex-shrink-0" />}
                                          <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate">{note.title}</p>
                                            <p className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleDateString()}</p>
                                          </div>
                                        </div>
                                        <button onClick={() => handleDelete('NOTE', note.id)} className="text-gray-300 hover:text-red-500 ml-2"><Trash2 className="w-4 h-4" /></button>
                                      </div>
                                    ))}
                                    {notes.length === 0 && <p className="text-xs text-gray-400 col-span-full text-center">No notes available.</p>}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md m-4 shadow-2xl transform transition-all">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-gray-800">
                {modalType === 'NOTE' ? 'Add New Resource' : `Add New ${modalType?.toLowerCase()}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-500 hover:text-red-500" /></button>
            </div>
            
            <div className="space-y-4">
              {modalType === 'NOTE' ? (
                <>
                  {/* Step 1: Select Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">1. Select Resource Type</label>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => setNoteType(NoteType.TEXT)}
                        className={`p-2 rounded-lg border flex flex-col items-center justify-center text-xs gap-1 transition-colors ${noteType === NoteType.TEXT ? 'bg-gray-800 text-white border-gray-800 ring-2 ring-gray-300' : 'bg-white hover:bg-gray-50 text-gray-600'}`}
                      >
                        <Type className="w-5 h-5" /> Text
                      </button>
                      <button
                        onClick={() => setNoteType(NoteType.PDF)}
                        className={`p-2 rounded-lg border flex flex-col items-center justify-center text-xs gap-1 transition-colors ${noteType === NoteType.PDF ? 'bg-red-600 text-white border-red-600 ring-2 ring-red-200' : 'bg-white hover:bg-red-50 text-red-600'}`}
                      >
                        <FileText className="w-5 h-5" /> PDF
                      </button>
                      <button
                        onClick={() => setNoteType(NoteType.IMAGE)}
                        className={`p-2 rounded-lg border flex flex-col items-center justify-center text-xs gap-1 transition-colors ${noteType === NoteType.IMAGE ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200' : 'bg-white hover:bg-blue-50 text-blue-600'}`}
                      >
                        <Image className="w-5 h-5" /> Image
                      </button>
                      <button
                        onClick={() => setNoteType(NoteType.VIDEO)}
                        className={`p-2 rounded-lg border flex flex-col items-center justify-center text-xs gap-1 transition-colors ${noteType === NoteType.VIDEO ? 'bg-purple-600 text-white border-purple-600 ring-2 ring-purple-200' : 'bg-white hover:bg-purple-50 text-purple-600'}`}
                      >
                        <Video className="w-5 h-5" /> Video
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Details */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase">2. Resource Details</label>
                    <input 
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                      placeholder="Title / Filename" 
                      value={noteTitle} 
                      onChange={e => setNoteTitle(e.target.value)} 
                    />
                    
                    {noteType === NoteType.TEXT && (
                      <textarea 
                        className="w-full border border-gray-300 p-2.5 rounded-lg h-32 focus:ring-2 focus:ring-primary outline-none resize-none" 
                        placeholder="Write your note content here..." 
                        value={noteContent} 
                        onChange={e => setNoteContent(e.target.value)} 
                      />
                    )}

                    {noteType === NoteType.VIDEO && (
                      <div className="space-y-3">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                           <button 
                              className={`flex-1 py-1 text-xs font-bold rounded-md transition-colors ${!isVideoUpload ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                              onClick={() => setIsVideoUpload(false)}
                           >
                             Video Link (YouTube)
                           </button>
                           <button 
                              className={`flex-1 py-1 text-xs font-bold rounded-md transition-colors ${isVideoUpload ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                              onClick={() => setIsVideoUpload(true)}
                           >
                             Upload Video File
                           </button>
                        </div>

                        {!isVideoUpload ? (
                          <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                              className="w-full border border-gray-300 pl-9 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                              placeholder="Paste YouTube or Video URL..." 
                              value={noteUrl} 
                              onChange={e => setNoteUrl(e.target.value)} 
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                             <div 
                              className="border-2 border-dashed border-purple-300 bg-purple-50 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-100 transition-colors"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <UploadCloud className="w-8 h-8 text-purple-500 mb-2" />
                              <p className="text-sm font-medium text-purple-700 text-center">
                                {noteUrl ? "Video Selected!" : "Click to Upload Video (MP4)"}
                              </p>
                              <p className="text-xs text-purple-400 mt-1">(Max 10MB recommended)</p>
                              <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="video/mp4,video/webm"
                                onChange={handleFileSelect}
                              />
                            </div>
                            {noteUrl && <p className="text-xs text-green-600 text-center font-semibold">File ready to upload</p>}
                          </div>
                        )}
                      </div>
                    )}

                    {(noteType === NoteType.PDF || noteType === NoteType.IMAGE) && (
                      <div className="space-y-2">
                        <div 
                          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                            noteType === NoteType.PDF ? 'border-red-300 bg-red-50 hover:bg-red-100' : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                          }`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <UploadCloud className={`w-8 h-8 mb-2 ${noteType === NoteType.PDF ? 'text-red-500' : 'text-blue-500'}`} />
                          <p className={`text-sm font-medium text-center ${noteType === NoteType.PDF ? 'text-red-700' : 'text-blue-700'}`}>
                            {noteUrl ? "File Selected!" : `Click to Upload ${noteType === NoteType.PDF ? 'PDF' : 'Image'}`}
                          </p>
                          <p className="text-xs opacity-60 mt-1">(Max 10MB)</p>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept={noteType === NoteType.PDF ? "application/pdf" : "image/*"}
                            onChange={handleFileSelect}
                          />
                        </div>
                        {noteUrl && <p className="text-xs text-green-600 text-center font-semibold">File ready to upload</p>}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <input className="w-full border p-2 rounded" placeholder="Name / Title" value={newItemName} onChange={e => setNewItemName(e.target.value)} autoFocus />
                  {modalType === 'TOPIC' && <textarea className="w-full border p-2 rounded" placeholder="Description" value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} />}
                </>
              )}
              
              <button 
                onClick={handleCreate} 
                disabled={isSaving}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-teal-800 flex justify-center items-center gap-2 disabled:opacity-50 font-semibold shadow-md mt-4"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
                {isSaving ? 'Saving...' : 'Save Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
>>>>>>> 2269a98efa93291e9c7a0df51eac2f843fc0a902
