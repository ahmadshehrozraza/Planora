
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { AnalyticsCard } from "./analytics-card"
import { Separator } from "@/components/ui/separator";

export const Analytics = ({
    data,
}: any ) => {
    return (
        <ScrollArea className="border rounded-lg w-full whitespace-nowrap shrink-0">
        <div className="w-full flex flex-row">
            <div className="flex items-center flex-1">
                <AnalyticsCard 
                    title="Total tasks"
                    value={data.taskCount}
                    variant={data.taskDifference > 0 ? "up" : "down"}
                    increaseValue={data.taskDifference}
                />
            </div>

        

            <div className="flex items-center flex-1">
                <AnalyticsCard 
                    title="Assigned Tasks"
                    value={data.assignedTaskCount}
                    variant={data.assignedTaskDifference > 0 ? "up" : "down"}
                    increaseValue={data.assignedTaskDifference}
                />
            </div>

            <div className="flex items-center flex-1">
                <AnalyticsCard 
                    title="Completed tasks"
                    value={data.completedTaskCount}
                    variant={data.completeTaskDifference > 0 ? "up" : "down"}
                    increaseValue={data.completeTaskDifference}
                />
            </div>

            <div className="flex items-center flex-1">
                <AnalyticsCard 
                    title="Incomplete tasks"
                    value={data.inCompleteTaskCount}
                    variant={data.inCompleteTaskDifference > 0 ? "up" : "down"}
                    increaseValue={data.inCompleteTaskDifference}
                />
            </div>
        </div>
        <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}