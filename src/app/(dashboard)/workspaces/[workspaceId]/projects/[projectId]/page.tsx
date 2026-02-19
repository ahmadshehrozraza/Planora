
import { Navbar } from "@/components/navbar";
import { ProjectIdClient } from "./client";

const ProjectIdPage = async () => {

    return (
        <div className="flex flex-col">
            <Navbar title="Segments" description="Manage & view all your project segments here" />
            <ProjectIdClient />
        </div>
    )
};

export default ProjectIdPage;