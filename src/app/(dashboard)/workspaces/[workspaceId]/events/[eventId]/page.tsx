"use client";

import { Navbar } from "@/components/navbar";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetEvent } from "@/features/events/api/use-get-events";
import { EditEventForm } from "@/features/events/components/edit-event-form";
import { useEventId } from "@/features/events/hooks/use-event-id";

export const Event = () => {
  const eventId = useEventId();

  const { data: event, isLoading } = useGetEvent({ eventId });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!event) {
    return <PageError message="Event not found" />;
  }

  return (
    <div className="flex flex-col">
      <Navbar title={event.title} description="Edit & view task here" />
      <EditEventForm initialValues={event} />
    </div>
  );
};

export default Event;
