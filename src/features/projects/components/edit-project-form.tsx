"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { ImageIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProjectSchema } from "../schemas";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProjectStatus } from "../types";
import { useUpdateProject } from "../api/use-update-project";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencySelector } from "@/components/currency-selector";
import { DatePicker } from "@/components/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface EditProjectFormProps {
    onCancel?: () => void;
    initialValues: any;
};

type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;

export const EditProjectForm = ({ onCancel, initialValues }: EditProjectFormProps) => {
    const workspaceId = useWorkspaceId();
    const { mutate, isPending } = useUpdateProject();

    const inputRef = useRef<HTMLInputElement>(null);
    const [imageSizeError, setImageSizeError] = useState(false);

    const form = useForm<UpdateProjectFormValues>({
        resolver: zodResolver(updateProjectSchema) as any,
        defaultValues: {
            name: initialValues.name ?? "",
            workspaceId: workspaceId ?? initialValues.workspaceId ?? "",
            status: initialValues.status as ProjectStatus,
            description: initialValues.description ?? "",
            imageUrl: initialValues.imageUrl ?? "",
            githubRepoUrl: initialValues.githubRepoUrl ?? "",
            budget: initialValues.budget ?? 0,
            currency: initialValues.currency ?? "PKR",
            startDate: initialValues.startDate ? new Date(initialValues.startDate) : undefined,
            dueDate: initialValues.dueDate ? new Date(initialValues.dueDate) : undefined,
        },
    });

    const onSubmit = (values: UpdateProjectFormValues) => {
        if (imageSizeError) return;

        const finalValues = {
            ...values,
            imageFile: values.imageUrl instanceof File ? values.imageUrl : null,
            imageUrl: typeof values.imageUrl === "string" ? values.imageUrl : null,
            status: values.status,
            startDate: values.startDate ? values.startDate.toISOString() : undefined,
            dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
            budget: Number(values.budget) || 0,
            githubRepoUrl: values.githubRepoUrl,
        };

        mutate({
             projectId: initialValues.id,
             workspaceId: workspaceId ?? initialValues.workspaceId, 
             values: finalValues
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSize = 1024 * 1024;
            if (file.size > maxSize) {
                setImageSizeError(true);
                form.setValue("imageUrl", file);
            } else {
                setImageSizeError(false);
                form.setValue("imageUrl", file);
            }
        }
    };

    return (
        <Card className="w-full border-border shadow-sm bg-card">
            <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-xl">General Information</CardTitle>
                <CardDescription>Update your project details, budget, and timelines.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <div className="space-y-2 flex items-center gap-x-8">
                                        {field.value ? (
                                            <div className="size-20 lg:size-24 relative rounded-md overflow-hidden border">
                                                <Image
                                                    alt="Project Logo"
                                                    fill
                                                    className="object-cover"
                                                    src={
                                                        typeof field.value === "string"
                                                            ? field.value
                                                            : URL.createObjectURL(field.value as File)
                                                    }
                                                />
                                            </div>
                                        ) : (
                                            <Avatar className="size-20 lg:size-24 border rounded-md">
                                                <AvatarFallback className="rounded-md">
                                                    <ImageIcon className="size-10 text-neutral-400" />
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        
                                        <div className="flex flex-col gap-y-2">
                                            <p className="text-sm font-medium">Project Icon</p>
                                            {imageSizeError ? (
                                                <p className="text-xs text-red-600 font-medium">Image exceeds 1MB limit</p>
                                            ) : (
                                                <p className="text-xs text-muted-foreground">JPG, PNG, SVG, JPEG max 1mb</p>
                                            )}

                                            <input
                                                className="hidden"
                                                type="file"
                                                accept=".jpg, .png, .jpeg, .svg"
                                                ref={inputRef}
                                                onChange={handleImageChange}
                                                disabled={isPending}
                                            />

                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    disabled={isPending}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => inputRef.current?.click()}
                                                >
                                                    Upload Image
                                                </Button>
                                                {field.value && (
                                                    <Button
                                                        type="button"
                                                        disabled={isPending}
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            field.onChange(null);
                                                            setImageSizeError(false);
                                                            if (inputRef.current) inputRef.current.value = "";
                                                        }}
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Name *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter project name" disabled={isPending} />
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
                                            <FormLabel>Project Status</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value={ProjectStatus.PLANNED}>Planned</SelectItem>
                                                    <SelectItem value={ProjectStatus.ACTIVE}>Active</SelectItem>
                                                    <SelectItem value={ProjectStatus.ON_HOLD}>On Hold</SelectItem>
                                                    <SelectItem value={ProjectStatus.COMPLETED}>Completed</SelectItem>
                                                    <SelectItem value={ProjectStatus.CANCELLED}>Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <div className="col-span-1">
                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Currency</FormLabel>
                                                <FormControl>
                                                    <CurrencySelector value={field.value || "PKR"} onValueChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="budget"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Budget Amount</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min="0"
                                                        step="1000"
                                                        placeholder="0.00"
                                                        disabled={isPending}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                        value={field.value || ""}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
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
                                name="githubRepoUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>GitHub Repository URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                placeholder="https://github.com/owner/repo"
                                                disabled={isPending}
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
                                    <FormItem>
                                        <FormLabel>Project Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                value={field.value ?? ""}
                                                placeholder="Describe the project scope, objectives, and requirements..."
                                                className="min-h-[100px]"
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator className="my-6" />

                        <div className="flex items-center justify-end">
                            <Button
                                type="submit"
                                disabled={isPending || imageSizeError}
                            >
                                {isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
};