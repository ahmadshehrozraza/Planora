"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editTaskSchema } from "../schemas";

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
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { DatePicker } from "@/components/date-picker";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Task, TaskPriority, TaskStatus, TaskType } from "../types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useUpdateTask } from "../api/use-update-task";
import { useCurrentMember } from "@/features/members/hooks/current-user-role";


interface EditTaskFormProps {
    onCancel?: () => void;
    projectOptions: { id: string, name: string, imageUrl: string }[];
    memberOptions: { id: string, name: string }[];
    initialValues: Task;
};

export const EditTaskForm = ({ onCancel, projectOptions, memberOptions, initialValues }: EditTaskFormProps) => {

    const workspaceId = useWorkspaceId();

    const { isAdmin, member } = useCurrentMember();

    if (!workspaceId) return;

    const { mutate, isPending } = useUpdateTask();

    const form = useForm<z.infer<typeof editTaskSchema>>({
        resolver: zodResolver(editTaskSchema),
        defaultValues: {
            ...initialValues,
            dueDate: new Date(initialValues.dueDate),
        },
    });


    const onSubmit = (values: z.infer<typeof editTaskSchema>) => {

        console.log(" Values: ", values);
        mutate(
            {
                json: values,
                param: { taskId: initialValues.$id }
            },
            {
                onSuccess() {
                    form.reset();
                    onCancel?.();
                },
            }
        );
    };


    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="flex p-2">
                <CardTitle className="text-xl font-bold">
                    Edit Task
                </CardTitle>
            </CardHeader>

            <div className="px-3">
                <Separator />
            </div>
            <CardContent className="p-4 ">
                <Form {...form} >
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex h-full flex-col gap-y-5">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Task Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                className="mb-4"
                                                {...field}
                                                placeholder="Enter task name"
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
                                        <FormLabel>
                                            Due Date
                                        </FormLabel>
                                        <FormControl>
                                            <DatePicker {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="assigneeId"
                                render={({ field }) =>
                                     isAdmin ?
                                 (
                                    <FormItem>
                                        <FormLabel>Assignee</FormLabel>
                                        <Select
                                            value={field.value || "no-assignee"}
                                            onValueChange={(val) =>

                                                field.onChange(val === "no-assignee" ? "no-assignee" : val)
                                            }
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Assignee" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <FormMessage />

                                            <SelectContent>
                                                <SelectItem value="no-assignee">
                                                    <div className="flex items-center gap-x-2">
                                                        <MemberAvatar
                                                            name={null}
                                                            className="size-6"
                                                        />
                                                        No Assignee
                                                    </div>
                                                </SelectItem>

                                                {memberOptions.map((member) => (
                                                    <SelectItem key={member.id} value={member.id}>
                                                        <div className="flex items-center gap-x-2">
                                                            <MemberAvatar className="size-6" name={member.name} />
                                                            {member.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                ) : (
                                    <FormItem>
                                        <FormLabel>Assignee</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                readOnly
                                                disabled
                                                className="bg-muted"
                                                value={memberOptions.find(m => m.id === initialValues.assigneeId)?.name}
                                            />
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
                                        <FormLabel>
                                            Status
                                        </FormLabel>
                                        <Select
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <FormMessage />
                                            <SelectContent>
                                                <SelectItem value={TaskStatus.BACKLOG}>
                                                    Backlog
                                                </SelectItem>

                                                <SelectItem value={TaskStatus.TODO}>
                                                    Todo
                                                </SelectItem>

                                                <SelectItem value={TaskStatus.IN_PROGRESS}>
                                                    In Progress
                                                </SelectItem>

                                                <SelectItem value={TaskStatus.IN_REVIEW}>
                                                    In Review
                                                </SelectItem>

                                                <SelectItem value={TaskStatus.DONE}>
                                                    Done
                                                </SelectItem>

                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="projectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Project
                                        </FormLabel>
                                        <Select
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Project" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <FormMessage />
                                            <SelectContent>
                                                {projectOptions.map((project) => (
                                                    <SelectItem key={project.id} value={project.id}>
                                                        <div className="flex items-center gap-x-2">
                                                            <ProjectAvatar
                                                                className="size-6"
                                                                name={project.name}
                                                                image={project.imageUrl}
                                                            />
                                                            {project.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Task description
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                className="mb-4"
                                                {...field}
                                                placeholder="Enter task description"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="taskType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Task Type</FormLabel>
                                        <Select
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Task Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <FormMessage />
                                            <SelectContent>
                                                <SelectItem value={TaskType.TASK}>
                                                    <div className="flex items-center gap-x-2">
                                                        Task
                                                    </div>
                                                </SelectItem>

                                                <SelectItem value={TaskType.FEATURE}>
                                                    <div className="flex items-center gap-x-2">
                                                        Feature
                                                    </div>
                                                </SelectItem>

                                                <SelectItem value={TaskType.DOCUMENTATION}>
                                                    <div className="flex items-center gap-x-2">
                                                        Documentation
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <FormMessage />
                                            <SelectContent>
                                                <SelectItem value={TaskPriority.LOW}>
                                                    <div className="flex items-center gap-x-2">
                                                        Low
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value={TaskPriority.MEDIUM}>
                                                    <div className="flex items-center gap-x-2">
                                                        Medium
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value={TaskPriority.HIGH}>
                                                    <div className="flex items-center gap-x-2">
                                                        High
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="assignedBy"
                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel>Assigned By</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    readOnly
                                                    disabled
                                                    className="bg-muted cursor-not-allowed"
                                                    value={initialValues.assignedByUser?.name || "Unknown User"}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />

                        </div>

                        <div className="mb-5 mt-5">
                            <Separator />
                        </div>

                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondry"
                                onClick={onCancel}
                                disabled={isPending}
                                className={cn(!onCancel && "invisible")}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                size="sm"
                                disabled={isPending}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
};