import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, AlertCircle, FileText, Loader } from 'lucide-react';
import { uploadFile, deleteFile, validateFiles, formatFileSize, listFiles } from '../services/supabase';

export default function FileUpload({ onChange, project_id }) {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const isInitialLoad = useRef(true);

  // Load files when component mounts or project_id changes
  useEffect(() => {
    const loadFiles = async () => {
      if (!project_id) return;

      try {
        console.log('Loading files for project:', project_id);
        const storageFiles = await listFiles(project_id);
        console.log('Files loaded:', storageFiles);
        
        if (storageFiles.length > 0) {
          setFiles(storageFiles);
          if (!isInitialLoad.current) {
            onChange?.(storageFiles);
          }
        }
      } catch (err) {
        console.error('Error loading files:', err);
        setError('Failed to load files. Please try again.');
      } finally {
        isInitialLoad.current = false;
      }
    };

    loadFiles();
  }, [project_id]);

  const handleUpload = async (selectedFiles) => {
    if (!project_id) {
      setError('Project ID is required for file upload');
      return;
    }

    console.log('Starting upload process:', selectedFiles);
    setError(null);
    setIsUploading(true);

    try {
      validateFiles(selectedFiles, files);
      const uploadedFiles = [];

      for (const file of selectedFiles) {
        const result = await uploadFile(file, project_id, files);
        uploadedFiles.push(result);
      }

      console.log('Upload complete:', uploadedFiles);
      const newFiles = [...files, ...uploadedFiles];
      setFiles(newFiles);
      onChange?.(newFiles);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      handleUpload(selectedFiles);
      event.target.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleUpload(droppedFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleRemove = async (index) => {
    try {
      const file = files[index];
      if (file.path) {
        await deleteFile(file.path);
      }
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      onChange?.(newFiles);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to remove file. Please try again.');
    }
  };

  const handleAreaClick = () => {
    if (!isUploading && files.length < 5) {
      fileInputRef.current?.click();
    }
  };

  const remainingSize = 50 * 1024 * 1024 - files.reduce((total, file) => total + (file.size || 0), 0);

  return (
    <div className="space-y-4">
      <div 
        onClick={handleAreaClick}
        className={`relative border-2 rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          dragActive 
            ? 'border-primary-main bg-primary-lighter' 
            : 'border-neutral-light border-dashed hover:border-primary-main hover:bg-primary-lighter'
        } ${files.length >= 5 || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <Loader className="mx-auto h-12 w-12 text-primary-main animate-spin" />
        ) : (
          <Upload className="mx-auto h-12 w-12 text-primary-main transition-colors duration-200 group-hover:text-primary-hover" />
        )}

        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            multiple
            disabled={files.length >= 5 || isUploading}
            accept="*/*"
          />
          <span className={`${files.length >= 5 || isUploading ? 'cursor-not-allowed' : ''}`}>
            <span className="text-primary-main font-medium hover:text-primary-hover">
              Click to upload
            </span>
            <span className="text-neutral-dark"> or drag and drop</span>
          </span>
        </div>

        <p className="mt-2 text-xs text-neutral-main">
          Any file type accepted • Up to {5 - files.length} more files • {formatFileSize(remainingSize)} remaining
        </p>
      </div>

      {error && (
        <div className="p-3 bg-accent-lighter border border-accent-main rounded-lg">
          <div className="flex items-center text-sm text-accent-main">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={file.path || file.url || index} className="flex items-center justify-between p-3 bg-neutral-lighter rounded-lg">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <FileText className="h-5 w-5 text-primary-main flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-dark truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-neutral-main">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={isUploading}
                className={`ml-4 text-neutral-main hover:text-accent-main transition-colors duration-200 ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
