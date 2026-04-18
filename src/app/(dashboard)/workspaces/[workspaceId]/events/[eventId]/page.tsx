
import { Navbar } from "@/components/navbar";
import EventClient from "./client";


export const EventPage = () => {


  return (
    <div className="flex flex-col">
      <Navbar title="Event" description="Edit & view event here" />
      <EventClient />
    </div>
  );
};

export default EventPage;
