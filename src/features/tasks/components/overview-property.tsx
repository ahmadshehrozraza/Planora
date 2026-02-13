interface OverviewPropertyProps{
    label: string;
    children: React.ReactNode;
};

export const OverviewProperty = ({
    label,
    children,
}: OverviewPropertyProps) => {

    return (
        <div className="flex items-start gap-x-4"> 
            <div className="min-w-[120px]"> 
                <p className="text-sm text-muted-foreground font-medium">
                    {label}
                </p>
            </div>
            <div className="flex-1"> 
                {children}
            </div>
        </div>
    )
}