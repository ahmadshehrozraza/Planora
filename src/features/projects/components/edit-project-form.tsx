"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { ArrowLeftIcon, CopyIcon, ImageIcon, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProjectSchema } from "../schemas";
import { useDeleteProject } from "../api/use-delete-project";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { DummyProject, Project, ProjectStatus } from "../types";
import { useUpdateProject } from "../api/use-update-project";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencySelector } from "@/components/currency-selector";
import { DatePicker } from "@/components/date-picker";
import { Textarea } from "@/components/ui/textarea";

interface EditProjectFormProps {
    onCancel?: () => void;
    initialValues: DummyProject;
};

export const EditProjectForm = ({ onCancel, initialValues }: EditProjectFormProps) => {

    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const { mutate, isPending } = useUpdateProject();

    const {
        mutate: deleteProject,
        isPending: isDeletingProject
    } = useDeleteProject();


    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Project",
        "This action cannot be undone",
        "destructive",
    );


    const inputRef = useRef<HTMLInputElement>(null);
    const [imageSizeError, setImageSizeError] = useState(false);

    const form = useForm<z.infer<typeof updateProjectSchema>>({
        resolver: zodResolver(updateProjectSchema),
        defaultValues: {
            ...initialValues,
            imageUrl: initialValues.imageUrl ?? "",
        },
    });

    const handleDelete = async () => {
        const ok = await confirmDelete();

        if (!ok) return;

        // deleteProject({
        //     param: { projectId: initialValues.id },
        // }, {
        //     onSuccess: () => {
        //         toast.success("Project Deleted Successfully");
        //         window.location.href = `/workspaces/${initialValues.workspaceId}`;
        //     }
        // })
    }


    const onSubmit = (values: z.infer<typeof updateProjectSchema>) => {
        const finalValues = {
            ...values,
            imageUrl: values.imageUrl instanceof File ? values.imageUrl : "",
        };

        // mutate({
        //     form: finalValues,
        //     param: { projectId: initialValues.$id }
        // }, {
        //     onSuccess: ( { data }) => {
        //         form.reset();
        //         router.push(`/workspaces/${workspaceId}/projects/${data.$id}`);
        //     }
        // });

        alert("Edited Successfully");
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSize = 1024 * 1024; // 1MB
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
        <div className="flex flex-col">
            <DeleteDialog />
            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="space-y-4">

                                    <FormField
                                        control={form.control}
                                        name="imageUrl"
                                        render={({ field }) => (
                                            <div className="space-y-2 flex justify-center items-center flex-col">
                                                {/* <FormLabel>Project Image</FormLabel> */}
                                                <div className="flex items-center gap-x-5">
                                                    {field.value ? (
                                                        <div className="size-24 lg:size-60 relative rounded-full overflow-hidden border">
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
                                                        <Avatar className="size-24 lg:size-60 border">
                                                            <AvatarFallback>
                                                                <ImageIcon className="size-24 text-neutral-400" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    
                                                </div>
                                                <div className="flex flex-col items-center">
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
                                                                size="xs"
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
                                                                size="xs"
                                                                className="w-fit mt-2"
                                                                onClick={() => inputRef.current?.click()}
                                                            >
                                                                Upload Image
                                                            </Button>
                                                        )}
                                                    </div>
                                                <FormMessage />
                                            </div>
                                        )}
                                    />

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

                                    <FormField
                                        control={form.control}
                                        name="projectStatus"
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
                                                        <SelectItem value={ProjectStatus.ACTIVE}>
                                                            <div className="flex items-center gap-x-2">
                                                                Active
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value={ProjectStatus.ON_HOLD}>
                                                            <div className="flex items-center gap-x-2">
                                                                On Hold
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value={ProjectStatus.OVER_DUE}>
                                                            <div className="flex items-center gap-x-2">
                                                                Over Due
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value={ProjectStatus.COMPLETED}>
                                                            <div className="flex items-center gap-x-2">
                                                                Completed
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
                                

                                    {/* Start Date */}
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
                                                <FormLabel>Project Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        placeholder="Describe the project scope, objectives, and requirements..."
                                                        className="min-h-[136px]"
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    </div>

                            <div className="flex items-center justify-end mt-3">
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isPending || imageSizeError}
                                    className="min-w-[120px]"
                                >
                                    {isPending ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>


            <Card className="m-7 border-none shadow-none border border-red-200 rounded-lg bg-red-50">
                <CardHeader>
                        <h3 className="font-bold text-red-600">Danger Zone</h3>
                </CardHeader>
                <CardContent className="">
                    <div className="flex flex-col">
                        
                        <p className="text-md text-red-600 text-muted-foreground">
                            Deleting a project is irreversible and will remove all associated data.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button
                            className=""
                            size="sm"
                            variant="destructive"
                            type="button"
                            disabled={isPending}
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                        </Button>
                </CardFooter>
            </Card>
        </div>
    )
};