"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";
import { SubmitHandler, useForm } from "react-hook-form";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "@/components/date-picker";
import { SprintStatus } from "../types";
import { useCreateSprint } from "../api/use-create-sprint";
import { createSprintSchema } from "../schemas";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type CreateSprintFormValues = z.infer<typeof createSprintSchema>;

interface CreateSprintFormProps {
    projectId?: string;
    onCancel?: () => void;
}

export const CreateSprintForm = ({ projectId: propProjectId, onCancel }: CreateSprintFormProps) => {
    const workspaceId = useWorkspaceId();
    const paramProjectId = useProjectId();
    const { mutate, isPending } = useCreateSprint();

    const activeProjectId = propProjectId || paramProjectId;

    const form = useForm<CreateSprintFormValues>({
        resolver: zodResolver(createSprintSchema) as any,
        defaultValues: {
            name: "",
            goal: "",
            workspaceId: workspaceId ?? "",
            projectId: activeProjectId ?? "",
            status: SprintStatus.PLANNED,
            capacityPoints: undefined,
            startDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            description: "",
        },
    });

    const onSubmit: SubmitHandler<CreateSprintFormValues> = (values) => {
        const finalValues = {
            ...values,
            goal: values.goal?.trim() || undefined,
            description: values.description?.trim() || undefined,
            capacityPoints: values.capacityPoints ? Number(values.capacityPoints) : undefined,
            startDate: values.startDate ? values.startDate.toISOString() : undefined,
            dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        };

        mutate(finalValues, {
            onSuccess: (data) => {
                if (data.success) {
                    form.reset();
                    if (onCancel) onCancel();
                }
            }
        });
    };

    return (
        <Card className="w-full h-fit border-none shadow-none">
            <CardHeader className="flex p-2">
                <CardTitle className="text-xl font-bold">Create a new Sprint</CardTitle>
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
                                            <FormLabel>Due Date *</FormLabel>
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

                        <div className="mb-3 mt-3"><Separator /></div>

                        <div className="flex items-center justify-between">
                            <Button type="button" size="sm" variant="secondary" onClick={onCancel} disabled={isPending} className={cn(!onCancel && "invisible")}>
                                Cancel
                            </Button>
                            <Button type="submit" size="sm" disabled={isPending} className="min-w-[120px]">
                                {isPending ? "Creating..." : "Create Sprint"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};