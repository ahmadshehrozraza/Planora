"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@/features/auth/components/user-button";
// import { useCurrentMember } from "@/features/members/hooks/current-user-role";
import { Crown, User } from "lucide-react";

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
  "calendar": {
    title: "Calendar",
    description: "View your scheduals here",
  },
  "analytics": {
    title: "Analytics",
    description: "View analytics here",
  },
};

const defaultMap = {
  title: "Dashboard",
  description: "Monitor all of your projects and tasks here",
};

export const Navbar = () => {
  const pathname = usePathname();
  const pathnameParts = pathname.split("/");
  const pathnameKey = pathnameParts[pathnameParts.length - 1] as keyof typeof pathnameMap;
  // const { role } = useCurrentMember();
  const { title, description } = pathnameMap[pathnameKey] || defaultMap;

  const role = "ADMIN";

  return (
    <nav className="pt-4 px-4 sm:px-6 flex items-center justify-between">

      <div className="flex-1 min-w-0">
        <div className="flex-col hidden md:flex">
          <h1 className="text-xl sm:text-2xl font-semibold truncate">{title}</h1>
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        </div>
      </div>
        <div className="flex gap-x-4 items-center">
          <div className={`inline-flex items-center gap-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${role === "ADMIN"
            ? "bg-purple-50 text-purple-700 border border-purple-200"
            : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}>
            {role === "ADMIN" ? (
              <>
                <Crown className="size-4" />
                <span className="font-semibold">Admin</span>
              </>
            ) : (
              <>
                <User className="size-4" />
                <span className="font-semibold">Member</span>
              </>
            )}
          </div>

          <UserButton title={title} />
        </div>
    </nav>
  );
};