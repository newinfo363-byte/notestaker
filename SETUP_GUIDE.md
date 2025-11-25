# UniNote Manager - Setup and Usage Guide

## 🚀 Quick Setup Instructions

### Step 1: Setup Database Tables
1. Go to your Supabase dashboard: https://utlgyoesxtgkylvvdddq.supabase.co
2. Click on **SQL Editor** (the `</>` icon in left sidebar)
3. Copy ALL the content from `setup_database.sql`
4. Paste it into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. Wait for completion message

### Step 2: Create Storage Bucket for Files
1. In Supabase dashboard, click on **Storage**
2. Click **New bucket**
3. Name: `notes`
4. Make it **Public** (toggle the switch)
5. Click **Create bucket**

### Step 3: Create Admin User
1. In Supabase dashboard, click on **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: `admin@college.edu` (or your preferred email)
   - Password: `YourSecurePassword123!`
   - ✅ Check **Auto Confirm User**
4. Click **Create user**

### Step 4: Add Test Student
1. Go back to **SQL Editor**
2. Copy ALL the content from `add_test_student.sql`
3. Paste and click **Run**
4. This creates:
   - Branch: "Computer Science"
   - Section: "Section A"
   - Student: USN = "student123"

---

## 📝 How to Use the Application

### Admin Login
1. Open your app (localhost:5173)
2. Click **Admin** tab
3. Enter:
   - Email: `admin@college.edu`
   - Password: `YourSecurePassword123!`
4. Click **Login as Admin**

### Adding Content (Admin Panel)
After logging in as admin, you'll see the hierarchy navigation:

#### 1. Add Branch (e.g., Computer Science, Mechanical Engineering)
- You'll see "Branches" screen first
- Enter branch name in the input field
- Click the **+** button

#### 2. Add Section (e.g., Section A, Section B)
- Click on a branch to drill down
- Enter section name
- Click the **+** button

#### 3. Add Subject (e.g., Data Structures, Physics)
- Click on a section to drill down
- Enter subject name
- Click the **+** button

#### 4. Add Unit (e.g., Unit 1, Arrays and Linked Lists)
- Click on a subject to drill down
- Enter unit title
- Click the **+** button

#### 5. Add Topic (e.g., Introduction to Arrays)
- Click on a unit to drill down
- Enter topic title
- Click the **+** button

#### 6. Add Notes (PDF, Video, Image, or Text)
- Click on a topic to see the notes area
- Select note type:
  - **PDF/Image**: Upload file
  - **Video**: Paste YouTube URL
  - **Text**: Paste text/URL link
- Click **Add Note**

### Student Login
1. Click **Student** tab
2. Enter USN: `student123`
3. Click **Access Notes**
4. You'll see all available subjects, units, topics, and notes for your section

---

## ⚙️ Adding More Students

### Method 1: Using Admin Panel (Future Feature)
Currently, you need to add students via SQL.

### Method 2: Using SQL Editor
```sql
-- Get your branch and section IDs first
SELECT id, branch_name FROM branches;
SELECT id, section_name, branch_id FROM sections;

-- Then insert student
INSERT INTO students (usn, name, branch, section, branch_id, section_id)
VALUES (
  '02JST24UCS043',           -- Student USN
  'John Doe',                 -- Student Name
  'Computer Science',         -- Branch name
  'Section A',                -- Section name
  'your-branch-uuid-here',    -- Branch UUID from above query
  'your-section-uuid-here'    -- Section UUID from above query
);
```

---

## 🗑️ Deleting Content

### In Admin Panel:
- Navigate to any level (Branch/Section/Subject/Unit/Topic/Note)
- Click the **🗑️ Trash** icon next to any item
- Confirm deletion
- **Note**: Deleting a parent item will delete all its children (CASCADE)

---

## 🔐 Security Notes

- **Admin**: Requires email/password authentication via Supabase Auth
- **Students**: Login with USN only (no password)
- **Data Access**: 
  - Students can only READ data for their section
  - Admins (authenticated users) have full CRUD access
  - Unauthenticated users can read all data (for student access)

---

## 📂 File Upload Notes

When uploading PDFs/Images:
- Files are stored in Supabase Storage bucket named `notes`
- Files are publicly accessible (so students can download)
- Path format: `{topic_id}/{timestamp}_{filename}`

---

## 🐛 Troubleshooting

### Error: "Could not find table 'public.branches'"
- Run `setup_database.sql` in Supabase SQL Editor

### Error: "Invalid admin credentials"
- Make sure you created an admin user in Supabase Authentication
- Double-check email and password

### Error: "Student not found"
- Make sure the student exists in the `students` table
- Check USN is correct and uppercase
- Run `add_test_student.sql` to create test student

### Storage upload fails
- Make sure you created the `notes` bucket in Supabase Storage
- Make sure the bucket is set to **Public**

### Environment variables not loading
- Make sure `.env.local` has correct values
- Restart the dev server after changing `.env.local`
- Variable names must start with `VITE_` for Vite projects

---

## 🎯 Current Credentials Summary

**Admin Login:**
- Email: `admin@college.edu`
- Password: `YourSecurePassword123!`

**Test Student Login:**
- USN: `student123`
- No password required

---

## 📞 Need Help?

1. Check the browser console for errors (F12)
2. Check the Supabase dashboard for table/storage issues
3. Make sure all SQL scripts ran successfully
4. Verify environment variables are correct in `.env.local`

