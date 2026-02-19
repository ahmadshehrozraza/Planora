import { Navbar } from "@/components/navbar"
import EventsClientPage from "./client";

export const EventsPage = () => {
    return (
        <div className="flex flex-col">
            <Navbar title="Events" description="Manage & view all your events here" />
            <EventsClientPage />
        </div>
    )
}

export default EventsPage;