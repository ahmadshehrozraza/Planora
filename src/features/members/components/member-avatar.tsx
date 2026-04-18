"use client";

import Image from "next/image"; 
import { cn } from "@/lib/utils";
import { UserX } from "lucide-react";
import { useState } from "react";

interface MemberAvatarProps {
    name?: string | null;
    src?: string | null;
    className?: string;
    fallbackClassname?: string;
    isActive?: boolean;
}

export const MemberAvatar = ({
    name,
    src,
    className,
    fallbackClassname,
    isActive = true,
}: MemberAvatarProps) => {
    const [imageError, setImageError] = useState(false);

    const hasValidImage = src && !imageError; 
    const hasValidName = name && name.trim() !== "";

    return (
        <div className={cn(
            "relative rounded-full border flex items-center justify-center overflow-hidden shrink-0 aspect-square", 
            isActive 
                ? "border-border bg-secondary text-secondary-foreground"  
                : "border-destructive/30 bg-destructive/10 text-destructive", 
            className
        )}>
            <div className={cn(
                "w-full h-full flex items-center justify-center overflow-hidden",
                !isActive && "grayscale opacity-50 relative z-0" 
            )}>
                {hasValidImage ? (
                    <Image 
                        src={src ?? ""} 
                        alt={name || "Member Avatar"}
                        fill 
                        className="object-cover" 
                        onError={() => setImageError(true)}
                        sizes="(max-width: 640px) 100vw, 64px"
                        // priority={false}
                    />
                ) : hasValidName ? (
                    <div className={cn(
                        "w-full h-full flex items-center justify-center font-medium uppercase", 
                        fallbackClassname
                    )}>
                        {name!.charAt(0)}
                    </div>
                ) : (
                    <UserX className="size-1/2 text-muted-foreground" />
                )}
            </div>

            {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="absolute inset-0 border-2 border-destructive rounded-full" />
                </div>
            )}
        </div>
    );
};