"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@/features/auth/components/user-button";
import { Crown, User } from "lucide-react";

const pathnameMap = {
  "join": {
    title: "Join Workspace",
    description: "Become a member of this workspace",
  },
  "create": {
    title: "Workspace",
    description: "Create your first Workspace",
  },
  "profile": {
    title: "Profile Settings",
    description: "Manage your profile here",
  },
} as const;

const DEFAULT_INFO = {
  title: "Planora",
  description: "Your project management companion",
};

const getPageInfo = (pathname: string) => {
  if (pathname.includes("/workspaces/create")) {
    return pathnameMap.create;
  }
  if (pathname.includes("/workspaces/") && pathname.includes("/join/")) {
    return pathnameMap.join;
  }
  if (pathname === "/profile") {
    return pathnameMap.profile;
  }
  return DEFAULT_INFO;
};

export const StandaloneNavbar = () => {
  const pathname = usePathname();
  const { title, description } = getPageInfo(pathname);

  return (
    <nav className="pt-4 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex-col hidden md:flex">
          <h1 className="text-xl sm:text-2xl font-semibold truncate">{title}</h1>
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        </div>
      </div>


        <div className="flex gap-x-4 items-center">
          <UserButton title={title} />
        </div>

    </nav>
  );
};