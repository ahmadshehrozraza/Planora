"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@/features/auth/components/user-button";
import { MobileSidebar } from "./mobile-sidebar";
import { useCurrentMember } from "@/features/members/hooks/current-user-role";

    const pathnameMap = {
        "tasks": {
            title: "My Tasks",
            description: "View all of your tasks here",
        },

        "projects": {
            title: "My Projects",
            description: "View all of your projects here",
        },

        "members": {
            title: "Members",
            description: "View all of your members here",
        },

        "settings": {
            title: "Workspace Settings",
            description: "Manage your workspace here",
        },

        "profile": {
            title: "Profile Settings",
            description: "Manage your profile here",
        },
    }

    const defaultMap = {
        title: "Home",
        description: "Moniter all of your projects and tasks here",
    }

export const Navbar = () => {
    const pathname = usePathname();
    const pathnameParts = pathname.split("/");
    const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;

    const { member, role, isAdmin } = useCurrentMember();

    const { title, description } = pathnameMap[pathnameKey] || defaultMap;

    return (
        <nav className="pt-4 px-6 flex items-center justify-between">
            <div className="flex-col hidden lg:flex">
                <h1 className="text-2xl font-semibold">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>
            <div className="flex gap-x-5 items-center">
                <p className="">{role}</p>
                <UserButton/>
            </div>
            <MobileSidebar />
        </nav>
    );
};