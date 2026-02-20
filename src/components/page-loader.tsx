import PlanoraWheel from "@/components/planora-wheel";
import { Loader } from "lucide-react";

export const PageLoader = () => {
    return (
        <div className="flex items-center justify-center h-full w-full">
            {/* <Loader className="size-6 animate-spin text-muted-foreground" /> */}
            <PlanoraWheel 
                duration="3s" 
                color="bg-primary dark:bg-primary/80"
                size={32}
                handWidth={3}
            />
        </div>
    )
}