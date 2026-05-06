"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { DatePicker } from "@/components/date-picker";
import { ScrollTimePicker } from "@/components/time-picker";
import { createEventSchema } from "../schemas";

import { useCreateEvent } from "@/features/events/api/use-create-event";

interface CreateEventFormProps {
  onCancel?: () => void;
  workspaceId: string; 
  projects: any[];    
  sprints?: any[];
}

export const CreateEventForm = ({ onCancel, workspaceId, projects, sprints }: CreateEventFormProps) => {
  
  const { mutate: createEvent, isPending: isCreatingEvent } = useCreateEvent();

  const form = useForm<z.infer<typeof createEventSchema>>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      date: new Date(), 
      workspaceId: workspaceId,
      projectId: "none", 
      sprintId: "none",
      description: "",
    },
  });

  const selectedProjectId = form.watch("projectId");

  const onSubmit = (values: z.infer<typeof createEventSchema>) => {
    const finalPayload = {
      ...values,
      projectId: values.projectId === "none" ? undefined : values.projectId,
      sprintId: values.sprintId === "none" ? undefined : values.sprintId,
    };

    createEvent(finalPayload, { 
      onSuccess: () => {
        form.reset();
        onCancel?.();
      } 
    });
  };

  const isPending = isCreatingEvent;

  return (
    <Card className="w-full h-fit border-none shadow-none">
      <CardHeader className="flex p-2">
        <CardTitle className="text-xl font-bold">Create New Event</CardTitle>
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
                    <Input
                      {...field}
                      placeholder="e.g. Sprint Review"
                      disabled={isPending}
                    />
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
                    onValueChange={(val) => {
                      field.onChange(val);
                      form.setValue("sprintId", "none");
                    }}
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

            {selectedProjectId && selectedProjectId !== "none" && sprints && sprints.length > 0 && (
              <FormField
                control={form.control}
                name="sprintId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link to Sprint (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sprint" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none" className="text-muted-foreground font-medium italic">
                          No Sprint (Project Level)
                        </SelectItem>
                        {sprints.map((sprint) => (
                          <SelectItem key={sprint.id} value={sprint.id}>
                            {sprint.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

            <Separator className="my-4" />

            <div className="flex items-center justify-end gap-3">
              {onCancel && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              )}

              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
              >
                {isPending ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};