import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

interface ProjectAvatarProps {
    image?: string | null;
    name: string;
    className?: string;
    fallbackClassName?: string;
}

export const ProjectAvatar = ({
    image,
    name,
    className,
    fallbackClassName,
}: ProjectAvatarProps) => {
    if(image) {
        return (
            <div className={cn(
                // ✨ FIXED: Added shrink-0, aspect-square aur missing 'className' prop
                "size-8 relative rounded-md overflow-hidden shrink-0 aspect-square",
                className
            )}>
                <Image src={image} alt={name} fill className="object-cover" />
            </div>
        );
    }
    return (
        <Avatar className={cn("size-8 rounded-md shrink-0 aspect-square", className)}>
            <AvatarFallback className={cn(
                // ✨ FIXED: Theme compatible background (bg-primary)
                "text-primary-foreground rounded-md bg-primary font-semibold text-md uppercase",
                fallbackClassName,
            )}>
                {name[0]}
            </AvatarFallback>
        </Avatar>
    )
}