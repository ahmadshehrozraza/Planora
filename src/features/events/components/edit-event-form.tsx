"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
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
import { ArrowLeft, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";


interface EditEventFormProps {
    initialValues?: any;
    onCancel?: () => void;
}

export const EditEventForm = ({ initialValues, onCancel }: EditEventFormProps) => {
    const router = useRouter();
    const isPending = false;


    const workspaces = [{ $id: "ws_1", name: "Workspace A" }, { $id: "ws_2", name: "Workspace B" }];
    const projects = [{ $id: "pj_1", name: "Website Redesign" }, { $id: "pj_2", name: "Mobile App" }];
    const segments = [{ $id: "sg_1", name: "UI Design" }, { $id: "sg_2", name: "Backend" }];

    const form = useForm<z.infer<typeof createEventSchema>>({
        resolver: zodResolver(createEventSchema),
        defaultValues: {
            ...initialValues,
            date: initialValues.date ? new Date(initialValues.date) : new Date(),
        },
    });

    const onSubmit = (values: z.infer<typeof createEventSchema>) => {
        console.log("Updated Values:", values);
        // Edit API call yahan aayegi
    };

    const handleDelete = () => {
        const confirm = window.confirm("Are you sure you want to delete this event?");
        if (confirm) {
            console.log("Deleting event...");
            // Delete API call yahan aayegi
        }
    };

    return (
        <Card className="w-full border-none shadow-none">
            <CardHeader className="flex flex-row items-center justify-between p-4 space-y-0">
                <div className="flex items-center gap-x-2">
                    <CardTitle className="text-xl font-bold">
                        {initialValues.title}
                    </CardTitle>
                </div>

                {/* Delete Button */}
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                    <TrashIcon className="size-4 mr-2" />
                    Delete Event
                </Button>
            </CardHeader>

            <Separator />

            <CardContent className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">

                        {/* Title & Date */}
                        <div className="flex flex-col md:flex-row gap-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Event Title</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Event Title" disabled={isPending} />
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

                        {/* Dropdowns */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Workspace */}
                            <FormField
                                control={form.control}
                                name="workspaceId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Workspace</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isPending}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select workspace" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {workspaces.map((ws) => (
                                                    <SelectItem key={ws.$id} value={ws.$id}>{ws.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Project */}
                            <FormField
                                control={form.control}
                                name="projectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isPending}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select project" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {projects.map((pj) => (
                                                    <SelectItem key={pj.$id} value={pj.$id}>{pj.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Segment */}
                            <FormField
                                control={form.control}
                                name="segmentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Segment</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isPending}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select segment" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {segments.map((sg) => (
                                                    <SelectItem key={sg.$id} value={sg.$id}>{sg.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Event details..."
                                            className="min-h-[120px] resize-none"
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};