import React, { useState, useEffect } from 'react';
import { supabase, uploadFileToStorage } from '../services/supabaseClient';
import { NoteType } from '../types';
import { ChevronRight, Plus, Trash2, Upload, Folder, FileText, ArrowLeft } from './Icons';

type Level = 'branches' | 'sections' | 'subjects' | 'units' | 'topics' | 'notes';

interface AdminPanelProps {
  onLogout: () => void;
}

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