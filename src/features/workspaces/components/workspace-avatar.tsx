import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

interface WorkspaceAvatarProps {
    image?: string | null | undefined;
    name: string;
    className?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
};

const sizeClasses = {
    xs: "size-5",    // 20px
    sm: "size-7",    // 28px
    md: "size-10",   // 40px (default)
    lg: "size-12",   // 48px
    xl: "size-16",   // 64px
};

const fontSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
};

export const WorkspaceAvatar = ({
    image,
    name,
    className,
    size = "md"
}: WorkspaceAvatarProps) => {
    const sizeClass = sizeClasses[size];
    const fontSizeClass = fontSizeClasses[size];
    
    if(image) {
        return (
            <div className={cn(
                "relative rounded-md overflow-hidden",
                sizeClass,
                className
            )}>
                <Image 
                    src={image} 
                    alt={name} 
                    fill 
                    className="object-cover" 
                    sizes={`(max-width: 768px) ${size === 'xs' ? '20px' : size === 'sm' ? '28px' : size === 'md' ? '40px' : size === 'lg' ? '48px' : '64px'}`}
                />
            </div>
        );
    }
    
    return (
        <Avatar className={cn(
            "rounded-md",
            sizeClass, 
            className
        )}>
            <AvatarFallback className={cn(
                "rounded-md text-white font-semibold uppercase",
                "bg-gradient-to-br from-blue-600 to-blue-700",
                fontSizeClass 
            )}>
                {name[0]}
            </AvatarFallback>
        </Avatar>
    );
};