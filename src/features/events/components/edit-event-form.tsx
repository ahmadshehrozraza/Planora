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
    };

    const handleDelete = () => {
        const confirm = window.confirm("Are you sure you want to delete this event? This action cannot be undone.");
        if (confirm) {
            console.log("Deleting event...");
        }
    };

    return (
        <Card className="w-full border-none shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-end space-y-0">
                <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleDelete}
                    // className="flex-end bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 shadow-none"
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
                                        <FormLabel className="text-foreground">Event Title</FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                placeholder="e.g. Sprint Planning" 
                                                className="h-10 bg-background border-border focus:bg-background transition-colors"
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
                                    <FormLabel className="text-foreground">Date & Time</FormLabel>
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
                                                    className="w-full h-10 px-3 bg-background border-border focus:bg-background"
                                                />
                                            </FormControl>
                                        </div>

                                        
                                        <div className="flex-shrink-0 w-full sm:w-[160px]">
                                            <FormControl>
                                                <ScrollTimePicker
                                                    date={field.value}
                                                    setDate={field.onChange}
                                                    className="h-10 px-3 bg-background border-border focus:bg-background"
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
                                        <FormLabel className="text-foreground">Workspace</FormLabel>
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
                                                <SelectTrigger className="h-10 bg-background border-border focus:bg-background">
                                                    <SelectValue placeholder="Select workspace" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-popover border-border">
                                                {WORKSPACES.map((ws) => (
                                                    <SelectItem key={ws.$id} value={ws.$id} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">{ws.name}</SelectItem>
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
                                        <FormLabel className="text-foreground">Project</FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                form.setValue("segmentId", "");
                                            }}
                                            defaultValue={field.value}
                                            disabled={isPending || !selectedWorkspaceId}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-10 bg-background border-border focus:bg-background disabled:opacity-50">
                                                    <SelectValue placeholder="Select project" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-popover border-border">
                                                {PROJECTS.map((pj) => (
                                                    <SelectItem key={pj.$id} value={pj.$id} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">{pj.name}</SelectItem>
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
                                        <FormLabel className="text-foreground">Segment</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isPending || !selectedProjectId}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-10 bg-background border-border focus:bg-background disabled:opacity-50">
                                                    <SelectValue placeholder="Select segment" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-popover border-border">
                                                {SEGMENTS.map((sg) => (
                                                    <SelectItem key={sg.$id} value={sg.$id} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">{sg.name}</SelectItem>
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
                                    <FormLabel className="text-foreground">Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Add details about this event..."
                                            className="min-h-[140px] resize-none bg-background border-border focus:bg-background leading-relaxed"
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
                                className="w-32 shadow-md transition-all hover:scale-[1.02]"
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