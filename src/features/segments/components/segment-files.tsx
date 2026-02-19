"use client";

import { useState, useRef, useCallback } from "react";
import { 
  UploadCloud, 
  FileIcon, 
  Download, 
  Trash2, 
  Loader2,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  Presentation
} from "lucide-react";
import { cn } from "@/lib/utils";


interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  createdAt: Date;
}

const INITIAL_MOCK_FILES: UploadedFile[] = [
  {
    id: "mock-1",
    name: "Q1_Financial_Report.xlsx",
    size: 2540000, // 2.5 MB
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    url: "/sample-docs/Q1_Financial_Report.xlsx", // Public folder ka path
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 din pehle
  },
  {
    id: "mock-2",
    name: "Project_Proposal_V3.pdf",
    size: 1048576, // 1 MB
    type: "application/pdf",
    url: "/sample-docs/Project_Proposal_V3.pdf",
    createdAt: new Date(Date.now() - 86400000), // 1 din pehle
  },
  {
    id: "mock-3",
    name: "Client_Presentation.pptx",
    size: 5200000, // 5.2 MB
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    url: "/sample-docs/Client_Presentation.pptx",
    createdAt: new Date(), // Aaj
  }
];

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function getFileIcon(name: string, type: string) {
  const nameLower = name.toLowerCase();
  
  if (type.includes('pdf') || nameLower.endsWith('.pdf')) {
    return { icon: FileText, color: "text-red-500", bg: "bg-red-500/10" };
  }
  if (type.includes('spreadsheet') || type.includes('excel') || nameLower.endsWith('.xlsx') || nameLower.endsWith('.csv')) {
    return { icon: FileSpreadsheet, color: "text-emerald-500", bg: "bg-emerald-500/10" };
  }
  if (type.includes('presentation') || nameLower.endsWith('.pptx') || nameLower.endsWith('.ppt')) {
    return { icon: Presentation, color: "text-orange-500", bg: "bg-orange-500/10" };
  }
  if (type.includes('image') || nameLower.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
    return { icon: FileImage, color: "text-blue-500", bg: "bg-blue-500/10" };
  }
  if (type.includes('zip') || type.includes('compressed') || nameLower.endsWith('.zip') || nameLower.endsWith('.rar')) {
    return { icon: FileArchive, color: "text-yellow-600", bg: "bg-yellow-600/10" };
  }

  return { icon: FileIcon, color: "text-primary", bg: "bg-primary/10" };
}

export default function DocumentsPage() {
  const [files, setFiles] = useState<UploadedFile[]>(INITIAL_MOCK_FILES);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);

    setTimeout(() => {
      const newFiles: UploadedFile[] = Array.from(selectedFiles).map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file), 
        createdAt: new Date(),
      }));

      setFiles((prev) => [...newFiles, ...prev]);
      setIsUploading(false);
    }, 1500);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };

  const handleDelete = (id: string, url: string) => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url); 
    }
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="flex flex-col w-full h-full  mx-auto gap-6">
      
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Files</h1>
        <p className="text-sm text-muted-foreground">
          Upload and manage files for this segment.
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center w-full h-48 py-5 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 bg-sidebar",
          isDragging ? "border-primary bg-primary/5" : "border-sidebar-border hover:bg-sidebar-accent/50",
          isUploading && "pointer-events-none opacity-70"
        )}
      >
        <input
          type="file"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-primary">
            <Loader2 className="size-8 animate-spin" />
            <span className="text-sm font-medium">Uploading files...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="p-4 rounded-full bg-sidebar-accent/50">
              <UploadCloud className="size-8" />
            </div>
            <p className="text-sm font-medium">
              <span className="text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs">PDF, DOCX, XLSX, PPTX, PNG (max 10MB)</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <h2 className="text-lg font-semibold text-foreground">Uploaded Files</h2>
        
        {files.length === 0 ? (
          <div className="flex items-center justify-center p-8 border rounded-xl bg-sidebar/50 text-muted-foreground text-sm border-dashed">
            No documents uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {files.map((file) => {
              const { icon: Icon, color, bg } = getFileIcon(file.name, file.type);
              
              return (
                <div 
                  key={file.id} 
                  className="flex items-center justify-between p-4 bg-sidebar border rounded-xl hover:shadow-sm transition-shadow group"
                >
                  <div className="flex items-center gap-4 overflow-hidden">

                    <div className={cn("p-2 rounded-lg shrink-0", bg, color)}>
                      <Icon className="size-5" />
                    </div>
                    
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">
                        {file.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatBytes(file.size)} • {file.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a 
                      href={file.url} 
                      download={file.name}
                      className="flex items-center justify-center size-8 rounded hover:bg-neutral-200 text-muted-foreground hover:text-primary transition-colors"
                      title="Download"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="size-4" />
                    </a>
                    
                    <button 
                      onClick={() => handleDelete(file.id, file.url)}
                      className="flex items-center justify-center size-8 rounded hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}