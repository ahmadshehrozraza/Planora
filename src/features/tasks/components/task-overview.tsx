"use client";

import { 
    PencilIcon, 
    Trash2Icon, 
    LockKeyhole, 
    ArrowRightCircle, 
    CalendarPlus,
    RefreshCw,
    Activity, 
    AlignLeft,
    CopyIcon,
    CheckIcon,
    Github,
    GitCommit,
    Loader2,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OverviewProperty } from "./overview-property";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { DateIndicator } from "../../../components/date-indicator";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";
import { useDeleteTask } from "../api/use-delete-task";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { EditTaskModal } from "./edit-task-modal";
import { format } from "date-fns";

import { useState, useEffect } from "react";
import { ActivityTimeline } from "@/features/activity-logs/components/activity-timeline";
import { useGetLogs } from "@/features/activity-logs/api/use-get-logs";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TaskOverviewProps {
    task: any;
}

export const TaskOverview = ({
    task,
}: TaskOverviewProps) => {
    const { open } = useEditTaskModal();
    const router = useRouter();
    const workspaceId = useWorkspaceId();

    const { data: session } = useSession();
    const currentUserEmail = session?.user?.email;

    const { data: permissions } = useGetPermissions(workspaceId, task.projectId);
    const permissionsList: string[] = Array.isArray(permissions) ? permissions : [];
    
    const hasAdminPower = permissionsList.includes(PERMISSIONS.WORKSPACE_DELETE);
    
    const allowed = hasAdminPower || permissionsList.includes(PERMISSIONS.TASK_DELETE);

    const isAssignee = Boolean(
        currentUserEmail && task.assignee?.email && task.assignee.email === currentUserEmail
    );

    const canEdit = hasAdminPower || permissionsList.includes(PERMISSIONS.TASK_UPDATE_FULL) || (isAssignee && permissionsList.includes(PERMISSIONS.TASK_UPDATE_STATUS));

    const [showLogs, setShowLogs] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    
    const [commits, setCommits] = useState<any[]>([]);
    const [isLoadingCommits, setIsLoadingCommits] = useState(false);
    const [commitSource, setCommitSource] = useState<"branch" | "repo">("branch");

    const { data: logsData, isLoading: isLoadingLogs } = useGetLogs({
        workspaceId,
        projectId: task.projectId,
        entityId: task.id,
    });

    const { mutate: deleteTask, isPending: isDeletingTask } = useDeleteTask();

    const assigneeName = task.assignee?.name || "Unassigned";
    const assigneeImage = task.assignee?.image;
    
    const assignedByName = task.assignedBy?.name || "Unknown";
    const assignedByImage = task.assignedBy?.image;

    const projectName = task.project?.name || "Unknown";
    const projectImage = task.project?.imageUrl;
    const projectRepoUrl = task.project?.githubRepoUrl;

    const sprintName = task.sprint?.name || "No Sprint";
    const statusName = task.column?.name || "Unknown Status";

    const blockedByTasks = Array.isArray(task.blockedBy) ? task.blockedBy : [];
    const blockingTasks = Array.isArray(task.blocking) ? task.blocking : [];
    const taskTags = Array.isArray(task.tags) ? task.tags : [];

    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Task",
        "This action cannot be undone",
        "destructive",
    );

    const handleDelete = async () => {
        const ok = await confirmDelete();
        if (!ok) return;

        deleteTask(task.id, {
            onSuccess: () => {
                router.push(`/workspaces/${workspaceId}/tasks`);
            }
        });
    };

    const handleCopyGitCommand = () => {
        if (!task.branchName) return;
        navigator.clipboard.writeText(task.branchName); 
        setIsCopied(true);
        toast.success("Branch name copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
    };

    useEffect(() => {
        if (!projectRepoUrl) return;

        const fetchCommits = async () => {
            setIsLoadingCommits(true);
            try {
                const cleanUrl = projectRepoUrl.replace(/\/$/, "");
                const urlObj = new URL(cleanUrl);
                const parts = urlObj.pathname.split('/').filter(Boolean);
                
                if (parts.length < 2) throw new Error("Invalid URL");
                
                const owner = parts[0];
                const repo = parts[1].replace('.git', '');
                
                let apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits`;
                
                let fetchedData = null;

                if (task.branchName) {
                    const branchRes = await fetch(`${apiUrl}?sha=${task.branchName}`, { cache: 'no-store' });
                    if (branchRes.ok) {
                        fetchedData = await branchRes.json();
                        if (Array.isArray(fetchedData)) {
                            setCommits(fetchedData.slice(0, 5));
                            setCommitSource("branch");
                            setIsLoadingCommits(false);
                            return;
                        }
                    }
                }

                const fallbackRes = await fetch(apiUrl, { cache: 'no-store' });
                if (fallbackRes.ok) {
                    fetchedData = await fallbackRes.json();
                    if (Array.isArray(fetchedData)) {
                        setCommits(fetchedData.slice(0, 5));
                        setCommitSource("repo");
                    }
                } else if (fallbackRes.status === 403) {
                    toast.error("GitHub API Rate limit exceeded. Try again later.");
                } else if (fallbackRes.status === 404) {
                    toast.error("GitHub Repository not found. Check the URL.");
                }

            } catch (error) {
                console.error("Failed to fetch commits", error);
            } finally {
                setIsLoadingCommits(false);
            }
        };

        fetchCommits();
    }, [projectRepoUrl, task.branchName]);

    const cleanRepoUrl = projectRepoUrl?.replace(/\/$/, "");
    const githubLink = (task.branchName && projectRepoUrl) 
        ? `${cleanRepoUrl}/tree/${task.branchName}` 
        : cleanRepoUrl;

    return (
        <div className="flex flex-col w-full gap-y-4 col-span-1">
            <DeleteDialog />
            <EditTaskModal />
            <div className="bg-slate-50 dark:bg-card rounded-lg p-4 border border-border shadow-sm">
                
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-lg font-semibold flex items-center gap-2 text-foreground">
                            {task.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">                        
                            {task.branchName && projectRepoUrl && (
                                <>
                                    <span className="text-muted-foreground/30 text-xs">•</span>
                                    <div 
                                        onClick={handleCopyGitCommand}
                                        className="flex items-center gap-1.5 text-[11px] font-mono bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground px-2 py-0.5 rounded cursor-pointer transition-colors border border-border/50"
                                        title="Copy Git branch name"
                                    >
                                        <span className="max-w-[150px] truncate">{task.branchName}</span>
                                        {isCopied ? (
                                            <CheckIcon className="size-3 text-emerald-500" />
                                        ) : (
                                            <CopyIcon className="size-3" />
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {canEdit && (
                            <Button
                                onClick={() => open(task.id)}
                                size="sm"
                                variant="outline"
                                className="h-8 bg-white dark:bg-transparent"
                                disabled={isDeletingTask}
                            >
                                <PencilIcon className="size-4 mr-2" />
                                Edit
                            </Button>
                        )}

                        {allowed && (
                        <Button
                            size="sm"
                            variant="destructive"
                            className="h-8"
                            onClick={handleDelete}
                            disabled={isDeletingTask}
                        >
                            <Trash2Icon className="size-4 mr-2" />
                            Delete
                        </Button>
                        )}
                    </div>
                </div>
                
                <div className="px-7">
                    <Separator className="my-4" />
                </div>

                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-foreground">
                        {showLogs ? "Activity History" : "Task Details"}
                    </p>
                    <Button
                        onClick={() => setShowLogs(!showLogs)}
                        variant="ghost"
                        size="sm"
                        className="h-8 text-muted-foreground hover:text-foreground"
                    >
                        {showLogs ? (
                            <><AlignLeft className="size-4 mr-2" /> Overview</>
                        ) : (
                            <><Activity className="size-4 mr-2" /> Activity Log</>
                        )}
                    </Button>
                </div>

                {showLogs ? (
                    <div className="min-h-[200px] w-full pt-2">
                        <ActivityTimeline logs={logsData || []} isLoading={isLoadingLogs} />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 pb-4">
                            <div className="flex flex-col gap-y-4 w-full">
                                <OverviewProperty label="Assignee">
                                    <div className="flex items-center gap-2">
                                        <MemberAvatar name={assigneeName} src={assigneeImage} className="size-6" />
                                        <p className="text-sm font-medium text-foreground">{assigneeName}</p>
                                    </div>
                                </OverviewProperty>

                                <OverviewProperty label="Assigned By">
                                    <div className="flex items-center gap-2">
                                        <MemberAvatar name={assignedByName} src={assignedByImage} className="size-6" />
                                        <p className="text-sm font-medium text-foreground">{assignedByName}</p>
                                    </div>
                                </OverviewProperty>

                                <OverviewProperty label="Project">
                                    <div className="flex items-center gap-2">
                                        <ProjectAvatar name={projectName} image={projectImage} className="size-6" fallbackClassName="text-xs" />
                                        <p className="text-sm font-medium text-foreground">{projectName}</p>
                                    </div>
                                </OverviewProperty>

                                <OverviewProperty label="Sprint">
                                    <p className="text-sm font-medium text-foreground">{sprintName}</p>
                                </OverviewProperty>

                                <OverviewProperty label="Tags">
                                    {taskTags.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {taskTags.map((tag: any) => (
                                                <Badge variant="custom-tag" tagColor={tag.color} key={tag.name}>
                                                    {tag.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">-</span>
                                    )}
                                </OverviewProperty>

                                <OverviewProperty label="Blocked By">
                                    {blockedByTasks.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {blockedByTasks.map((t: any) => (
                                                <div key={t.id} className="flex items-center gap-1 bg-destructive/10 text-destructive text-xs px-2 py-1 rounded-md border border-destructive/20">
                                                    <LockKeyhole className="size-3" />
                                                    <span className="truncate max-w-[150px]" title={t.name}>{t.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">-</span>
                                    )}
                                </OverviewProperty>

                                <OverviewProperty label="Blocking To">
                                    {blockingTasks.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {blockingTasks.map((t: any) => (
                                                <div key={t.id} className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-500 text-xs px-2 py-1 rounded-md border border-amber-500/20">
                                                    <ArrowRightCircle className="size-3" />
                                                    <span className="truncate max-w-[150px]" title={t.name}>{t.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">-</span>
                                    )}
                                </OverviewProperty>
                            </div>

                            <div className="flex flex-col gap-y-4 w-full">
                                <OverviewProperty label="Status (Column)">
                                    <Badge variant="outline" className="bg-secondary/50">
                                        {statusName}
                                    </Badge>
                                </OverviewProperty>

                                <OverviewProperty label="Priority">
                                    <Badge variant={task.priority as any}>
                                        {snakeCaseToTitleCase(task.priority)}
                                    </Badge>
                                </OverviewProperty>

                                <OverviewProperty label="Effort Points">
                                    <Badge variant="outline" className="font-mono text-xs bg-white dark:bg-transparent">
                                        {task.effortPoints} pts
                                    </Badge>
                                </OverviewProperty>

                                <OverviewProperty label="Budget">
                                    <p className="text-sm font-medium font-mono text-emerald-600 dark:text-emerald-400">
                                        {task.budget > 0 ? `${task.currency} ${task.budget.toLocaleString()}` : "—"}
                                    </p>
                                </OverviewProperty>

                                <OverviewProperty label="Start Date">
                                    <DateIndicator className="text-sm font-medium text-foreground" value={task.startDate} />
                                </OverviewProperty>

                                <OverviewProperty label="Due Date">
                                    <DateIndicator className="text-sm font-medium text-foreground" value={task.dueDate} />
                                </OverviewProperty>

                                <OverviewProperty label="Create Date">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <CalendarPlus className="size-3.5" />
                                        <span className="text-sm font-medium text-foreground">
                                            {format(new Date(task.createdAt), "PPP")}
                                        </span>
                                    </div>
                                </OverviewProperty>

                                <OverviewProperty label="Last Update">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <RefreshCw className="size-3.5" />
                                        <span className="text-sm font-medium text-foreground">
                                            {format(new Date(task.updatedAt), "PPP")}
                                        </span>
                                    </div>
                                </OverviewProperty>
                            </div>
                        </div>

                        {projectRepoUrl && (
                            <div className="flex flex-col gap-y-3 mt-6 border border-border/50 rounded-xl p-4 bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Github className="size-4 text-foreground" />
                                        <p className="text-sm font-semibold text-foreground">Linked Repository</p>
                                        {commitSource === "repo" && commits.length > 0 && (
                                            <Badge variant="secondary" className="text-[10px] h-5 ml-2 font-normal">
                                                Showing remote commits
                                            </Badge>
                                        )}
                                    </div>
                                    <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                                        <a href={githubLink} target="_blank" rel="noopener noreferrer">
                                            Open GitHub <ExternalLink className="size-3 ml-1.5" />
                                        </a>
                                    </Button>
                                </div>
                                
                                <div className="mt-2 flex flex-col gap-y-2">
                                    {isLoadingCommits ? (
                                        <div className="flex items-center justify-center py-4">
                                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : commits.length > 0 ? (
                                        commits.map((commitData) => (
                                            <a 
                                                key={commitData.sha} 
                                                href={commitData.html_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="group flex flex-col gap-y-1 p-2.5 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <GitCommit className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                                                    <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                                        {commitData.commit.message}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 pl-6">
                                                    {commitData.author?.avatar_url ? (
                                                        <Avatar className="size-4">
                                                            <AvatarImage src={commitData.author.avatar_url} />
                                                        </Avatar>
                                                    ) : (
                                                        <Avatar className="size-4 bg-muted">
                                                            <AvatarFallback className="text-[8px]">{commitData.commit.author.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">
                                                        {commitData.commit.author.name} authored on {format(new Date(commitData.commit.author.date), "MMM d, yyyy")}
                                                    </p>
                                                </div>
                                            </a>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-xs text-muted-foreground">
                                            No commits found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
};