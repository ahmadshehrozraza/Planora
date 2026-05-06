
import { Navbar } from "@/components/navbar";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";
export const dynamic = 'force-dynamic';

const TasksPage = () => {

    return (
    <div className="flex flex-col">
        <Navbar title="Tasks" description="Manage & view all your tasks here" />
        <TaskViewSwitcher />
    </div>
)
}

export default TasksPage;