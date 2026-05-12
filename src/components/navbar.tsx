import { UserButton } from "@/features/auth/components/user-button";
import UserRole from "./user-role";
import React from "react";

interface NavbarProps {
  title: string | React.ReactNode;
  description?: string;
  avatar?: React.ReactNode;
}

export const Navbar = ({ title, description, avatar }: NavbarProps) => {

  return (
    <nav className="pt-4 px-4 sm:px-6 flex items-center justify-between bg-background/50 backdrop-blur-sm pb-4 sticky top-0 z-10">
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {avatar && avatar}
            <h1 className="text-xl sm:text-2xl font-semibold truncate text-foreground flex-1">
              {title}
            </h1>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground truncate mt-1">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-x-4 items-center ml-auto">
        <UserRole />
        <UserButton title={typeof title === 'string' ? title : "User"} />
      </div>
    </nav>
  );
};