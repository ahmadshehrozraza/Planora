"use client";

import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useJoinProject } from "@/features/projects/api/use-join-project";

interface JoinProjectClientProps {
    projectName: string;
    workspaceName: string;
}

export const JoinProjectClient = ({ projectName, workspaceName }: JoinProjectClientProps) => {
    const router = useRouter();
    const params = useParams();

    const workspaceId = params.workspaceId as string;
    const projectId = params.projectId as string;
    const inviteCode = params.inviteCode as string;

    const { mutate: joinProject, isPending } = useJoinProject();

    const handleJoin = () => {
        joinProject(
            { workspaceId, projectId, inviteCode },
            {
                onSuccess: (data) => {
                    if (!data.error) {
                        router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
                    }
                }
            }
        );
    };

    return (
        <div className="w-full lg:max-w-xl flex flex-col items-center justify-center">
            <Card className="w-full h-full border-none shadow-md">
                <CardHeader className="p-7 text-center">
                    <CardTitle className="text-2xl font-bold">
                        Join Project
                    </CardTitle>
                    <CardDescription className="text-md mt-2">
                        You've been invited to join <strong>{projectName}</strong> in workspace <strong>{workspaceName}</strong>.
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="p-7 pt-0">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-center">
                        <Button 
                            variant="secondary" 
                            type="button" 
                            size="lg"
                            className="w-full lg:w-fit"
                            disabled={isPending}
                            onClick={() => router.push("/")}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="button" 
                            size="lg"
                            className="w-full lg:w-fit"
                            disabled={isPending}
                            onClick={handleJoin}
                        >
                            {isPending ? "Joining..." : "Join Project"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};