import { Separator } from "@/components/ui/separator";
import { WorkspaceSwitcher } from "./workspace-switcher";
import Image from "next/image"
import Link from "next/link"
import { Navigation } from "./navigation"
import { ProjectsSidebar } from "./projects-sidebar";



export const Sidebar = () => {
    return (
        <aside className="h-full bg-neutral-100 p-4 w-full">
            <Link href="/">
                <Image src="/PlanoraLog.png" alt="logo" width={250} height={250} />
            </Link>
            <Separator className="my-4"/>
            <WorkspaceSwitcher />
            <Separator className="my-4"/>
            <Navigation />
            <Separator className="my-4"/>
            <ProjectsSidebar />
        </aside>
    )
}