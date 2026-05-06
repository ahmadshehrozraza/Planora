"use client";

import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteProject } from "../api/use-delete-project";

interface ProjectDeleteProps {
    projectId: string;
    workspaceId: string;
}

export const ProjectDelete = ({ projectId, workspaceId }: ProjectDeleteProps) => {
    const { mutate: deleteProject, isPending: isDeletingProject } = useDeleteProject();

    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Project",
        "This action cannot be undone. All tasks, files, and data associated with this project will be permanently removed.",
        "destructive",
    );

    const handleDelete = async () => {
        const ok = await confirmDelete();
        if (!ok) return;

        deleteProject(
            { projectId, workspaceId }, 
            {
                onSuccess: () => {
                    window.location.href = `/workspaces/${workspaceId}`;
                }
            }
        );
    }

    return (
        <Card className="w-full shadow-sm border border-destructive/20 bg-destructive/5 rounded-lg">
            <DeleteDialog />
            
            <CardHeader className="border-b border-destructive/10 pb-4">
                <CardTitle className="text-xl text-destructive dark:text-red-500">Danger Zone</CardTitle>
                <CardDescription className="text-destructive/80 dark:text-red-400">
                    Irreversible and destructive actions for this project.
                </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 flex flex-col gap-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <h4 className="font-medium text-destructive">Delete Project</h4>
                        <p className="text-sm text-destructive/80">Permanently remove this project and all its data.</p>
                    </div>
                    <Button
                        size="sm"
                        variant="destructive"
                        disabled={isDeletingProject}
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Project
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};