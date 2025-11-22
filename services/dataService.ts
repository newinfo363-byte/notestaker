import { Branch, Section, Subject, Unit, Topic, Note, NoteType } from '../types';
import { INITIAL_DATA, USE_API } from '../constants';

// Helper to simulate API delay for Mock
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- MOCK IMPLEMENTATION (LocalStorage) ---
const KEYS = {
  BRANCHES: 'nf_branches',
  SECTIONS: 'nf_sections',
  SUBJECTS: 'nf_subjects',
  UNITS: 'nf_units',
  TOPICS: 'nf_topics',
  NOTES: 'nf_notes',
};

const initDB = () => {
  if (!localStorage.getItem(KEYS.BRANCHES)) {
    localStorage.setItem(KEYS.BRANCHES, JSON.stringify(INITIAL_DATA.branches));
    localStorage.setItem(KEYS.SECTIONS, JSON.stringify(INITIAL_DATA.sections));
    localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(INITIAL_DATA.subjects));
    localStorage.setItem(KEYS.UNITS, JSON.stringify(INITIAL_DATA.units));
    localStorage.setItem(KEYS.TOPICS, JSON.stringify(INITIAL_DATA.topics));
    localStorage.setItem(KEYS.NOTES, JSON.stringify(INITIAL_DATA.notes));
  }
};

if (!USE_API) {
  initDB();
}

const getItems = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setItems = <T>(key: string, items: T[]) => {
  localStorage.setItem(key, JSON.stringify(items));
};

const addItem = <T extends { id: string }>(key: string, item: T) => {
  const items = getItems<T>(key);
  items.push(item);
  setItems(key, items);
};

const updateItem = <T extends { id: string }>(key: string, updatedItem: T) => {
  const items = getItems<T>(key);
  const index = items.findIndex(i => i.id === updatedItem.id);
  if (index !== -1) {
    items[index] = updatedItem;
    setItems(key, items);
  }
};

const deleteItem = <T extends { id: string }>(key: string, id: string) => {
  const items = getItems<T>(key);
  const filtered = items.filter(i => i.id !== id);
  setItems(key, filtered);
};

// --- API IMPLEMENTATION (MongoDB) ---
const api = {
  get: async (endpoint: string, params: Record<string, string> = {}) => {
    const url = new URL(`/api/${endpoint}`, window.location.origin);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },
  post: async (endpoint: string, data: any) => {
    const res = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },
  delete: async (endpoint: string, id: string) => {
    const res = await fetch(`/api/${endpoint}?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  }
};

// --- DATA SERVICE EXPORT ---

export const dataService = {
  // Branches
  getBranches: async (): Promise<Branch[]> => {
    if (USE_API) return api.get('branches');
    await delay(200);
    return getItems<Branch>(KEYS.BRANCHES);
  },
  addBranch: async (name: string) => {
    if (USE_API) return api.post('branches', { name });
    const newItem: Branch = { id: crypto.randomUUID(), name, createdAt: Date.now() };
    addItem(KEYS.BRANCHES, newItem);
    return newItem;
  },
  deleteBranch: async (id: string) => {
    if (USE_API) return api.delete('branches', id);
    deleteItem(KEYS.BRANCHES, id);
  },
  
  // Sections
  getSections: async (branchId: string): Promise<Section[]> => {
    if (USE_API) return api.get('sections', { branchId });
    await delay(100);
    return getItems<Section>(KEYS.SECTIONS).filter(s => s.branchId === branchId);
  },
  addSection: async (branchId: string, name: string) => {
    if (USE_API) return api.post('sections', { branchId, name });
    const newItem: Section = { id: crypto.randomUUID(), branchId, name, createdAt: Date.now() };
    addItem(KEYS.SECTIONS, newItem);
    return newItem;
  },
  deleteSection: async (id: string) => {
    if (USE_API) return api.delete('sections', id);
    deleteItem(KEYS.SECTIONS, id);
  },

  // Subjects
  getSubjects: async (sectionId: string): Promise<Subject[]> => {
    if (USE_API) return api.get('subjects', { sectionId });
    await delay(100);
    return getItems<Subject>(KEYS.SUBJECTS).filter(s => s.sectionId === sectionId);
  },
  addSubject: async (sectionId: string, name: string) => {
    if (USE_API) return api.post('subjects', { sectionId, name });
    const newItem: Subject = { id: crypto.randomUUID(), sectionId, name };
    addItem(KEYS.SUBJECTS, newItem);
    return newItem;
  },
  deleteSubject: async (id: string) => {
    if (USE_API) return api.delete('subjects', id);
    deleteItem(KEYS.SUBJECTS, id);
  },

  // Units
  getUnits: async (subjectId: string): Promise<Unit[]> => {
    if (USE_API) return api.get('units', { subjectId });
    await delay(100);
    return getItems<Unit>(KEYS.UNITS).filter(u => u.subjectId === subjectId);
  },
  addUnit: async (subjectId: string, title: string) => {
    if (USE_API) return api.post('units', { subjectId, title });
    const newItem: Unit = { id: crypto.randomUUID(), subjectId, title };
    addItem(KEYS.UNITS, newItem);
    return newItem;
  },
  deleteUnit: async (id: string) => {
    if (USE_API) return api.delete('units', id);
    deleteItem(KEYS.UNITS, id);
  },

  // Topics
  getTopics: async (unitId: string): Promise<Topic[]> => {
    if (USE_API) return api.get('topics', { unitId });
    await delay(100);
    return getItems<Topic>(KEYS.TOPICS).filter(t => t.unitId === unitId);
  },
  addTopic: async (unitId: string, title: string, description: string) => {
    if (USE_API) return api.post('topics', { unitId, title, description });
    const newItem: Topic = { id: crypto.randomUUID(), unitId, title, description };
    addItem(KEYS.TOPICS, newItem);
    return newItem;
  },
  deleteTopic: async (id: string) => {
    if (USE_API) return api.delete('topics', id);
    deleteItem(KEYS.TOPICS, id);
  },

  // Notes
  getNotes: async (topicId: string): Promise<Note[]> => {
    if (USE_API) return api.get('notes', { topicId });
    await delay(100);
    return getItems<Note>(KEYS.NOTES).filter(n => n.topicId === topicId);
  },
  addNote: async (topicId: string, type: NoteType, title: string, content?: string, url?: string) => {
    if (USE_API) return api.post('notes', { topicId, type, title, content, url });
    const newItem: Note = { 
      id: crypto.randomUUID(), 
      topicId, 
      type, 
      title, 
      content, 
      url, 
      createdAt: Date.now() 
    };
    addItem(KEYS.NOTES, newItem);
    return newItem;
  },
  deleteNote: async (id: string) => {
    if (USE_API) return api.delete('notes', id);
    deleteItem(KEYS.NOTES, id);
  },
};