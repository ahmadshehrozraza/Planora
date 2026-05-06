
import { Navbar } from "@/components/navbar";
import { ProjectIdClient } from "./client";

const ProjectIdPage = async () => {

    return (
        <div className="flex flex-col">
            <Navbar title="Sprints" description="Manage & view all your project sprints here" />
            <ProjectIdClient />
        </div>
    )
};

export default ProjectIdPage;