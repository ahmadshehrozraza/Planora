"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/date-picker";
import { Segment, SegmentStatus } from "../types";
import { editSegmentSchema } from "../schemas";
import { useUpdateSegment } from "../api/use-update-segment";
import { useDeleteSegment } from "../api/use-delete-segment";
import { useConfirm } from "@/hooks/use-confirm";
import { Router } from "next/router";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

interface EditSegmentFormProps {
    initialValues: Segment;
    onCancel?: () => void;
}

export const EditSegmentForm = ({ onCancel, initialValues }: EditSegmentFormProps) => {
    
    const { mutate: updateSegment, isPending: isUpdating } = useUpdateSegment();
    const { mutate: deleteSegment, isPending: isDeleting } = useDeleteSegment();
    
    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Segment",
        "This action cannot be undone",
        "destructive",
    );

    const workspaceId = useWorkspaceId();

    const form = useForm<z.infer<typeof editSegmentSchema>>({
        resolver: zodResolver(editSegmentSchema),
        defaultValues: {
            ...initialValues,
            startDate: initialValues.startDate ? new Date(initialValues.startDate) : undefined,
            dueDate: initialValues.dueDate ? new Date(initialValues.dueDate) : undefined,
        },
    });

    const isPending = isUpdating || isDeleting;

    const handleDelete = async () => {
        const ok = await confirmDelete();
        if (!ok) return;

        deleteSegment(
            { segmentId: initialValues.id }, 
            {
                onSuccess: (data) => {
                    if(data.success) {
                        window.location.href = `/workspaces/${workspaceId}/projects/${initialValues.projectId}`; 
                    }
                }
            }
        );
    };

    const onSubmit = (values: z.infer<typeof editSegmentSchema>) => {
        const finalValues = {
            ...values,
            startDate: values.startDate ? values.startDate.toISOString() : undefined,
            dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        };

        updateSegment({
             segmentId: initialValues.id,
             values: finalValues
        });
    };

    return(
        <div className="flex flex-col gap-y-4">
            <DeleteDialog />
            <Card className="w-full h-fit border-none shadow-none">
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
                                                    <SelectItem value={SegmentStatus.COMPLETED}>Completed</SelectItem>
                                                    <SelectItem value={SegmentStatus.OVER_DUE}>Over Due</SelectItem>
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
                                                    value={field.value ?? undefined}
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
                                            <FormLabel>Due Date</FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    {...field}
                                                    value={field.value ?? undefined}
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
                                                    value={field.value ?? ""}
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

                            <div className="mb-3 mt-3">
                                <Separator />
                            </div>

                            <div className="flex items-center justify-between">
                                <Button type="button" size="sm" variant="secondary" onClick={onCancel} disabled={isPending} className={cn(!onCancel && "invisible")}>
                                    Cancel
                                </Button>
                                <Button type="submit" size="sm" disabled={isPending} className="min-w-[120px]">
                                    {isUpdating ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className="shadow-none border border-destructive/20 bg-destructive/5 rounded-lg">
                <CardHeader>
                    <h3 className="font-bold text-destructive dark:text-red-600">Danger Zone</h3>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-destructive/80 dark:text-red-600">
                        Deleting a segment is irreversible and will remove all associated data.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button size="sm" variant="destructive" type="button" disabled={isPending} onClick={handleDelete}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Segment
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};