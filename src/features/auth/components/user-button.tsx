"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useLogout } from "../api/use-logout";
import { useCurrent } from "../api/use-current";
import { Loader, LogOut, User } from "lucide-react";
import { Separator } from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { MemberAvatar } from "@/features/members/components/member-avatar";

export const UserButton = () => {
    const { mutate: logout } = useLogout();
    const { data: user, isLoading } = useCurrent();

     const handleLogout = () => {
        // ✅ WorkspaceId pass karein
        logout({ workspaceId });
    };

    if (isLoading) {
        return (
            <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
                <Loader className="size-4 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const workspaceId = useWorkspaceId();

    if (!workspaceId) {
        return null;
    }

    const { name, email, prefs } = user;

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="outline-none relative">
                <MemberAvatar
                    name={name}
                    src={prefs?.avatar}
                    className="size-10 hover:opacity-75 transition border-2 border-neutral-300"
                    fallbackClassname="text-sm font-medium"
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="w-60" sideOffset={10}>
                <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
                    <MemberAvatar
                        name={name}
                        src={prefs?.avatar}
                        className="size-[52px] border-2 border-neutral-300"
                        fallbackClassname="text-xl font-medium"
                    />
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-sm font-medium text-neutral-900">
                            {name || "User"}
                        </p>
                        <p className="text-xs text-neutral-500">{email}</p>
                    </div>
                </div>

                <Separator className="mb-1" />

                <DropdownMenuItem
                    className="h-10 flex items-center justify-center text-gray-600 font-medium cursor-pointer"
                >
                    <User className="size-4 mr-2" />
                    <Link href={`/workspaces/${workspaceId}/profile`}>
                        Go to Profile
                    </Link>
                </DropdownMenuItem>

                <Separator className="mb-1" />

                <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="h-10 flex items-center justify-center text-amber-500 font-medium cursor-pointer"
                >
                    <LogOut className="size-4 mr-2" />
                    Log out 
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};