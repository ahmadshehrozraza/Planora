

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

interface WorkspaceAvatarProps {
    image?: string;
    name: string;
    className?: string;
};

export const WorkspaceAvatar = ({
    image,
    name,
    className
}: WorkspaceAvatarProps) => {
    if(image) {
        return (
            <div className={cn(
                "size-10 relative rounded-md overflow-hidden"
            )}>
                <Image src={image} alt={name} fill className="object-cover" />
            </div>
        );
    }
    return (
        <Avatar className={cn("size-10 rounded-md", className)}>
            <AvatarFallback className="text-white rounded-md bg-blue-600 font-semibold text-lg uppercase">
                {name[0]}
            </AvatarFallback>
        </Avatar>
    )
}