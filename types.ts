export interface Branch {
  id: string;
  name: string;
  createdAt: number;
}

export interface Section {
  id: string;
  branchId: string;
  name: string;
  createdAt: number;
}

export interface Subject {
  id: string;
  sectionId: string;
  name: string;
}

export interface Unit {
  id: string;
  subjectId: string;
  title: string;
}

export interface Topic {
  id: string;
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
