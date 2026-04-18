"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "@/components/date-picker";
import { SegmentStatus } from "../types";
import { createSegmentSchema } from "../schemas";
import { useCreateSegment } from "../api/use-create-segment";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface CreateSegmentFormProps {
    onCancel?: () => void;
}

export const CreateSegmentForm = ({ onCancel }: CreateSegmentFormProps) => {
    const workspaceId = useWorkspaceId();
    const projectId = useProjectId();
    const { mutate, isPending } = useCreateSegment();

    const form = useForm<z.infer<typeof createSegmentSchema>>({
        resolver: zodResolver(createSegmentSchema),
        defaultValues: {
            name: "",
            workspaceId,
            projectId,
            status: SegmentStatus.ACTIVE,
            startDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            description: "",
        },
    });

    const onSubmit = (values: z.infer<typeof createSegmentSchema>) => {
        const finalValues = {
            ...values,
            startDate: values.startDate ? values.startDate.toISOString() : undefined,
            dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        };

        mutate(finalValues, {
            onSuccess: (data) => {
                if (data.success) {
                    form.reset();
                }
            }
        });
    };

    return (
        <Card className="w-full h-fit border-none shadow-none">
            <CardHeader className="flex p-2">
                <CardTitle className="text-xl font-bold">Create a new Segment</CardTitle>
            </CardHeader>
            <CardContent className="">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Segment Name *</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter segment name" disabled={isPending} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Segment Status</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={SegmentStatus.ACTIVE}>Active</SelectItem>
                                                <SelectItem value={SegmentStatus.ON_HOLD}>On Hold</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                             <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Date</FormLabel>
                                                <FormControl>
                                                    <DatePicker
                                                        {...field}
                                                        disabled={isPending}
                                                        placeholder="Select start date"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="dueDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Due Date *</FormLabel>
                                                <FormControl>
                                                    <DatePicker
                                                        {...field}
                                                        disabled={isPending}
                                                        placeholder="Select due date"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem className="">
                                                <FormLabel>Segment Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        placeholder="Describe the Segment's objectives, and requirements..."
                                                        className="min-h-[130px] resize-none"
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                        </div>

                        <div className="mb-3 mt-3"><Separator /></div>

                        <div className="flex items-center justify-between">
                            <Button type="button" size="sm" variant="secondary" onClick={onCancel} disabled={isPending} className={cn(!onCancel && "invisible")}>
                                Cancel
                            </Button>
                            <Button type="submit" size="sm" disabled={isPending} className="min-w-[120px]">
                                {isPending ? "Creating..." : "Create Segment"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};