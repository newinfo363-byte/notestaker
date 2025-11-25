-- Quick Student Add Template
-- Copy this and modify the values, then run in Supabase SQL Editor

-- First, check what branches and sections exist:
SELECT
  b.id as branch_id,
  b.branch_name,
  s.id as section_id,
  s.section_name
FROM branches b
LEFT JOIN sections s ON s.branch_id = b.id
ORDER BY b.branch_name, s.section_name;

-- After seeing the IDs above, add students by replacing the values:
-- Copy the DO block below and modify:

DO $$
DECLARE
  v_branch_id UUID;
  v_section_id UUID;
BEGIN
  -- Get branch ID by name
  SELECT id INTO v_branch_id
  FROM branches
  WHERE branch_name = 'Computer Science'  -- CHANGE THIS
  LIMIT 1;

  -- Get section ID by name and branch
  SELECT id INTO v_section_id
  FROM sections
  WHERE section_name = 'Section A'  -- CHANGE THIS
    AND branch_id = v_branch_id
  LIMIT 1;

  -- Insert student
  INSERT INTO students (usn, name, branch, section, branch_id, section_id)
  VALUES (
    'STUDENT123',           -- CHANGE: Student USN (uppercase recommended)
    'Test Student',         -- CHANGE: Student full name
    'Computer Science',     -- CHANGE: Branch name (must match above)
    'Section A',           -- CHANGE: Section name (must match above)
    v_branch_id,
    v_section_id
  )
  ON CONFLICT (usn) DO UPDATE
  SET
    name = EXCLUDED.name,
    branch = EXCLUDED.branch,
    section = EXCLUDED.section,
    branch_id = EXCLUDED.branch_id,
    section_id = EXCLUDED.section_id;

  RAISE NOTICE 'Student added/updated successfully!';
END $$;

-- Verify the student was added
SELECT usn, name, branch, section
FROM students
ORDER BY created_at DESC
LIMIT 5;


-- ====== BULK INSERT EXAMPLE ======
-- To add multiple students at once:

/*
DO $$
DECLARE
  v_branch_id UUID;
  v_section_id UUID;
BEGIN
  -- Get branch and section IDs
  SELECT id INTO v_branch_id FROM branches WHERE branch_name = 'Computer Science' LIMIT 1;
  SELECT id INTO v_section_id FROM sections WHERE section_name = 'Section A' AND branch_id = v_branch_id LIMIT 1;

  -- Insert multiple students
  INSERT INTO students (usn, name, branch, section, branch_id, section_id)
  VALUES
    ('02JST24UCS001', 'Alice Johnson', 'Computer Science', 'Section A', v_branch_id, v_section_id),
    ('02JST24UCS002', 'Bob Smith', 'Computer Science', 'Section A', v_branch_id, v_section_id),
    ('02JST24UCS003', 'Charlie Brown', 'Computer Science', 'Section A', v_branch_id, v_section_id),
    ('02JST24UCS004', 'Diana Prince', 'Computer Science', 'Section A', v_branch_id, v_section_id)
  ON CONFLICT (usn) DO NOTHING;

  RAISE NOTICE 'Bulk insert completed!';
END $$;
*/

