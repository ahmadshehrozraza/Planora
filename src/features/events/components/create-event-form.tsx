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

// --- Mock Hooks (Replace these with your actual API hooks) ---
// import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
// import { useGetProjects } from "@/features/projects/api/use-get-projects";
// import { useGetSegments } from "@/features/segments/api/use-get-segments";

// Define the Schema locally or import from your schemas file


interface CreateEventFormProps {
    onCancel?: () => void;
}

export const CreateEventForm = ({ onCancel }: CreateEventFormProps) => {
    // 1. Fetch Data (Replace with your actual hooks)
    // const { data: workspaces, isLoading: isLoadingWorkspaces } = useGetWorkspaces();
    // const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId: watchedWorkspaceId });
    // const { data: segments, isLoading: isLoadingSegments } = useGetSegments({ projectId: watchedProjectId });
    
    // MOCK DATA for display purposes
    const workspaces = [{ $id: "ws_1", name: "Workspace A" }, { $id: "ws_2", name: "Workspace B" }];
    const projects = [{ $id: "pj_1", name: "Website Redesign" }, { $id: "pj_2", name: "Mobile App" }];
    const segments = [{ $id: "sg_1", name: "UI Design" }, { $id: "sg_2", name: "Backend" }];
    const isPending = false;

    const form = useForm<z.infer<typeof createEventSchema>>({
        resolver: zodResolver(createEventSchema),
        defaultValues: {
            title: "",
            date: new Date(),
            workspaceId: "",
            projectId: "",
            segmentId: "",
            description: "",
        },
    });

    // Watch values to filter downstream dropdowns
    const selectedWorkspaceId = form.watch("workspaceId");
    const selectedProjectId = form.watch("projectId");

    const onSubmit = (values: z.infer<typeof createEventSchema>) => {
        console.log("Form Values:", values);
        // mutate({ json: values });
    };

    return (
        <Card className="w-full h-fit border-none shadow-none">
            <CardHeader className="flex p-2">
                <CardTitle className="text-xl font-bold">
                    Create New Event
                </CardTitle>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        
                        {/* 1. Title & Date Row */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
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
                                    <FormItem className="flex-1">
                                        <FormLabel>Event Date</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                {...field}
                                                value={field.value}
                                                onChange={field.onChange}
                                                disabled={isPending}
                                                placeholder="Select date"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator />

                        {/* 2. Hierarchy Selectors (Workspace -> Project -> Segment) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Workspace Select */}
                            <FormField
                                control={form.control}
                                name="workspaceId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Workspace</FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                // Reset child fields when parent changes
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

                            {/* Project Select */}
                            <FormField
                                control={form.control}
                                name="projectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project</FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                // Reset child field when parent changes
                                                form.setValue("segmentId", "");
                                            }}
                                            defaultValue={field.value}
                                            // Disable if no workspace is selected
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

                            {/* Segment Select */}
                            <FormField
                                control={form.control}
                                name="segmentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Segment</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            // Disable if no project is selected
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

                        {/* 3. Description */}
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

                        {/* 4. Actions */}
                        <div className="flex items-center justify-end gap-3">
                            {onCancel && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant='secondry'
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