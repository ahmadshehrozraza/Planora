"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";
import { useForm, SubmitHandler } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/date-picker";
import { Sprint, SprintStatus } from "../types";
import { editSprintSchema } from "../schemas";
import { useUpdateSprint } from "../api/use-update-sprint";
import { useDeleteSprint } from "../api/use-delete-sprint";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

interface EditSprintFormProps {
    initialValues: Sprint;
    onCancel?: () => void;
}

type EditSprintFormValues = z.infer<typeof editSprintSchema>;

export const EditSprintForm = ({ onCancel, initialValues }: EditSprintFormProps) => {
    const { mutate: updateSprint, isPending: isUpdating } = useUpdateSprint();
    const { mutate: deleteSprint, isPending: isDeleting } = useDeleteSprint();
    
    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Sprint",
        "This action cannot be undone",
        "destructive",
    );

    const workspaceId = useWorkspaceId();

    const form = useForm<EditSprintFormValues>({
        resolver: zodResolver(editSprintSchema) as any,
        defaultValues: {
            name: initialValues.name,
            status: initialValues.status,
            capacityPoints: initialValues.capacityPoints ?? undefined,
            goal: initialValues.goal || "", 
            description: initialValues.description || "", 
            startDate: initialValues.startDate ? new Date(initialValues.startDate) : undefined,
            dueDate: initialValues.dueDate ? new Date(initialValues.dueDate) : undefined,
        },
    });

    const isPending = isUpdating || isDeleting;

    const handleDelete = async () => {
        const ok = await confirmDelete();
        if (!ok) return;

        deleteSprint(
            { sprintId: initialValues.id, projectId: initialValues.projectId }, 
            {
                onSuccess: (data) => {
                    if(data.success) {
                        window.location.href = `/workspaces/${workspaceId}/projects/${initialValues.projectId}`; 
                    }
                }
            }
        );
    };

    const onSubmit: SubmitHandler<EditSprintFormValues> = (values) => {
        const finalValues = {
            ...values,
            startDate: values.startDate ? values.startDate.toISOString() : undefined,
            dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
            capacityPoints: values.capacityPoints ? Number(values.capacityPoints) : undefined,
            description: values.description?.trim() || undefined,
            goal: values.goal?.trim() || undefined,
        };

        updateSprint({
             sprintId: initialValues.id,
             projectId: initialValues.projectId,
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
                                            <FormLabel>Sprint Name *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter sprint name" disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="goal"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sprint Goal</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value ?? ""} placeholder="What is the main objective of this sprint?" disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sprint Status</FormLabel>
                                                <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value={SprintStatus.PLANNED}>Planned</SelectItem>
                                                        <SelectItem value={SprintStatus.ACTIVE}>Active</SelectItem>
                                                        <SelectItem value={SprintStatus.CLOSED}>Closed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="capacityPoints"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Capacity Points</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...field} 
                                                        type="number" 
                                                        min="0"
                                                        value={field.value ?? ""} 
                                                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                                        placeholder="e.g. 40" 
                                                        disabled={isPending} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                        onChange={field.onChange}
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
                                                        onChange={field.onChange}
                                                        disabled={isPending}
                                                        placeholder="Select due date"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="">
                                            <FormLabel>Sprint Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    placeholder="Describe the Sprint's objectives, and requirements..."
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
                        Deleting a sprint is irreversible and will remove all associated data.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button size="sm" variant="destructive" type="button" disabled={isPending} onClick={handleDelete}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Sprint
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};