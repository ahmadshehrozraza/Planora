import { cn } from "@/lib/utils";
import { UserX, Ban } from "lucide-react";
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
    
    const hasValidImage = src && src.startsWith('data:image/') && !imageError;
    const hasValidName = name && name.trim() !== "";

    return (
        <div className={cn(
            "size-6 rounded-full overflow-hidden border flex items-center justify-center relative", 
            isActive 
                ? "border-neutral-200 bg-neutral-100"  
                : "border-red-200 bg-red-50 grayscale opacity-70", 
            className
        )}>
            {hasValidImage ? (
                <img 
                    src={src} 
                    alt={name || "User avatar"} 
                    className={cn(
                        "w-full h-full object-cover",
                        !isActive && "opacity-50" 
                    )}
                    onError={() => setImageError(true)}
                />
            ) : hasValidName ? (
                <div className={cn(
                    "w-full h-full flex items-center justify-center font-normal text-xs uppercase", 
                    isActive ? "text-neutral-600" : "text-red-400", 
                    fallbackClassname
                )}>
                    {name.charAt(0)}
                </div>
            ) : (
                <div className={cn(
                    "w-full h-full flex items-center justify-center",
                    isActive ? "text-muted-foreground" : "text-red-400",
                    fallbackClassname
                )}>
                    <UserX className="size-3" />
                </div>
            )}

            {!isActive && (
                <>
                    <div className="absolute -top-0.5 -right-0.5 size-2 bg-red-500 rounded-full border border-white" /> {/* ✅ Smaller indicator */}
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-red-500 rotate-45 transform origin-center" />
                    </div>
                </>
            )}
        </div>
    );
};