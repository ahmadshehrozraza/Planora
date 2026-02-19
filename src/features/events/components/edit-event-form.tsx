"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrashIcon, CalendarIcon } from "lucide-react";

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
import { ScrollTimePicker } from "@/components/time-picker"; 
import { createEventSchema } from "../schemas";

const WORKSPACES = [{ $id: "ws_1", name: "Workspace A" }, { $id: "ws_2", name: "Workspace B" }];
const PROJECTS = [{ $id: "pj_1", name: "Website Redesign" }, { $id: "pj_2", name: "Mobile App" }];
const SEGMENTS = [{ $id: "sg_1", name: "UI Design" }, { $id: "sg_2", name: "Backend" }];

interface EditEventFormProps {
    initialValues: any; 
    onCancel?: () => void;
}

export const EditEventForm = ({ initialValues, onCancel }: EditEventFormProps) => {
    const router = useRouter();
    const isPending = false; 

    const form = useForm<z.infer<typeof createEventSchema>>({
        resolver: zodResolver(createEventSchema),
        defaultValues: {
            ...initialValues,
            date: initialValues.date ? new Date(initialValues.date) : new Date(),
        },
    });

    const selectedWorkspaceId = form.watch("workspaceId");
    const selectedProjectId = form.watch("projectId");

    const onSubmit = (values: z.infer<typeof createEventSchema>) => {
        console.log("Updated Values:", values);
        // Call Update API here
    };

    const handleDelete = () => {
        const confirm = window.confirm("Are you sure you want to delete this event? This action cannot be undone.");
        if (confirm) {
            console.log("Deleting event...");
            // Call Delete API here
            // router.push("/events");
        }
    };

    return (
        <Card className="w-full border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-end space-y-0">
                <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleDelete}
                    className="bg-red-50 flex-end text-red-600 hover:bg-red-100 border border-red-200 shadow-none"
                >
                    <TrashIcon className="size-4 mr-2" />
                    Delete
                </Button>
            </CardHeader>

            <CardContent className="mt-[-20px]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <div className="grid grid-cols-1 gap-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700">Event Title</FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                placeholder="e.g. Sprint Planning" 
                                                className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                                                disabled={isPending} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="text-slate-700">Date & Time</FormLabel>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {/* Date Picker */}
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
                                                    className="w-full h-10 px-3 bg-slate-50/50 border-slate-200 focus:bg-white"
                                                />
                                            </FormControl>
                                        </div>

                                        {/* Time Picker */}
                                        <div className="flex-shrink-0 w-full sm:w-[160px]">
                                            <FormControl>
                                                <ScrollTimePicker
                                                    date={field.value}
                                                    setDate={field.onChange}
                                                    className="h-10 px-3 bg-slate-50/50 border-slate-200 focus:bg-white"
                                                />
                                            </FormControl>
                                        </div>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="workspaceId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700">Workspace</FormLabel>
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
                                                <SelectTrigger className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white">
                                                    <SelectValue placeholder="Select workspace" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {WORKSPACES.map((ws) => (
                                                    <SelectItem key={ws.$id} value={ws.$id}>{ws.name}</SelectItem>
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
                                        <FormLabel className="text-slate-700">Project</FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                form.setValue("segmentId", "");
                                            }}
                                            defaultValue={field.value}
                                            disabled={isPending || !selectedWorkspaceId}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white">
                                                    <SelectValue placeholder="Select project" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {PROJECTS.map((pj) => (
                                                    <SelectItem key={pj.$id} value={pj.$id}>{pj.name}</SelectItem>
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
                                        <FormLabel className="text-slate-700">Segment</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isPending || !selectedProjectId}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white">
                                                    <SelectValue placeholder="Select segment" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {SEGMENTS.map((sg) => (
                                                    <SelectItem key={sg.$id} value={sg.$id}>{sg.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700">Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Add details about this event..."
                                            className="min-h-[140px] resize-none bg-slate-50/50 border-slate-200 focus:bg-white leading-relaxed"
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center justify-end">
                            
                            <Button 
                                type="submit" 
                                disabled={isPending} 
                                className="w-32 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all hover:scale-[1.02]"
                            >
                                {isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};