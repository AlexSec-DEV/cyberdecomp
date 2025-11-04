import React, { useRef, useState } from 'react';
import { UploadIcon } from './icons';

interface FileUploaderProps {
  onFilesSelected: (files: FileList) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesSelected(event.target.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div
      className={`w-full max-w-2xl p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
        ${isDragging ? 'border-primary bg-surface/50' : 'border-border-color hover:border-primary/70 hover:bg-surface'}`
      }
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.so,.json,.xml,.yaml,.yml,.js,.ts,.env,.c,.cpp,.h,.*"
      />
      <div className="flex flex-col items-center justify-center space-y-4 text-text-secondary">
        <UploadIcon className="w-12 h-12 text-primary" />
        <p className="text-lg font-semibold text-text-primary">
          <span className="text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="text-sm">Select up to 15 files</p>
        <p className="text-xs text-text-secondary/70">.c, .cpp, .so, .txt, .json, .env, and more</p>
      </div>
    </div>
  );
};
