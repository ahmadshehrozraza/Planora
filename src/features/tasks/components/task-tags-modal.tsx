"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetTags, useUpdateTag, useDeleteTag } from "../api/use-task-tags";
import { PencilIcon, Trash2Icon, Check, X, TagIcon } from "lucide-react";
import { PageLoader } from "@/components/page-loader";
import { cn } from "@/lib/utils";

const TAG_COLORS = [
    "#e2e8f0", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"
];

interface TaskTagsModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    projectId: string;
}

export const TaskTagsModal = ({ isOpen, setIsOpen, projectId }: TaskTagsModalProps) => {
    const { data: tags, isLoading } = useGetTags(projectId);
    const { mutate: updateTag, isPending: isUpdating } = useUpdateTag();
    const { mutate: deleteTag, isPending: isDeleting } = useDeleteTag();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editColor, setEditColor] = useState("");

    const startEditing = (tag: any) => {
        setEditingId(tag.id);
        setEditName(tag.name);
        setEditColor(tag.color);
    };

    const handleUpdate = (tagId: string) => {
        if (!editName.trim()) return;
        updateTag({ tagId, projectId, name: editName.trim(), color: editColor }, {
            onSuccess: () => setEditingId(null)
        });
    };

    const handleDelete = (tagId: string) => {
        if (confirm("Are you sure you want to delete this tag? It will be removed from all tasks.")) {
            deleteTag({ tagId, projectId });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TagIcon className="size-5" /> Manage Category Tags
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-3 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                    {isLoading ? (
                        <div className="py-6 flex justify-center"><PageLoader /></div>
                    ) : tags && tags.length > 0 ? (
                        tags.map((tag: any) => (
                            <div key={tag.id} className="flex flex-col gap-2 p-3 border rounded-md bg-muted/20">
                                {editingId === tag.id ? (
                                    <div className="flex flex-col gap-2">
                                        <Input 
                                            value={editName} 
                                            onChange={(e) => setEditName(e.target.value)} 
                                            className="h-8 text-sm"
                                            disabled={isUpdating}
                                        />
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-1.5 flex-wrap">
                                                {TAG_COLORS.map(c => (
                                                    <button
                                                        key={c}
                                                        onClick={() => setEditColor(c)}
                                                        className={cn("size-4 rounded-full border", editColor === c && "ring-2 ring-offset-1 ring-primary")}
                                                        style={{ backgroundColor: c }}
                                                        disabled={isUpdating}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button size="icon" variant="ghost" className="size-6" onClick={() => setEditingId(null)} disabled={isUpdating}>
                                                    <X className="size-3" />
                                                </Button>
                                                <Button size="icon" className="size-6" onClick={() => handleUpdate(tag.id)} disabled={isUpdating || !editName.trim()}>
                                                    <Check className="size-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="size-3 rounded-full border shadow-sm" style={{ backgroundColor: tag.color }} />
                                            <span className="text-sm font-medium">{tag.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button size="icon" variant="ghost" className="size-7 text-muted-foreground hover:text-foreground" onClick={() => startEditing(tag)} disabled={isDeleting || isUpdating}>
                                                <PencilIcon className="size-3.5" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="size-7 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(tag.id)} disabled={isDeleting || isUpdating}>
                                                <Trash2Icon className="size-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 text-sm text-muted-foreground">
                            No tags available in this project.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};