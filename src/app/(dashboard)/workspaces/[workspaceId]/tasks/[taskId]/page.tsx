
import { Navbar } from "@/components/navbar";
import { TaskIdClient } from "./client";


const TaskIdPage = async () => {

    return (
    <div>
        <Navbar title="Task" description="View & edit task here" />
        <TaskIdClient />
    </div>
    )
}
 
export default TaskIdPage;