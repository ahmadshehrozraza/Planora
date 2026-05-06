"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Plus, Edit2, Trash2, Lock, CopyIcon, RefreshCcw, LinkIcon } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageLoader } from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { workspaceRoleSchema } from "../schemas";
import { 
    useGetWorkspaceRoles, 
    useCreateWorkspaceRole, 
    useUpdateWorkspaceRole, 
    useDeleteWorkspaceRole 
} from "../api/use-workspace-roles";

import { useResetWorkspaceRoleInviteCode } from "../api/use-reset-workspace-role"; 

import { WORKSPACE_LEVEL_PERMISSIONS } from "../hooks/roles-permissions";
import { useConfirm } from "@/hooks/use-confirm";

export const WorkspaceRolesManager = () => {
    
    const workspaceId = useWorkspaceId();
    const [isOpen, setIsOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);

    const { data: workspace } = useGetWorkspace({ workspaceId });
    const { data: roles, isLoading } = useGetWorkspaceRoles(workspaceId);
    const { mutate: createRole, isPending: isCreating } = useCreateWorkspaceRole();
    const { mutate: updateRole, isPending: isUpdating } = useUpdateWorkspaceRole();
    const { mutate: deleteRole, isPending: isDeleting } = useDeleteWorkspaceRole();
    const { mutate: resetLink, isPending: isResetting } = useResetWorkspaceRoleInviteCode();

    const [ConfirmDeleteDialog, confirmDelete] = useConfirm(
        "Delete Role",
        "Are you sure you want to delete this custom role?",
        "destructive"
    );

    const [ConfirmResetDialog, confirmReset] = useConfirm(
        "Reset Invite Link",
        "Anyone with the old link will no longer be able to join. Continue?",
        "destructive"
    );

    const form = useForm<z.infer<typeof workspaceRoleSchema>>({
        resolver: zodResolver(workspaceRoleSchema),
        defaultValues: { name: "", workspaceId, permissions: [] },
    });

    const openModal = (role: any = null) => {
        setEditingRole(role);
        if (role) {
            form.reset({ name: role.name, workspaceId, permissions: role.permissions || [] });
        } else {
            form.reset({ name: "", workspaceId, permissions: [] });
        }
        setIsOpen(true);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setEditingRole(null);
            form.reset({ name: "", workspaceId, permissions: [] });
        }
    }

    const onSubmit = (values: z.infer<typeof workspaceRoleSchema>) => {
        if (editingRole) {
            updateRole({ id: editingRole.id, ...values }, { onSuccess: () => setIsOpen(false) });
        } else {
            createRole(values, { onSuccess: () => setIsOpen(false) });
        }
    };

    const handleDelete = async (roleId: string) => {
        const ok = await confirmDelete();
        if (ok) {
            deleteRole({ roleId, workspaceId });
        }
    };

    const handleResetLink = async (roleId: string) => {
        const ok = await confirmReset();
        if (ok) {
            resetLink({ roleId, workspaceId });
        }
    };

    const handleCopy = (roleToken: string) => {
        if (!workspace?.inviteCode) {
            toast.error("Workspace details not loaded yet.");
            return;
        }
        const url = `${window.location.origin}/workspaces/${workspaceId}/join/${workspace.inviteCode}?t=${roleToken}`;
        navigator.clipboard.writeText(url);
        toast.success("Role invite link copied!");
    };

    if (isLoading) return <div className="p-8"><PageLoader /></div>;

    return (
        <Card className="border-border shadow-sm bg-card w-full">
            <ConfirmDeleteDialog />
            <ConfirmResetDialog />
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
                <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Shield className="size-5 text-primary" /> Global Workspace Roles
                    </CardTitle>
                    <CardDescription>Create and manage global roles that apply across the entire workspace.</CardDescription>
                </div>
                <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button onClick={() => openModal(null)} size="sm">
                            <Plus className="size-4 mr-2" /> New Role
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingRole ? "Edit Role" : "Create Custom Role"}</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="e.g. Workspace Admin" disabled={isCreating || isUpdating} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-3">
                                    <FormLabel>Global Permissions</FormLabel>
                                    <div className="grid grid-cols-1 gap-3 border p-4 rounded-lg bg-muted/10 max-h-[300px] overflow-y-auto">
                                        {WORKSPACE_LEVEL_PERMISSIONS.map((perm) => (
                                            <FormField
                                                key={perm.value}
                                                control={form.control}
                                                name="permissions"
                                                render={({ field }) => {
                                                    const isChecked = field.value?.includes(perm.value as any) || false;
                                                    return (
                                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={isChecked}
                                                                    onCheckedChange={(checked) => {
                                                                        const current = field.value || [];
                                                                        return checked
                                                                            ? field.onChange([...current, perm.value])
                                                                            : field.onChange(current.filter((val: string) => val !== perm.value))
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal cursor-pointer">
                                                                {perm.label}
                                                            </FormLabel>
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </div>
                                <Button type="submit" className="w-full" disabled={isCreating || isUpdating}>
                                    {isCreating || isUpdating ? "Saving..." : "Save Role"}
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border">
                    {roles?.map((role: any) => (
                        <div key={role.id} className="p-5 flex flex-col gap-4 hover:bg-muted/10 transition">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-foreground text-base">{role.name}</span>
                                        {role.isSystem && 
                                        <Badge variant="secondary" className="text-[10px] uppercase">
                                            <span className="flex items-center gap-1">
                                                <Lock className="size-3" /> System
                                            </span>
                                        </Badge>}
                                        {role.isWorkspaceDefault && 
                                        <Badge variant="outline" className="text-[10px] uppercase bg-blue-50 text-blue-600 border-blue-200">
                                            Default
                                        </Badge>}
                                    </div>
                                    <span className="text-xs text-muted-foreground">{role.permissions.length} permissions assigned</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        disabled={role.isSystem} 
                                        onClick={() => openModal(role)}
                                    >
                                        <Edit2 className="size-4" />
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        disabled={role.isSystem || role.isWorkspaceDefault || isDeleting} 
                                        onClick={() => handleDelete(role.id)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                            
                            {role.inviteCode && (
                            <div className="flex items-center gap-2 bg-muted/40 p-2.5 rounded-lg border border-border/50 w-full max-w-xl">
                                <LinkIcon className="size-4 text-muted-foreground shrink-0 ml-1" />
                                <Input 
                                    readOnly 
                                    value={workspace?.inviteCode ? `${window.location.origin}/workspaces/${workspaceId}/join/${workspace.inviteCode}?t=${role.inviteCode}` : "Loading link..."} 
                                    className="h-8 text-xs bg-transparent border-none shadow-none focus-visible:ring-0 px-2 font-mono text-muted-foreground" 
                                />
                                <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    className="h-8 px-3 shrink-0 bg-background" 
                                    onClick={() => handleCopy(role.inviteCode)}
                                    disabled={!workspace?.inviteCode}
                                >
                                    <CopyIcon className="size-3.5 mr-1.5" /> Copy
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-8 px-3 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10" 
                                    disabled={isResetting}
                                    onClick={() => handleResetLink(role.id)}
                                >
                                    <RefreshCcw className={`size-3.5 mr-1.5 ${isResetting ? "animate-spin" : ""}`} /> Reset
                                </Button>
                            </div>
                            )}
                        </div>
                    ))}
                    {roles?.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No custom roles found. Create one to get started.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};