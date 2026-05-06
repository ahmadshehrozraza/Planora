"use client";

import { useState, useRef, useCallback } from "react";
import { 
  UploadCloud, 
  FileIcon, 
  Download, 
  Trash2,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  Presentation,
  Loader2,
  ShieldAlert,
  FolderIcon,
  FolderPlus,
  ArrowLeft,
  LockKeyhole,
  PencilIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageLoader } from "@/components/page-loader";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useConfirm } from "@/hooks/use-confirm";
import { 
    useGetProjectFiles, 
    useUploadProjectFile, 
    useDeleteProjectFile,
    useCreateProjectFolder,
    useUpdateProjectFolder,
    useDeleteProjectFolder
} from "../api/use-Project-files";

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
  if (type.includes('pdf') || nameLower.endsWith('.pdf')) return { icon: FileText, color: "text-red-500", bg: "bg-red-500/10" };
  if (type.includes('spreadsheet') || type.includes('excel') || nameLower.endsWith('.xlsx') || nameLower.endsWith('.csv')) return { icon: FileSpreadsheet, color: "text-emerald-500", bg: "bg-emerald-500/10" };
  if (type.includes('presentation') || nameLower.endsWith('.pptx') || nameLower.endsWith('.ppt')) return { icon: Presentation, color: "text-orange-500", bg: "bg-orange-500/10" };
  if (type.includes('image') || nameLower.match(/\.(jpg|jpeg|png|gif|svg)$/i)) return { icon: FileImage, color: "text-blue-500", bg: "bg-blue-500/10" };
  if (type.includes('zip') || type.includes('compressed') || nameLower.endsWith('.zip') || nameLower.endsWith('.rar')) return { icon: FileArchive, color: "text-yellow-600", bg: "bg-yellow-600/10" };
  return { icon: FileIcon, color: "text-primary", bg: "bg-primary/10" };
}

export const ProjectFiles = () => {
  
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();

  const { data: permissions, isLoading: isLoadingPermissions } = useGetPermissions(workspaceId, projectId);
  const { data: projectData, isLoading: isFetching } = useGetProjectFiles(projectId);
  const { mutateAsync: uploadFile } = useUploadProjectFile();
  const { mutate: deleteFile, isPending: isDeletingFile } = useDeleteProjectFile();
  const { mutate: createFolder, isPending: isCreatingFolder } = useCreateProjectFolder();
  const { mutate: updateFolder, isPending: isUpdatingFolder } = useUpdateProjectFolder();
  const { mutate: deleteFolder, isPending: isDeletingFolder } = useDeleteProjectFolder();

  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isRestricted, setIsRestricted] = useState(false);

  const [editingFolder, setEditingFolder] = useState<any>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [editFolderRestricted, setEditFolderRestricted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ConfirmDialog, confirmDelete] = useConfirm(
    "Delete Folder",
    "Are you sure? This folder and ALL files inside it will be permanently deleted.",
    "destructive"
  );

  const permissionsList: string[] = Array.isArray(permissions) ? permissions : [];
  const canModifyFiles = permissionsList.includes(PERMISSIONS.WORKSPACE_DELETE) || permissionsList.includes(PERMISSIONS.PROJECT_UPDATE) || permissionsList.includes(PERMISSIONS.FILE_UPLOAD);
  const isManager = permissionsList.includes(PERMISSIONS.WORKSPACE_DELETE) || permissionsList.includes(PERMISSIONS.PROJECT_UPDATE);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!canModifyFiles) return;
    setIsDragging(true);
  }, [canModifyFiles]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = async (selectedFiles: FileList | null) => {
    if (!canModifyFiles) {
        toast.error("You don't have permission to upload files.");
        return;
    }
    if (!selectedFiles || selectedFiles.length === 0) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    for (let i = 0; i < selectedFiles.length; i++) {
      if (selectedFiles[i].size > MAX_FILE_SIZE) {
        toast.error(`"${selectedFiles[i].name}" is larger than 10MB.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(selectedFiles).map((file) => 
        uploadFile({ file, projectId, folderId: currentFolderId || undefined })
      );

      await Promise.all(uploadPromises);
      toast.success(`${selectedFiles.length} file(s) uploaded successfully!`);
    } catch (error) {
      toast.error("Some files failed to upload");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!canModifyFiles) return;
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [canModifyFiles, currentFolderId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleDeleteFile = (id: string, url: string) => {
    if (!canModifyFiles) return;
    deleteFile({ fileId: id, fileUrl: url, projectId });
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolder({ projectId, name: newFolderName.trim(), isRestricted }, {
        onSuccess: () => {
            setIsAddingFolder(false);
            setNewFolderName("");
            setIsRestricted(false);
        }
    });
  };

  const openEditFolderModal = (e: React.MouseEvent, folder: any) => {
      e.stopPropagation();
      setEditingFolder(folder);
      setEditFolderName(folder.name);
      setEditFolderRestricted(folder.isRestricted);
  };

  const handleUpdateFolder = () => {
      if (!editingFolder || !editFolderName.trim()) return;
      updateFolder({ folderId: editingFolder.id, projectId, name: editFolderName.trim(), isRestricted: editFolderRestricted }, {
          onSuccess: () => {
              setEditingFolder(null);
          }
      });
  };

  const handleDeleteFolder = async (e: React.MouseEvent, folderId: string) => {
      e.stopPropagation();
      if (!isManager) return;
      
      const ok = await confirmDelete();
      if (!ok) return;

      deleteFolder({ folderId, projectId }, {
          onSuccess: () => {
              if (currentFolderId === folderId) {
                  setCurrentFolderId(null);
              }
          }
      });
  };

  if (isFetching || isLoadingPermissions) {
    return <div className="h-48 flex items-center justify-center"><PageLoader /></div>;
  }

  const folders = projectData?.folders || [];
  const allFiles = projectData?.files || [];
  const currentFiles = allFiles.filter((f: any) => (currentFolderId ? f.folderId === currentFolderId : !f.folderId));
  const currentFolderDetails = folders.find((f: any) => f.id === currentFolderId);

  return (
    <div className="flex flex-col w-full h-full mx-auto gap-6">
      <ConfirmDialog />
      <Dialog open={!!editingFolder} onOpenChange={(open) => !open && setEditingFolder(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Input 
                placeholder="Folder name" 
                value={editFolderName} 
                onChange={(e) => setEditFolderName(e.target.value)} 
                disabled={isUpdatingFolder}
            />
            <div className="flex items-center space-x-2">
                <Checkbox id="edit-restricted" checked={editFolderRestricted} onCheckedChange={(c) => setEditFolderRestricted(!!c)} disabled={isUpdatingFolder} />
                <label htmlFor="edit-restricted" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Restricted Access (Managers Only)
                </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingFolder(null)} disabled={isUpdatingFolder}>Cancel</Button>
            <Button onClick={handleUpdateFolder} disabled={!editFolderName.trim() || isUpdatingFolder}>
                {isUpdatingFolder ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold text-foreground flex items-center gap-2">
            {currentFolderId ? (
                <>
                    <Button variant="ghost" size="icon" className="size-8 mr-1" onClick={() => setCurrentFolderId(null)}>
                        <ArrowLeft className="size-4" />
                    </Button>
                    {currentFolderDetails?.name}
                    {currentFolderDetails?.isRestricted && <LockKeyhole className="size-4 text-amber-500" />}
                    
                    {isManager && currentFolderDetails && (
                        <div className="flex items-center gap-1 ml-2">
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground" onClick={(e) => openEditFolderModal(e, currentFolderDetails)}>
                                <PencilIcon className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={(e) => handleDeleteFolder(e, currentFolderDetails.id)} disabled={isDeletingFolder}>
                                {isDeletingFolder ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                            </Button>
                        </div>
                    )}
                </>
            ) : "Project Files"}
          </div>
          <p className="text-sm text-muted-foreground">
            {canModifyFiles ? "Upload and manage files for this project." : "View and download files attached to this project."}
          </p>
        </div>
        {!currentFolderId && isManager && !isAddingFolder && (
            <Button size="sm" onClick={() => setIsAddingFolder(true)}>
                <FolderPlus className="size-4 mr-2" /> New Folder
            </Button>
        )}
      </div>

      {isAddingFolder && (
          <div className="flex flex-col gap-3 p-4 border rounded-lg bg-muted/30">
              <h4 className="text-sm font-semibold">Create New Folder</h4>
              <div className="flex items-center gap-4">
                  <Input 
                      placeholder="Folder name" 
                      value={newFolderName} 
                      onChange={(e) => setNewFolderName(e.target.value)} 
                      disabled={isCreatingFolder}
                      className="max-w-[250px] bg-background"
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox id="restricted" checked={isRestricted} onCheckedChange={(c) => setIsRestricted(!!c)} disabled={isCreatingFolder} />
                    <label htmlFor="restricted" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Restricted Access (Managers Only)
                    </label>
                  </div>
              </div>
              <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setIsAddingFolder(false)} disabled={isCreatingFolder}>Cancel</Button>
                  <Button size="sm" onClick={handleCreateFolder} disabled={!newFolderName.trim() || isCreatingFolder}>
                      {isCreatingFolder ? "Creating..." : "Create Folder"}
                  </Button>
              </div>
          </div>
      )}

      {canModifyFiles && (
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
          <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-primary">
              <PageLoader />
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
      )}

      <div className="flex flex-col gap-3 mt-2">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
                {currentFolderId ? "Files in Folder" : "All Files & Folders"}
            </h2>
            {!canModifyFiles && (
                 <span className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    <ShieldAlert className="size-3 mr-1" /> View Only
                 </span>
            )}
        </div>
        
        {(!currentFolderId && folders.length === 0 && currentFiles.length === 0) ? (
          <div className="flex flex-col items-center justify-center p-10 border rounded-xl bg-sidebar/50 text-muted-foreground text-sm border-dashed">
             <FileIcon className="size-10 mb-3 opacity-20" />
            No documents or folders created yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {!currentFolderId && folders.map((folder: any) => (
                <div 
                    key={folder.id}
                    onClick={() => setCurrentFolderId(folder.id)}
                    className="flex items-center justify-between p-4 bg-sidebar border rounded-xl hover:shadow-sm cursor-pointer hover:border-primary/30 transition-all group"
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2.5 rounded-lg shrink-0 bg-blue-500/10 text-blue-500">
                            <FolderIcon className="size-6" fill="currentColor" fillOpacity={0.2} />
                        </div>
                        <div className="flex flex-col overflow-hidden w-full">
                            <span className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                                {folder.name}
                                {folder.isRestricted && <LockKeyhole className="size-3 text-amber-500" />}
                            </span>
                        </div>
                    </div>
                    {isManager && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => openEditFolderModal(e, folder)} className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground">
                                <PencilIcon className="size-4" />
                            </button>
                            <button onClick={(e) => handleDeleteFolder(e, folder.id)} disabled={isDeletingFolder} className="p-2 hover:bg-red-100 rounded-md text-muted-foreground hover:text-red-600 disabled:opacity-50">
                                {isDeletingFolder ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                            </button>
                        </div>
                    )}
                </div>
            ))}

            {currentFiles.map((file: any) => {
              const { icon: Icon, color, bg } = getFileIcon(file.name, file.type);
              return (
                <div key={file.id} className="flex items-center justify-between p-4 bg-sidebar border rounded-xl hover:shadow-sm transition-shadow group col-span-1 md:col-span-2 lg:col-span-3">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className={cn("p-2 rounded-lg shrink-0", bg, color)}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">
                        {file.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatBytes(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a href={file.url} download={file.name} target="_blank" rel="noreferrer" className="flex items-center justify-center size-8 rounded hover:bg-neutral-200 text-muted-foreground hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                      <Download className="size-4" />
                    </a>
                    
                    {canModifyFiles && (
                        <button onClick={() => handleDeleteFile(file.id, file.url)} disabled={isDeletingFile} className="flex items-center justify-center size-8 rounded hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50">
                        {isDeletingFile ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                        </button>
                    )}
                  </div>
                </div>
              );
            })}

            {currentFolderId && currentFiles.length === 0 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 flex items-center justify-center p-8 border rounded-xl bg-sidebar/50 text-muted-foreground text-sm border-dashed">
                    This folder is empty.
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}