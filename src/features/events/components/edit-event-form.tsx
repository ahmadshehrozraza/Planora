"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/date-picker";
import { ScrollTimePicker } from "@/components/time-picker";

import { createEventSchema } from "../schemas";
import { useConfirm } from "@/hooks/use-confirm";

import { useUpdateEvent } from "@/features/events/api/use-update-event";
import { useDeleteEvent } from "@/features/events/api/use-delete-event";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";

interface EditEventFormProps {
  onCancel?: () => void;
  workspaceId: string;
  projects: any[];
  initialValues: any;
}

export const EditEventForm = ({ onCancel, workspaceId, projects, initialValues }: EditEventFormProps) => {
  
  const { mutate: updateEvent, isPending: isUpdatingEvent } = useUpdateEvent();
  const { mutate: deleteEvent, isPending: isDeletingEvent } = useDeleteEvent();
  
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Event",
    "Are you sure you want to delete this event? This action cannot be undone.",
    "destructive"
  );

  const isPending = isUpdatingEvent || isDeletingEvent;

  const form = useForm<z.infer<typeof createEventSchema>>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: initialValues.title || "",
      date: initialValues.date ? new Date(initialValues.date) : new Date(),
      workspaceId: workspaceId,
      projectId: initialValues.projectId || "none", 
      description: initialValues.description || "",
    },
  });

  const { data: permissions } = useGetPermissions( workspaceId );
  const allowed = (permissions?.workspaceAdmin || permissions?.isManagerAnywhere) ?? false;

  const onSubmit = (values: z.infer<typeof createEventSchema>) => {
    const finalPayload = {
      ...values,
      projectId: values.projectId,
    };

    updateEvent(
      { eventId: initialValues.id, json: finalPayload },
      { onSuccess: () => onCancel?.() }
    );
  };

  const handleDelete = async () => {
    const ok = await confirm();
    if (!ok) return;

    deleteEvent({ 
      eventId: initialValues.id, 
      workspaceId: workspaceId 
    });
  };

  return (
    <Card className="w-full h-fit border-none shadow-none mb-4">
      <ConfirmDialog />
      <CardHeader className="flex p-2">
        <CardTitle className="text-xl font-bold">Edit Event</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Sprint Review" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date & Time</FormLabel>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={(date) => {
                            if (!date) return;
                            const newDate = new Date(date);
                            const currentTime = field.value || new Date();
                            newDate.setHours(currentTime.getHours());
                            newDate.setMinutes(currentTime.getMinutes());
                            field.onChange(newDate);
                          }}
                          disabled={isPending}
                          placeholder="Select date"
                          className="w-full h-10 px-3"
                        />
                      </FormControl>
                    </div>
                    <div className="flex-shrink-0 w-full sm:w-[140px]">
                      <FormControl>
                        <ScrollTimePicker
                          date={field.value}
                          setDate={field.onChange}
                          className="h-10 px-3"
                        />
                      </FormControl>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scope (Project)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none" className="text-muted-foreground font-medium italic">
                        Entire Workspace
                      </SelectItem>
                      {projects?.map((proj) => (
                        <SelectItem key={proj.id} value={proj.id}>
                          {proj.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="What is this event about?"
                      className="min-h-[100px] resize-none"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {allowed && (
              <>
            <Separator className="my-4" />

            <div className="flex items-center justify-end gap-3">
              {onCancel && (
                <Button type="button" size="sm" variant="secondary" onClick={onCancel} disabled={isPending}>
                  Cancel
                </Button>
              )}
              <Button type="submit" size="sm" disabled={isPending} className="min-w-[120px] bg-blue-600 hover:bg-blue-700">
                {isUpdatingEvent ? "Saving..." : "Save Changes"}
              </Button>
            </div>
            </>
            )}
          </form>
        </Form>
      </CardContent>

      {allowed && (
      <Card className="shadow-none border border-destructive/20 bg-destructive/5 rounded-lg mt-4">
        <CardHeader>
          <h3 className="font-bold text-destructive dark:text-red-600">Danger Zone</h3>
        </CardHeader>
        <CardFooter className="flex justify-end">
          <Button
            size="sm"
            variant="destructive"
            type="button"
            disabled={isPending}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeletingEvent ? "Deleting..." : "Delete Event"}
          </Button>
        </CardFooter>
      </Card>
      )}
    </Card>
  );
};