"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteEvent } from "@/features/events/api/use-delete-event";

interface DeleteEventCardProps {
  eventId: string;
  workspaceId: string;
}

export const DeleteEventCard = ({ eventId, workspaceId }: DeleteEventCardProps) => {
  const { mutate: deleteEvent, isPending: isDeletingEvent } = useDeleteEvent();
  
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Event",
    "Are you sure you want to delete this event? This action cannot be undone.",
    "destructive"
  );

  const handleDelete = async () => {
    const ok = await confirm();
    if (!ok) return;
    deleteEvent({ eventId, workspaceId });
  };

  return (
    <>
      <ConfirmDialog />
      <Card className="w-full shadow-none border border-destructive/30 bg-destructive/10 dark:bg-destructive/5 rounded-lg mt-6 mb-2">
        <CardHeader className="py-4 pb-2">
          <h3 className="font-bold text-destructive text-sm dark:text-red-500">
            Danger Zone
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Permanently delete this event and all its associated data, including attachments and meeting notes. This action is irreversible and will immediately remove the event from the workspace calendar.
          </p>
        </CardHeader>
        <CardFooter className="flex justify-end pt-2 pb-4">
          <Button 
            size="sm" 
            variant="destructive" 
            type="button" 
            disabled={isDeletingEvent} 
            onClick={handleDelete}
          >
            <Trash2 className="size-3.5 mr-2" />
            {isDeletingEvent ? "Deleting..." : "Delete Event"}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};