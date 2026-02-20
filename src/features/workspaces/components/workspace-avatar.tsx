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
    xs: "size-5",   
    sm: "size-7",    
    md: "size-10",   
    lg: "size-12",   
    xl: "size-16",   
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
                "rounded-md text-primary-foreground font-semibold uppercase",
                "bg-gradient-to-br from-primary to-primary/80",
                fontSizeClass 
            )}>
                {name[0]}
            </AvatarFallback>
        </Avatar>
    );
};