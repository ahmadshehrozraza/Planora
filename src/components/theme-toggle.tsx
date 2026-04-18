"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useUpdatePreferences } from "@/features/preferences/api/use-preferences";
import { useSession } from "next-auth/react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const { data: session } = useSession();
  
  const { mutate: updatePreferences } = useUpdatePreferences();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = React.useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    
    if (session) {
      updatePreferences({ theme: newTheme });
    }
  }, [theme, setTheme, updatePreferences, session]);

  if (!mounted) {
    return <div className="h-8 w-full" />; 
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="group/theme-btn relative w-full justify-start h-8 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
    >
      <div className="relative flex items-center justify-center shrink-0">
        <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground group-hover/theme-btn:text-foreground" />
        <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground group-hover/theme-btn:text-foreground" />
      </div>

      <div className="ml-2 flex flex-1 items-center justify-between overflow-hidden group-data-[collapsible=icon]:hidden">
        <span className="truncate text-sm font-medium text-muted-foreground group-hover/theme-btn:text-foreground transition-colors">
          Theme
        </span>
        
        <span className="text-[10px] text-muted-foreground capitalize">
          {theme === 'system' ? 'Auto' : theme}
        </span>
      </div>
    </Button>
  );
};