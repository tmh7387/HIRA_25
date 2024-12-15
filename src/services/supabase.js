import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Constants for file upload limits
const MAX_FILES = 5;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB in bytes
const BUCKET_NAME = 'hira-files';
const SUBFOLDER = 'operational-images';

// Helper function to list files in storage for a specific project
export const listFiles = async (project_id) => {
  if (!project_id) {
    console.error('Project ID is required to list files');
    return [];
  }

  try {
    console.log('Listing files for project:', project_id);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(SUBFOLDER);

    if (error) {
      console.error('Error listing files:', error);
      return [];
    }

    if (!data) {
      console.log('No files found');
      return [];
    }

    // Filter files by project_id in the filename
    const projectFiles = data.filter(file => file.name.startsWith(`${project_id}_`));
    console.log('Project files:', projectFiles);

    // Get public URLs for project files
    const filesWithUrls = await Promise.all(projectFiles.map(async (file) => {
      const filePath = `${SUBFOLDER}/${file.name}`;
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      // Extract original filename from the stored name
      const originalName = file.name.split('_').slice(2).join('_');

      return {
        name: originalName,
        size: file.metadata?.size || 0,
        path: filePath,
        url: publicUrl,
        type: file.metadata?.mimetype || 'application/octet-stream',
        project_id
      };
    }));

    console.log('Files with URLs:', filesWithUrls);
    return filesWithUrls;
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
};

// Helper function to validate files
export const validateFiles = (newFiles, existingFiles = []) => {
  const totalFiles = existingFiles.length + newFiles.length;
  if (totalFiles > MAX_FILES) {
    throw new Error(`Maximum ${MAX_FILES} files allowed`);
  }

  const existingSize = existingFiles.reduce((total, file) => total + (file.size || 0), 0);
  const newSize = newFiles.reduce((total, file) => total + file.size, 0);
  const totalSize = existingSize + newSize;

  if (totalSize > MAX_TOTAL_SIZE) {
    throw new Error(`Total file size cannot exceed 50MB`);
  }

  return true;
};

// Helper function to upload file
export const uploadFile = async (file, project_id, existingFiles = []) => {
  if (!project_id) {
    throw new Error('Project ID is required to upload files');
  }

  try {
    validateFiles([file], existingFiles);

    const timestamp = Date.now();
    const fileName = `${project_id}_${timestamp}_${file.name}`;
    const filePath = `${SUBFOLDER}/${fileName}`;

    console.log('Uploading file:', {
      originalName: file.name,
      fileName,
      filePath,
      project_id
    });

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
        duplex: 'half',
        metadata: {
          project_id,
          originalName: file.name,
          size: file.size,
          type: file.type,
          timestamp
        }
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath,
      name: file.name,
      size: file.size,
      type: file.type,
      project_id
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

// Helper function to delete file
export const deleteFile = async (path) => {
  try {
    console.log('Deleting file:', path);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) throw error;

    console.log('File deleted successfully');
  } catch (error) {
    console.error('File deletion error:', error);
    throw error;
  }
};

// Helper function to get file size in readable format
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
