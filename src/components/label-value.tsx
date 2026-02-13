import { cn } from "@/lib/utils";

interface LabelValueProps{
    label: string;
    children: React.ReactNode;
    lbClassName?: string;
    labelClassname?: string;
    chClassname?:string;
};

export const LabelValue = ({
    label,
    children,
    lbClassName,
    labelClassname,
    chClassname,
}: LabelValueProps) => {

    return (
        <div className="flex items-start"> 
            <div className={cn("", lbClassName)}> 
                <p className={cn("text-sm text-muted-foreground font-medium", labelClassname)}>
                    {label}
                </p>
            </div>
            <div className={cn("flex-1", chClassname)}> 
                {children}
            </div>
        </div>
    )
}