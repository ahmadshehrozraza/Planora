import PlanoraLogo from "@/features/dashboard/components/planora-logo";
import { Loader } from "lucide-react";

export const PageLoader = () => {
    return (
        <div className="flex items-center justify-center h-full">
            {/* <Loader className="size-6 animate-spin text-muted-foreground" /> */}
            <PlanoraLogo duration="3s" />
        </div>
    )
}