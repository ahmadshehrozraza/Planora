"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { Separator } from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useLogout } from "../api/use-logout";
import { useCurrent } from "../api/use-current"; 
import { PageLoader } from "@/components/page-loader";

interface UserButtonProps {
    title?: string; 
}

export const UserButton = ({ title }: UserButtonProps) => {
    const { mutate: logout } = useLogout();

    const { data: user, isLoading } = useCurrent();

    const handleLogout = () => {
        logout();
    };

    if (isLoading) {
        return (
            <PageLoader />
        );
    }

    if (!user) {
        return null;
    }

    const displayName = user.name;

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="outline-none relative">
                <MemberAvatar
                    name={displayName}
                    src={user.image}
                    className="size-10 hover:opacity-75 transition border-2 border-border"
                    fallbackClassname="text-sm font-medium"
                />
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" side="bottom" className="w-60" sideOffset={10}>
                <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
                    <MemberAvatar
                        name={displayName}
                        src={user.image}
                        className="size-[52px] border-2 border-border"
                        fallbackClassname="text-xl font-medium"
                    />
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-sm font-medium text-foreground">
                            {displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </div>

                

                {title !== "Profile Settings" ? (
                    <>
                    <Separator className="mb-1 h-px bg-border" />
                    <DropdownMenuItem
                        className="h-10 flex items-center justify-center text-foreground font-medium cursor-pointer focus:bg-accent focus:text-accent-foreground"
                        asChild
                    >
                        <Link href={`/profile`}>
                            <User className="size-4 mr-2" />
                            Go to Profile
                        </Link>
                    </DropdownMenuItem>
                    </>
                ) : null}

                <Separator className="mb-1 mt-1 h-px bg-border" />

                <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="h-10 flex items-center justify-center text-amber-600 dark:text-amber-500 font-medium cursor-pointer focus:text-amber-600 dark:focus:text-amber-500 focus:bg-amber-500/10"
                >
                    <LogOut className="size-4 mr-2" />
                    Log out 
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};