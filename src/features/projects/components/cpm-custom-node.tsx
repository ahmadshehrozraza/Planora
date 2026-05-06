import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";

const CPMCustomNode = ({ data }: { data: any }) => {
    const isCritical = data.isCritical;

    return (
        <div className={cn(
            "w-[200px] bg-card border-2 rounded-md shadow-sm text-xs font-mono overflow-hidden",
            isCritical ? "border-red-500 shadow-red-500/20" : "border-border"
        )}>
            <Handle type="target" position={Position.Left} isConnectable={false} className="w-2 h-4 bg-muted-foreground rounded-none border-none -ml-1" />
            
            <div className={cn(
                "flex justify-between items-center px-2 py-1 border-b",
                isCritical ? "bg-red-500/10 border-red-500/20" : "bg-muted/50 border-border"
            )}>
                <span className="font-semibold text-muted-foreground" title="Early Start (Days)">ES: {data.es}</span>
                <span className="font-semibold text-muted-foreground" title="Early Finish (Days)">EF: {data.ef}</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 text-center min-h-[50px]">
                <p className="font-sans font-bold text-sm text-foreground line-clamp-2" title={data.name}>
                    {data.name}
                </p>
                {data.slack > 0 && (
                    <span className="text-[10px] text-emerald-500 mt-1">Float: {data.slack}d</span>
                )}
                {isCritical && (
                    <span className="text-[10px] text-red-500 mt-1 font-bold">Critical</span>
                )}
            </div>

            <div className={cn(
                "grid grid-cols-3 text-center border-t divide-x",
                isCritical ? "bg-red-500/10 border-red-500/20 divide-red-500/20" : "bg-muted/50 border-border divide-border"
            )}>
                <span className="px-1 py-1 font-semibold text-muted-foreground" title="Late Start (Days)">LS:{data.ls}</span>
                <span className="px-1 py-1 font-bold text-foreground" title="Duration (Days)">{data.duration}d</span>
                <span className="px-1 py-1 font-semibold text-muted-foreground" title="Late Finish (Days)">LF:{data.lf}</span>
            </div>

            <Handle type="source" position={Position.Right} isConnectable={false} className="w-2 h-4 bg-muted-foreground rounded-none border-none -mr-1" />
        </div>
    );
};

export default memo(CPMCustomNode);