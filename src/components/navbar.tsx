import { UserButton } from "@/features/auth/components/user-button";
import { Crown, User } from "lucide-react";

interface NavbarProps {
  title: string;
  description?: string;
}

export const Navbar = ({ title, description }: NavbarProps) => {

  const role = "ADMIN"; 

  return (
    <nav className="pt-4 px-4 sm:px-6 flex items-center justify-between bg-background/50 backdrop-blur-sm pb-4 sticky top-0 z-10">
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-semibold truncate text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground truncate">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-x-4 items-center ml-auto">
        
        {/* 3. Badges main dark mode ki soft classes add kin */}
        <div className={`hidden md:inline-flex items-center gap-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
          role === "ADMIN"
            ? "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30"
            : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30"
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