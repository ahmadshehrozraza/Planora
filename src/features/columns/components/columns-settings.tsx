"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetProjectColumns } from "@/features/projects/api/use-get-project-columns";
import { useColumnMutations } from "@/features/columns/api/use-columns";
import { PencilIcon, Trash2Icon, LayoutTemplate, Plus } from "lucide-react";
import { PageLoader } from "@/components/page-loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColumnCategory } from "@prisma/client";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

interface ProjectColumnsSettingsProps {
    projectId: string;
}

export const ProjectColumnsSettings = ({ projectId }: ProjectColumnsSettingsProps) => {
    const workspaceId = useWorkspaceId();
    const { data: columns, isLoading } = useGetProjectColumns(projectId);
    const { createColumn, updateColumn, deleteColumn } = useColumnMutations();

    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newCategory, setNewCategory] = useState<ColumnCategory>(ColumnCategory.TODO);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editCategory, setEditCategory] = useState<ColumnCategory>(ColumnCategory.TODO);

    const handleCreate = () => {
        if (!newName.trim() || !workspaceId) return;
        createColumn.mutate({ projectId, name: newName.trim(), workspaceId, category: newCategory }, {
            onSuccess: () => {
                setIsAdding(false);
                setNewName("");
                setNewCategory(ColumnCategory.TODO);
            }
        });
    };

    const startEditing = (col: any) => {
        setEditingId(col.id);
        setEditName(col.name);
        setEditCategory(col.category || ColumnCategory.TODO);
        setIsAdding(false);
    };

    const handleUpdate = (columnId: string) => {
        if (!editName.trim()) return;
        updateColumn.mutate({ columnId, projectId, name: editName.trim(), category: editCategory }, {
            onSuccess: () => setEditingId(null)
        });
    };

    const handleDelete = (columnId: string) => {
        if (!workspaceId) return;
        if (confirm("Are you sure? This column and ALL TASKS inside it will be permanently deleted.")) {
            deleteColumn.mutate({ columnId, projectId, workspaceId });
        }
    };

    return (
        <Card className="border-border shadow-sm bg-card w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <LayoutTemplate className="size-5" /> Board Columns
                    </CardTitle>
                    <CardDescription>
                        Manage your Kanban board columns and their underlying Agile categories (To Do, In Progress, Done).
                    </CardDescription>
                </div>
                {!isAdding && (
                    <Button size="sm" onClick={() => { setIsAdding(true); setEditingId(null); }}>
                        <Plus className="size-4 mr-2" /> Add Column
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-3">
                    {isAdding && (
                        <div className="flex flex-col gap-3 p-4 border rounded-lg bg-muted/30">
                            <h4 className="text-sm font-semibold">Create New Column</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input 
                                    placeholder="Column name (e.g. Code Review)" 
                                    value={newName} 
                                    onChange={(e) => setNewName(e.target.value)} 
                                    disabled={createColumn.isPending}
                                />
                                <Select value={newCategory} onValueChange={(val: ColumnCategory) => setNewCategory(val)} disabled={createColumn.isPending}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ColumnCategory.TODO}>To Do</SelectItem>
                                        <SelectItem value={ColumnCategory.IN_PROGRESS}>In Progress</SelectItem>
                                        <SelectItem value={ColumnCategory.DONE}>Done</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} disabled={createColumn.isPending}>Cancel</Button>
                                <Button size="sm" onClick={handleCreate} disabled={!newName.trim() || createColumn.isPending}>
                                    {createColumn.isPending ? "Creating..." : "Create Column"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="py-6 flex justify-center"><PageLoader /></div>
                    ) : columns && columns.length > 0 ? (
                        <div className="border rounded-lg divide-y">
                            {columns.map((col: any) => (
                                <div key={col.id} className="flex flex-col p-4 bg-card hover:bg-muted/10 transition-colors">
                                    {editingId === col.id ? (
                                        <div className="flex flex-col gap-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input 
                                                    value={editName} 
                                                    onChange={(e) => setEditName(e.target.value)} 
                                                    disabled={updateColumn.isPending}
                                                />
                                                <Select value={editCategory} onValueChange={(val: ColumnCategory) => setEditCategory(val)} disabled={updateColumn.isPending}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={ColumnCategory.TODO}>To Do</SelectItem>
                                                        <SelectItem value={ColumnCategory.IN_PROGRESS}>In Progress</SelectItem>
                                                        <SelectItem value={ColumnCategory.DONE}>Done</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} disabled={updateColumn.isPending}>Cancel</Button>
                                                <Button size="sm" onClick={() => handleUpdate(col.id)} disabled={!editName.trim() || updateColumn.isPending}>
                                                    {updateColumn.isPending ? "Updating..." : "Update Column"}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold">{col.name}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border font-medium">
                                                    {col.category ? col.category.replace('_', ' ') : "TODO"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="outline" onClick={() => startEditing(col)} disabled={deleteColumn.isPending || updateColumn.isPending}>
                                                    <PencilIcon className="size-4 mr-2" /> Edit
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(col.id)} disabled={deleteColumn.isPending || updateColumn.isPending}>
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
                            <LayoutTemplate className="size-10 mx-auto mb-3 opacity-20" />
                            <p>No columns created yet.</p>
                            <p className="text-sm mt-1">Create columns to build your Kanban workflow.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};