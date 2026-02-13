

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

interface ProjectAvatarProps {
    image?: string;
    name: string;
    className?: string;
    fallbackClassName?: string;
};

export const ProjectAvatar = ({
    image,
    name,
    className,
    fallbackClassName,
}: ProjectAvatarProps) => {
    if(image) {
        return (
            <div className={cn(
                "size-8 relative rounded-md overflow-hidden"
            )}>
                <Image src={image} alt={name} fill className="object-cover" />
            </div>
        );
    }
    return (
        <Avatar className={cn("size-8 rounded-md", className)}>
            <AvatarFallback className={cn(
                "text-white rounded-md bg-blue-600 font-semibold text-md uppercase",
            fallbackClassName,
            )}>
                {name[0]}
            </AvatarFallback>
        </Avatar>
    )
}