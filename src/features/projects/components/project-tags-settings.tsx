"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetTags, useCreateTag, useUpdateTag, useDeleteTag } from "@/features/tasks/api/use-task-tags";
import { PencilIcon, Trash2Icon, Check, X, Plus, Tag as TagIcon } from "lucide-react";
import { PageLoader } from "@/components/page-loader";
import { cn } from "@/lib/utils";

const TAG_COLORS = [
    "#e2e8f0", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"
];

interface ProjectTagsSettingsProps {
    projectId: string;
}

export const ProjectTagsSettings = ({ projectId }: ProjectTagsSettingsProps) => {
    const { data: tags, isLoading } = useGetTags(projectId);
    const { mutate: createTag, isPending: isCreating } = useCreateTag();
    const { mutate: updateTag, isPending: isUpdating } = useUpdateTag();
    const { mutate: deleteTag, isPending: isDeleting } = useDeleteTag();

    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newColor, setNewColor] = useState(TAG_COLORS[0]);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editColor, setEditColor] = useState("");

    const handleCreate = () => {
        if (!newName.trim()) return;
        createTag({ projectId, name: newName.trim(), color: newColor }, {
            onSuccess: () => {
                setIsAdding(false);
                setNewName("");
                setNewColor(TAG_COLORS[0]);
            }
        });
    };

    const startEditing = (tag: any) => {
        setEditingId(tag.id);
        setEditName(tag.name);
        setEditColor(tag.color);
        setIsAdding(false);
    };

    const handleUpdate = (tagId: string) => {
        if (!editName.trim()) return;
        updateTag({ tagId, projectId, name: editName.trim(), color: editColor }, {
            onSuccess: () => setEditingId(null)
        });
    };

    const handleDelete = (tagId: string) => {
        if (confirm("Are you sure? This tag will be removed from all associated tasks.")) {
            deleteTag({ tagId, projectId });
        }
    };

    return (
        <Card className="border-border shadow-sm bg-card w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <TagIcon className="size-5" /> Category Tags
                    </CardTitle>
                    <CardDescription>
                        Manage tags (e.g., Frontend, Backend) to organize tasks within this project.
                    </CardDescription>
                </div>
                {!isAdding && (
                    <Button size="sm" onClick={() => { setIsAdding(true); setEditingId(null); }}>
                        <Plus className="size-4 mr-2" /> Add Tag
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-3">
                    {isAdding && (
                        <div className="flex flex-col gap-3 p-4 border rounded-lg bg-muted/30">
                            <h4 className="text-sm font-semibold">Create New Tag</h4>
                            <div className="flex items-center gap-4">
                                <Input 
                                    placeholder="Tag name (e.g. Database)" 
                                    value={newName} 
                                    onChange={(e) => setNewName(e.target.value)} 
                                    disabled={isCreating}
                                    className="max-w-[250px]"
                                />
                                <div className="flex items-center gap-2">
                                    {TAG_COLORS.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setNewColor(c)}
                                            className={cn("size-6 rounded-full border transition-all", newColor === c && "ring-2 ring-offset-2 ring-primary")}
                                            style={{ backgroundColor: c }}
                                            disabled={isCreating}
                                        >
                                            {newColor === c && <Check className="size-3.5 mx-auto text-black mix-blend-difference" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} disabled={isCreating}>Cancel</Button>
                                <Button size="sm" onClick={handleCreate} disabled={!newName.trim() || isCreating}>
                                    {isCreating ? "Saving..." : "Save Tag"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="py-6 flex justify-center"><PageLoader /></div>
                    ) : tags && tags.length > 0 ? (
                        <div className="border rounded-lg divide-y">
                            {tags.map((tag: any) => (
                                <div key={tag.id} className="flex flex-col p-4 bg-card hover:bg-muted/10 transition-colors">
                                    {editingId === tag.id ? (
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-4">
                                                <Input 
                                                    value={editName} 
                                                    onChange={(e) => setEditName(e.target.value)} 
                                                    disabled={isUpdating}
                                                    className="max-w-[250px]"
                                                />
                                                <div className="flex items-center gap-2">
                                                    {TAG_COLORS.map(c => (
                                                        <button
                                                            key={c}
                                                            type="button"
                                                            onClick={() => setEditColor(c)}
                                                            className={cn("size-6 rounded-full border transition-all", editColor === c && "ring-2 ring-offset-2 ring-primary")}
                                                            style={{ backgroundColor: c }}
                                                            disabled={isUpdating}
                                                        >
                                                            {editColor === c && <Check className="size-3.5 mx-auto text-black mix-blend-difference" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} disabled={isUpdating}>Cancel</Button>
                                                <Button size="sm" onClick={() => handleUpdate(tag.id)} disabled={!editName.trim() || isUpdating}>
                                                    {isUpdating ? "Updating..." : "Update Tag"}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm" style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color }}>
                                                    <div className="size-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                                                    <span className="text-sm font-semibold dark:text-gray-200" style={{ color: '#333' }}>{tag.name}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="outline" onClick={() => startEditing(tag)} disabled={isDeleting || isUpdating}>
                                                    <PencilIcon className="size-4 mr-2" /> Edit
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(tag.id)} disabled={isDeleting || isUpdating}>
                                                    <Trash2Icon className="size-4 mr-2" /> Delete
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 border rounded-lg bg-muted/10 text-muted-foreground">
                            <TagIcon className="size-10 mx-auto mb-3 opacity-20" />
                            <p>No tags created yet.</p>
                            <p className="text-sm mt-1">Create tags to help your team categorize tasks efficiently.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};