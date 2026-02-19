
import { redirect } from "next/navigation";
import { DashboardClient } from "./client";
import { Navbar } from "@/components/navbar";


const Dashboard = async ( ) => {

    // const user = await getCurrent();
    // if(!user) redirect("/sign-in");
    
    
    return (
        <div className="flex flex-col">
            <Navbar title="Dashboard" description="Manage all your works herre" />
            <DashboardClient />
        </div>
    )
    
}
 
export default Dashboard;