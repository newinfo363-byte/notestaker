export const ADMIN_PASSWORD = "harshith@80888";

// Toggle between MongoDB API mode and localStorage mode via Vite env (VITE_USE_API)
// Defaults to false so the app always works even if backend / MongoDB is not configured.
export const USE_API = typeof import.meta !== 'undefined'
  ? import.meta.env.VITE_USE_API === 'true'
  : false;

export const MOCK_DELAY = 500; // Simulate network latency

// Initial Data Seed to make the app look populated
export const INITIAL_DATA = {
  branches: [
    { id: 'b1', name: 'Computer Science (CSE)', createdAt: Date.now() },
    { id: 'b2', name: 'Mechanical (ME)', createdAt: Date.now() }
  ],
  sections: [
    { id: 's1', branchId: 'b1', name: 'Section A', createdAt: Date.now() },
    { id: 's2', branchId: 'b1', name: 'Section B', createdAt: Date.now() }
  ],
  subjects: [
    { id: 'sub1', sectionId: 's1', name: 'Data Structures' },
    { id: 'sub2', sectionId: 's1', name: 'Operating Systems' }
  ],
  units: [
    { id: 'u1', subjectId: 'sub1', title: 'Unit 1: Introduction to Arrays' },
    { id: 'u2', subjectId: 'sub1', title: 'Unit 2: Linked Lists' }
  ],
  topics: [
    { id: 't1', unitId: 'u1', title: 'Array Basics', description: 'Definition and memory allocation' },
    { id: 't2', unitId: 'u1', title: 'Multi-dimensional Arrays', description: 'Matrices and vectors' }
  ],
  notes: [
    { id: 'n1', topicId: 't1', type: 'text', title: 'Lecture Summary', content: 'Arrays are contiguous memory blocks.', createdAt: Date.now() },
    { id: 'n2', topicId: 't1', type: 'video', title: 'Array Visualizer', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', createdAt: Date.now() }
  ]
};