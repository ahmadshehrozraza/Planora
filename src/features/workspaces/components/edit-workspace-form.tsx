"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { ArrowLeftIcon, CopyIcon, ImageIcon, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateWorkspaceSchema } from "../schemas";

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
import { DummyWorkspace, Workspace } from "../types";
import { useUpdateWorkspace } from "../api/use-update-workspace";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteWorkspace } from "../api/use-delete-workspace";
import { useResetInviteCode } from "../api/use-reset-invite-code";


interface EditWorkspaceFormProps {
    onCancel?: () => void;
    initialValues: DummyWorkspace;
};

export const EditWorkspaceForm = ({ onCancel, initialValues }: EditWorkspaceFormProps) => {

    const router = useRouter();
    const { mutate, isPending } = useUpdateWorkspace();
    const {
        mutate: deleteWorkspace,
        isPending: isDeletingWorkspace
    } = useDeleteWorkspace();

    const {
        mutate: resetInviteCode,
        isPending: isResettingInviteCode,
    } = useResetInviteCode();

    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Workspace",
        "This action cannot be undone",
        "destructive",
    );

    const [ResetDialog, confirmReset] = useConfirm(
        "Reset invite link",
        "This will invalidate the current invite link",
        "destructive",
    );

    const inputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
        resolver: zodResolver(updateWorkspaceSchema),
        defaultValues: {
            ...initialValues,
            imageUrl: initialValues.imageUrl ?? "",
        },
    });

    const handleDelete = async () => {
        const ok = await confirmDelete();

        if (!ok) return;

        // deleteWorkspace({
        //     param: { workspaceId: initialValues.id },
        // }, {
        //     onSuccess: () => {
        //        window.location.href = "/";
        //     }
        // })
    }

    const handleResetInviteCode = async () => {
        const ok = await confirmReset();

        if (!ok) return;

        //     resetInviteCode({
        //         param: { workspaceId: initialValues.id },
        //     },
        // )
    }

    const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
        const finalValues = {
            ...values,
            imageUrl: values.imageUrl instanceof File ? values.imageUrl : "",
        };

        // mutate({
        //     form: finalValues,
        //     param: { workspaceId: initialValues.id }
        // });

        alert("Workspace Edited");
    };

    const [imageSizeError, setImageSizeError] = useState(false);

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



    const fullInviteLink = `${window.location.origin}/workspaces/${initialValues.id}/join/123456`;

    const handleCopyInviteLink = () => {
        navigator.clipboard.writeText(fullInviteLink)
            .then(() => toast.success("Invite link copied to the clipboard"));
    }

    return (
        <div className="w-full flex flex-col gap-y-4">
            <DeleteDialog />
            <ResetDialog />
            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-4 ">
                    <Form {...form} >
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex h-full flex-col gap-y-9">
                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <div className="space-y-2 flex justify-center items-center flex-col">
                                            <div className="flex items-center gap-x-5">
                                                {field.value ? (
                                                    <div className="size-24 lg:size-60 relative rounded-full overflow-hidden border">
                                                        <Image
                                                            alt="Workspace Logo"
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
                                                <p className="text-sm">Workspace Icon</p>
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
                                            <FormLabel>
                                                Workspace Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="mb-4"
                                                    {...field}
                                                    placeholder="Enter workspace name"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
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

            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex flex-col">
                        <h3 className="font-bold">Invite Members</h3>
                        <p className="text-sm text-muted-foreground">
                            use the invite link to add members to your workspace.
                        </p>
                        <div className="mt-4">
                            <div className="flex items-center gap-x-2">
                                <Input disabled value={fullInviteLink} />
                                <Button
                                    onClick={handleCopyInviteLink}
                                    variant="secondry"
                                    className="size-12"
                                >
                                    <CopyIcon className="size-5" />
                                </Button>
                            </div>
                        </div>
                        <Separator className="my-3" />
                        <Button
                            className="mt-3 w-fit ml-auto"
                            size="sm"
                            variant="destructive"
                            type="button"
                            disabled={isPending || isResettingInviteCode}
                            onClick={handleResetInviteCode}
                        >

                            Reset Invite Link
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className=" border-none shadow-none border border-red-200 rounded-lg bg-red-50">
                <CardHeader>
                    <h3 className="font-bold text-red-600">Danger Zone</h3>
                </CardHeader>
                <CardContent className="">
                    <div className="flex flex-col">

                        <p className="text-md text-red-600 text-muted-foreground">
                            Deleting a workspace is irreversible and will remove all associated data.
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
                        Delete Workspace
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
};