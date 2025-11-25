-- Add Test Student with USN "student123"
-- Run this SQL in your Supabase SQL Editor AFTER running setup_database.sql

-- Step 1: Insert a test branch (Computer Science)
INSERT INTO public.branches (branch_name)
VALUES ('Computer Science')
ON CONFLICT DO NOTHING
RETURNING id;

-- Step 2: Get the branch ID (you'll need to note this or check the table)
-- For this example, we'll use a variable approach

-- Insert a test section under the branch
-- First, get your branch_id from the branches table, then run:
-- Replace 'YOUR_BRANCH_ID_HERE' with the actual UUID from branches table

-- Example: If your branch id is 'abc123-def456-...'
-- Run this query by replacing the UUID:

-- INSERT INTO public.sections (branch_id, section_name)
-- VALUES ('YOUR_BRANCH_ID_HERE', 'Section A')
-- RETURNING id;

-- Then insert student with the section_id:
-- INSERT INTO public.students (usn, name, branch, section, branch_id, section_id)
-- VALUES ('student123', 'Test Student', 'Computer Science', 'Section A', 'YOUR_BRANCH_ID_HERE', 'YOUR_SECTION_ID_HERE');


-- EASIER METHOD: Use DO block to insert everything at once
DO $$
DECLARE
  v_branch_id UUID;
  v_section_id UUID;
BEGIN
  -- Insert branch and get ID
  INSERT INTO public.branches (branch_name)
  VALUES ('Computer Science')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_branch_id;

  -- If branch already exists, get its ID
  IF v_branch_id IS NULL THEN
    SELECT id INTO v_branch_id FROM public.branches WHERE branch_name = 'Computer Science' LIMIT 1;
  END IF;

  -- Insert section and get ID
  INSERT INTO public.sections (branch_id, section_name)
  VALUES (v_branch_id, 'Section A')
  RETURNING id INTO v_section_id;

  -- Insert test student
  INSERT INTO public.students (usn, name, branch, section, branch_id, section_id)
  VALUES ('student123', 'Test Student', 'Computer Science', 'Section A', v_branch_id, v_section_id)
  ON CONFLICT (usn) DO UPDATE
  SET name = EXCLUDED.name,
      branch = EXCLUDED.branch,
      section = EXCLUDED.section,
      branch_id = EXCLUDED.branch_id,
      section_id = EXCLUDED.section_id;

  RAISE NOTICE 'Test student created successfully with USN: student123';
END $$;

-- Verify the student was created
SELECT * FROM public.students WHERE usn = 'student123';

