"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
    collapsed: boolean;
}

export const ThemeToggle = ({ collapsed }: ThemeToggleProps) => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Yeh zaroori hai taake hydration mismatch error na aaye
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // Jab tak mount na ho, kuch mat dikhao (safety)
    }

    const isDark = theme === "dark";

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark");
    };

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "relative flex items-center gap-2 p-2 rounded-md transition-colors hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 outline-none group w-full",
                collapsed ? "justify-center" : "justify-start"
            )}
        >
            <div className="relative flex items-center justify-center">
                {/* Icons swap logic */}
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-neutral-600 dark:text-neutral-400" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-neutral-600 dark:text-neutral-400" />
            </div>

            {/* Expanded State Text */}
            {!collapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden transition-all duration-300">
                    <span className="truncate text-sm font-medium text-neutral-700 dark:text-neutral-200">
                        Theme
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                        {theme === 'system' ? 'Auto' : theme}
                    </span>
                </div>
            )}
        </button>
    );
};