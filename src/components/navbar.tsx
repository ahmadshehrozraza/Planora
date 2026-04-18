import { UserButton } from "@/features/auth/components/user-button";
import { Crown, User } from "lucide-react";
import UserRole from "./user-role";

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
        
        <UserRole />
        <UserButton title={title} />
      </div>
    </nav>
  );
};