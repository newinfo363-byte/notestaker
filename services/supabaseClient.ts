import { createClient } from '@supabase/supabase-js';

// NOTE: Using Vite environment variables (import.meta.env.VITE_*)
// Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Helper to upload file to Supabase Storage
 * Path format: branch/section/subject/unit/topic/filename
 */
export const uploadFileToStorage = async (
  file: File,
  path: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('notes') // Ensure a bucket named 'notes' exists and is public
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('notes')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (e) {
    console.error('Upload exception:', e);
    return null;
  }
};
