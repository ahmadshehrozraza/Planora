"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/date-picker";
import { createEventSchema } from "../schemas";

// Import the Time Picker Wrapper
import { ScrollTimePicker } from "@/components/time-picker";

// --- Mock Hooks (Replace these with your actual API hooks) ---
// import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
// import { useGetProjects } from "@/features/projects/api/use-get-projects";
// import { useGetSegments } from "@/features/segments/api/use-get-segments";

interface CreateEventFormProps {
  onCancel?: () => void;
}

export const CreateEventForm = ({ onCancel }: CreateEventFormProps) => {
  // MOCK DATA for display purposes
  const workspaces = [
    { $id: "ws_1", name: "Workspace A" },
    { $id: "ws_2", name: "Workspace B" },
  ];
  const projects = [
    { $id: "pj_1", name: "Website Redesign" },
    { $id: "pj_2", name: "Mobile App" },
  ];
  const segments = [
    { $id: "sg_1", name: "UI Design" },
    { $id: "sg_2", name: "Backend" },
  ];
  const isPending = false;

  const form = useForm<z.infer<typeof createEventSchema>>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      date: new Date(), // Initialize with current date & time
      workspaceId: "",
      projectId: "",
      segmentId: "",
      description: "",
    },
  });

  const selectedWorkspaceId = form.watch("workspaceId");
  const selectedProjectId = form.watch("projectId");

  const onSubmit = (values: z.infer<typeof createEventSchema>) => {
    console.log("Form Values with Time:", values);
    // values.date now contains both Date and Time
    // mutate({ json: values });
  };

  return (
    <Card className="w-full h-fit border-none shadow-none">
      <CardHeader className="flex p-2">
        <CardTitle className="text-xl font-bold">Create New Event</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 1. Title */}
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

            {/* 2. Date & Time Row */}
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

            {/* 3. Hierarchy Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="workspaceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue("projectId", "");
                        form.setValue("segmentId", "");
                      }}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select workspace" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workspaces?.map((ws) => (
                          <SelectItem key={ws.$id} value={ws.$id}>
                            {ws.name}
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
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue("segmentId", "");
                      }}
                      defaultValue={field.value}
                      disabled={isPending || !selectedWorkspaceId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects?.map((proj) => (
                          <SelectItem key={proj.$id} value={proj.$id}>
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
                name="segmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Segment</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending || !selectedProjectId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select segment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {segments?.map((seg) => (
                          <SelectItem key={seg.$id} value={seg.$id}>
                            {seg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 4. Description */}
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

            {/* 5. Actions */}
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
