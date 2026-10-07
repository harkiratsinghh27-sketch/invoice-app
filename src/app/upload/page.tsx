'use client';

import { useState, useRef } from 'react';
import { UploadCloud, File, AlertCircle } from 'lucide-react';
import styles from './upload.module.css';

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };
  
  const handleFileSelection = (selectedFile: File) => {
    setError('');
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, JPG, or PNG file.");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract invoice data');
      }
      
      // Redirect to the newly created invoice detail page
      window.location.href = `/invoices/${data.invoice.id}`;
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during extraction');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Upload Invoice</h1>
        <p className={styles.subtitle}>Upload a PDF or image file for AI extraction</p>
      </header>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.uploadCard + " card"}>
        {!file ? (
          <form 
            className={`${styles.dropZone} ${dragActive ? styles.dragActive : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input 
              type="file" 
              id="file-upload" 
              ref={inputRef}
              className={styles.fileInput} 
              accept=".pdf,.jpg,.jpeg,.png" 
              onChange={handleChange}
            />
            
            <UploadCloud size={48} className={styles.uploadIcon} />
            
            <label htmlFor="file-upload" className={styles.uploadLabel}>
              <span className={styles.uploadLink}>Click to upload</span> or drag and drop
            </label>
            <p className={styles.uploadHint}>PDF, JPG, or PNG up to 10MB</p>
          </form>
        ) : (
          <div className={styles.filePreview}>
            <div className={styles.fileInfo}>
              <div className={styles.fileIconWrapper}>
                <File size={24} className={styles.fileIcon} />
              </div>
              <div className={styles.fileDetails}>
                <p className={styles.fileName}>{file.name}</p>
                <p className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <div className={styles.actions}>
              <button 
                className="button-secondary" 
                onClick={() => setFile(null)}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button 
                className="button-primary" 
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? 'Extracting...' : 'Extract Data'}
              </button>
            </div>
          </div>
        )}
        
        <div className={styles.infoBox}>
          <AlertCircle size={20} className={styles.infoIcon} />
          <div>
            <h4>Supported Formats</h4>
            <p>Our AI model works best with clear, legible documents. For multi-page PDFs, we currently process the first 5 pages.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
