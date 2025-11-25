export interface Branch {
  id: string;
  branch_name: string;
  created_at: string;
}

export interface Section {
  id: string;
  branch_id: string;
  section_name: string;
  created_at: string;
}

export interface Subject {
  id: string;
  section_id: string;
  subject_name: string;
  created_at: string;
}

export interface Unit {
  id: string;
  subject_id: string;
  unit_title: string;
  created_at: string;
}

export interface Topic {
  id: string;
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
