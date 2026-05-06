"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { toast } from "sonner";
import { useJoinWorkspace } from "../api/use-join-workspace";
import { useInviteCode } from "../hooks/use-invite-code";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { useRouter, useSearchParams } from "next/navigation";
import { WorkspaceAvatar } from "./workspace-avatar";

interface JoinWorkspaceFormProps {
    initialValues: {
        name: string;
    };
};

export const JoinWorkspaceForm = ({
    initialValues,
}: JoinWorkspaceFormProps) => {

    const workspaceId = useWorkspaceId();
    const inviteCode = useInviteCode();
    const searchParams = useSearchParams();
    const roleToken = searchParams.get("t");

    const { mutate, isPending } = useJoinWorkspace();

    if (!workspaceId) {
        toast.error("Invalid workspace link");
        return null;
    }

   // Component ke andar:
const router = useRouter();

const onSubmit = () => {
    if (!workspaceId || !inviteCode) {
        toast.error("Invalid workspace link or invite code");
        return;
    }

    mutate(
        { workspaceId, inviteCode, roleToken: roleToken || undefined },
        {
            onSuccess: (data) => {
                if (data?.data?.id) {
                    router.push(`/workspaces/${data.data.id}`);
                }
            }
        }
    );
}

    return (
        <div>
            <Card className="w-full h-full border-none shadow-none">
                <CardHeader className="p-7">
                    <CardTitle className="text-xl font-bold">
                        <div className="flex items-center gap-2">
                            <WorkspaceAvatar 
                            name={initialValues.name}
                            />

                            {initialValues.name}
                        </div>
                        
                    </CardTitle>

                    <CardDescription>
                        you&apos;ve been invited to join <strong>{initialValues.name}</strong> workspace.
                    </CardDescription>
                </CardHeader>
                <div className="px-7">
                    <Separator />
                </div>

                <CardContent className="p-7">
                    <div className="flex items-center justify-between flex-col lg:flex-row gap-y-2 gap-x-2">
                        <Button
                            variant="secondary"
                            type="button"
                            size="lg"
                            asChild
                            className="w-full lg:w-fit"
                            disabled={isPending}
                        >
                            <Link href="/">
                                Cancel
                            </Link>
                        </Button>

                        <Button
                            size="lg"
                            type="button"
                            className="w-full lg:w-fit"
                            onClick={onSubmit}
                            disabled={isPending}
                        >
                            Join Workspace
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default JoinWorkspaceForm;