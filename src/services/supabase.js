// Supabase configuration for file storage
// Replace with your Supabase config after setting up Supabase project

import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your Supabase configuration
// Get these values from Supabase Dashboard > Project Settings > API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket names
export const STORAGE_BUCKETS = {
  TASK_IMAGES: 'task-images',
  DOCUMENTS: 'documents',
};

// Helper function to upload file to Supabase Storage
export const uploadFile = async (bucket, file, path) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      path: data.path,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Helper function to delete file from Supabase Storage
export const deleteFile = async (bucket, path) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Helper function to get public URL for a file
export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
};

export default supabase;
