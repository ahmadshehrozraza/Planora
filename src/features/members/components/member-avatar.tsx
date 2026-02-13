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
            "relative rounded-full border flex items-center justify-center overflow-hidden", 
            isActive 
                ? "border-neutral-200 bg-neutral-100"  
                : "border-red-200 bg-red-50", 
            className
        )}>
            <div className={cn(
                "w-full h-full flex items-center justify-center overflow-hidden",
                !isActive && "grayscale opacity-50"
            )}>
                {hasValidImage ? (
                    <img 
                        src={src!} 
                        alt={name || "Member"} 
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : hasValidName ? (
                    <div className={cn(
                        "w-full h-full flex items-center justify-center font-medium uppercase", 
                        fallbackClassname
                    )}>
                        {name!.charAt(0)}
                    </div>
                ) : (
                    <UserX className="size-1/2 text-neutral-400" />
                )}
            </div>

            {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    {/* <div className="w-[120%] h-[10%] bg-red-600 rotate-45 absolute" /> */}
                    <div className="absolute inset-0 border-2 border-red-600 rounded-full" />
                </div>
            )}
        </div>
    );
};