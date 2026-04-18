"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema } from "../schemas";
import { CurrencySelector } from "@/components/currency-selector";

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
import { useCreateProject } from "../api/use-create-project";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { DatePicker } from "@/components/date-picker";
import { ProjectStatus } from "../types";

interface CreateProjectFormProps {
    onCancel?: () => void;
}

export const CreateProjectForm = ({ onCancel }: CreateProjectFormProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const { mutate, isPending } = useCreateProject();
    const inputRef = useRef<HTMLInputElement>(null);
    const [imageSizeError, setImageSizeError] = useState(false);

    if (!workspaceId) return;

    const form = useForm<z.infer<typeof createProjectSchema>>({
        resolver: zodResolver(createProjectSchema),
        defaultValues: {
            name: "",
            workspaceId,
            status: ProjectStatus.ACTIVE, 
            currency: "PKR", 
            startDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            description: "",
            githubRepoUrl: "",
            budget: 0,
        },
    });

    const onSubmit = (values: z.infer<typeof createProjectSchema>) => {
        if (imageSizeError) return;

        const finalValues = {
            ...values,
            imageFile: values.imageUrl instanceof File ? values.imageUrl : null, 
            projectStatus: values.status || "ACTIVE",
            startDate: values.startDate ? values.startDate.toISOString() : undefined,
            dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
            budget: Number(values.budget) || 0,
            githubRepoUrl: values.githubRepoUrl,
        };

        mutate(finalValues); 
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
        <Card className="w-full h-fit border-none shadow-none">
            <CardHeader className="flex p-2">
                <CardTitle className="text-xl font-bold">
                    Create a new Project
                </CardTitle>
            </CardHeader>

            <div className="px-3">
                <Separator />
            </div>

            <CardContent className="">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="mt-2 w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <FormLabel>Project Image</FormLabel>
                                            <div className="flex items-center gap-x-5">
                                                {field.value ? (
                                                    <div className="size-[100px] relative rounded-md overflow-hidden border">
                                                        <Image
                                                            alt="Project Logo"
                                                            fill
                                                            className="object-cover"
                                                            src={
                                                                typeof field.value === "string"
                                                                    ? field.value
                                                                    : field.value
                                                                        ? URL.createObjectURL(field.value as File)
                                                                        : ""
                                                            }
                                                        />
                                                    </div>
                                                ) : (
                                                    <Avatar className="size-[100px] border">
                                                        <AvatarFallback>
                                                            <ImageIcon className="size-[45px] text-neutral-400" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className="flex flex-col">
                                                    <p className="text-sm">Project Icon</p>
                                                    {imageSizeError ? (
                                                        <p className="text-sm text-red-600 font-medium">
                                                            Image exceeds 1MB limit
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">
                                                            JPG, PNG, SVG, JPEG max 1mb
                                                        </p>
                                                    )}

                                                    <input
                                                        className="hidden"
                                                        type="file"
                                                        accept=".jpg, .png, .jpeg, .svg"
                                                        ref={inputRef}
                                                        onChange={handleImageChange}
                                                        disabled={isPending}
                                                    />

                                                    {field.value ? (
                                                        <Button
                                                            type="button"
                                                            disabled={isPending}
                                                            variant="destructive"
                                                            size="sm"
                                                            className="w-fit mt-2"
                                                            onClick={() => {
                                                                field.onChange(null);
                                                                setImageSizeError(false);
                                                                if (inputRef.current) {
                                                                    inputRef.current.value = "";
                                                                }
                                                            }}
                                                        >
                                                            Remove Image
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            disabled={isPending}
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-fit mt-2"
                                                            onClick={() => inputRef.current?.click()}
                                                        >
                                                            Upload Image
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                />

                                <div className="!mt-8">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Name *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter project name"
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
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Status</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={isPending}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="ACTIVE">
                                                        <div className="flex items-center gap-x-2">
                                                            Active
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="ON_HOLD">
                                                        <div className="flex items-center gap-x-2">
                                                            On Hold
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-3 gap-3 items-end">
                                    <div className="col-span-1">
                                        <FormField
                                            control={form.control}
                                            name="currency"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-medium">Currency</FormLabel>
                                                    <FormControl>
                                                        <CurrencySelector
                                                            value={field.value || "PKR"}
                                                            onValueChange={field.onChange}
                                                            className="h-10"
                                                        />
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
                                                    <FormLabel className="text-xs font-medium">Amount</FormLabel>
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
                                                            className="h-10"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mt-2 lg:mt-0">
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
                                    name="githubRepoUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>GitHub Repository URL</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
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
                                        <FormItem className="">
                                            <FormLabel>Project Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    placeholder="Describe the project scope, objectives, and requirements..."
                                                    className="min-h-[130px] resize-none"
                                                    disabled={isPending}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="mb-3 mt-3">
                            <Separator />
                        </div>

                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={onCancel}
                                disabled={isPending}
                                className={cn(!onCancel && "invisible")}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                size="sm"
                                disabled={isPending || imageSizeError}
                                className="min-w-[120px]"
                            >
                                {isPending ? "Creating..." : "Create Project"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};