export interface Branch {
  id: string;
<<<<<<< HEAD
  branch_name: string;
  created_at: string;
=======
  name: string;
  createdAt: number;
>>>>>>> 2269a98efa93291e9c7a0df51eac2f843fc0a902
}

export interface Section {
  id: string;
<<<<<<< HEAD
  branch_id: string;
  section_name: string;
  created_at: string;
=======
  branchId: string;
  name: string;
  createdAt: number;
>>>>>>> 2269a98efa93291e9c7a0df51eac2f843fc0a902
}

export interface Subject {
  id: string;
<<<<<<< HEAD
  section_id: string;
  subject_name: string;
  created_at: string;
=======
  sectionId: string;
  name: string;
>>>>>>> 2269a98efa93291e9c7a0df51eac2f843fc0a902
}

export interface Unit {
  id: string;
<<<<<<< HEAD
  subject_id: string;
  unit_title: string;
  created_at: string;
=======
  subjectId: string;
  title: string;
>>>>>>> 2269a98efa93291e9c7a0df51eac2f843fc0a902
}

export interface Topic {
  id: string;
<<<<<<< HEAD
  unit_id: string;
  topic_title: string;
  created_at: string;
}

export type NoteType = 'pdf' | 'img' | 'text' | 'video';

export interface Note {
  id: string;
  topic_id: string;
  note_type: NoteType;
  note_url: string; // For text, this might be the content itself
  title?: string; // Optional client-side helper
  created_at: string;
}

export interface Student {
  usn: string;
  branch_id: string;
  section_id: string;
  created_at?: string;
}

// Hierarchy Helper Types
export interface StudentContextType {
  student: Student | null;
  branch: Branch | null;
  section: Section | null;
}
=======
  unitId: string;
  title: string;
  description: string;
}

export enum NoteType {
  PDF = 'pdf',
  IMAGE = 'img',
  TEXT = 'text',
  VIDEO = 'video'
}

export interface Note {
  id: string;
  topicId: string;
  type: NoteType;
  url?: string;
  content?: string; // For text notes
  title: string; // Filename or friendly name
  createdAt: number;
}

export type ViewMode = 'ADMIN' | 'STUDENT';
>>>>>>> 2269a98efa93291e9c7a0df51eac2f843fc0a902
