
import { DashboardClient } from "./client";
import { Navbar } from "@/components/navbar";
export const dynamic = 'force-dynamic';

const Dashboard = async ( ) => {

    return (
        <div className="flex flex-col">
            <Navbar title="Dashboard" description="Manage all your works herre" />
            <DashboardClient />
        </div>
    )
    
}
 
export default Dashboard;