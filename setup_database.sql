-- UniNote Manager Database Setup
-- Run this SQL in your Supabase SQL Editor

-- 1. Create branches table
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create sections table
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  section_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create units table
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  unit_title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create topics table
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  topic_title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL CHECK (note_type IN ('pdf', 'video', 'image', 'text')),
  note_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usn TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  branch TEXT NOT NULL,
  section TEXT NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sections_branch_id ON public.sections(branch_id);
CREATE INDEX IF NOT EXISTS idx_subjects_section_id ON public.subjects(section_id);
CREATE INDEX IF NOT EXISTS idx_units_subject_id ON public.units(subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_unit_id ON public.topics(unit_id);
CREATE INDEX IF NOT EXISTS idx_notes_topic_id ON public.notes(topic_id);
CREATE INDEX IF NOT EXISTS idx_students_usn ON public.students(usn);

-- 9. Enable Row Level Security (RLS)
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 10. Create policies for public read access (students can read)
CREATE POLICY "Allow public read access on branches" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Allow public read access on sections" ON public.sections FOR SELECT USING (true);
CREATE POLICY "Allow public read access on subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Allow public read access on units" ON public.units FOR SELECT USING (true);
CREATE POLICY "Allow public read access on topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Allow public read access on notes" ON public.notes FOR SELECT USING (true);
CREATE POLICY "Allow public read access on students" ON public.students FOR SELECT USING (true);

-- 11. Create policies for authenticated admin users (full access)
CREATE POLICY "Allow authenticated insert on branches" ON public.branches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on branches" ON public.branches FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on branches" ON public.branches FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on sections" ON public.sections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on sections" ON public.sections FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on sections" ON public.sections FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on subjects" ON public.subjects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on subjects" ON public.subjects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on subjects" ON public.subjects FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on units" ON public.units FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on units" ON public.units FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on units" ON public.units FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on topics" ON public.topics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on topics" ON public.topics FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on topics" ON public.topics FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on notes" ON public.notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on notes" ON public.notes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on notes" ON public.notes FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on students" ON public.students FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on students" ON public.students FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on students" ON public.students FOR DELETE TO authenticated USING (true);

