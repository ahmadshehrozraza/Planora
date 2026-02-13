"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Calendar, Save, Trash2, ImageIcon, ArrowLeftIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { redirect, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChangeEmailForm } from "./change-email-form";
import { ChangePasswordForm } from "./change-password-form";
import { DeleteUserForm } from "./delete-user-form";
import { updateProfileSchema } from "../schemas";
import { useUpdateUser } from "../api/use-update-user";
import { useCurrent } from "../api/use-current";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import Image from "next/image";

export const UserProfileForm = () => {
    // const { data: user, isLoading } = useCurrent();

    const workspaceId = useWorkspaceId();

    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    // const { mutate, isPending } = useUpdateUser();

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


    const form = useForm<z.infer<typeof updateProfileSchema>>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            // ...user,
            // imageUrl: user.prefs?.avatar ?? "",
        },
    });

    // useEffect(() => {
    //     if (user) {
    //         form.reset({
    //             // name: user.name,
    //             // imageUrl: user.prefs?.avatar || "",
    //         });
    //     }
    // }, [user, form]);

    // if (isLoading) {
    //     return <div>Loading...</div>;
    // }



    const onSubmit = (values: z.infer<typeof updateProfileSchema>) => {

        const finalValues = {
            ...values,
            imageUrl: values.imageUrl instanceof File ? values.imageUrl : values.imageUrl || "no-image",
        };

        console.log("Final values:", finalValues);

        // mutate({
        //     form: finalValues,
        //     param: { userId: user.$id }
        // }, {
        //     onSuccess: () => {
        //         router.refresh();
        //     },
        //     onError: (error) => {
        //         toast.error("Failed to update profile");
        //     }
        // });

        alert("changes saved");
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


    const openEmailModal = () => setIsEmailModalOpen(true);
    const closeEmailModal = () => setIsEmailModalOpen(false);

    const openPasswordModal = () => setIsPasswordModalOpen(true);
    const closePasswordModal = () => setIsPasswordModalOpen(false);

    const openDeleteModal = () => setIsDeleteModalOpen(true);
    const closeDeleteModal = () => setIsDeleteModalOpen(false);

    return (
        <Card className="border-none px-5">
            {/* <ChangeEmailForm
                isOpen={isEmailModalOpen}
                onClose={closeEmailModal}
                user={user}
            />

            <ChangePasswordForm
                isOpen={isPasswordModalOpen}
                onClose={closePasswordModal}
                user={user}
            />

            <DeleteUserForm
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                user={user}
            /> */}

                    <CardHeader className="w-32">
                        <Button
                            size="sm"
                            variant="secondry"
                            onClick={() => router.back()}
                        >
                            <ArrowLeftIcon className="size-4 mr-1" />
                            Back
                        </Button>
                    </CardHeader>

                    <CardContent className="p-2 px-7">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="flex flex-col gap-6">
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
                                                    <p className="text-sm">User Image</p>
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
                                                        // disabled={isPending}
                                                    />

                                                    {field.value ? (
                                                        <Button
                                                            type="button"
                                                            // disabled={isPending}
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
                                                            // disabled={isPending}
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
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Enter your name"
                                                    // disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-end">
                                        <Button type="submit" size="sm"
                                        // disabled={isPending}
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {/* {isPending ? "Saving..." : "Save Changes"} */}
                                            Save Changes
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-gray-500" />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-700 truncate max-w-[150px] sm:max-w-xs">
                                                    admin@mail.com
                                                </span>
                                                <span className="text-xs text-gray-500">Email Address</span>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="xs"
                                            onClick={() => setIsEmailModalOpen(true)}
                                        >
                                            Change Email
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-700">
                                                {new Date().toLocaleDateString()}
                                            </span>
                                            <span className="text-xs text-gray-500">Joined Date</span>
                                        </div>
                                    </div>

                                    <div className="p-3 border rounded-lg">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full justify-start h-8"
                                            onClick={() => setIsPasswordModalOpen(true)}
                                        >
                                            Change Password
                                        </Button>
                                    </div>
                                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                                        <div className="flex flex-col">
                                            <h3 className="font-bold text-red-600">Danger Zone</h3>
                                            <p className="text-sm text-red-600 mt-1">
                                                Deleting your account is irreversible and will remove all your data including workspaces, projects, and tasks.
                                            </p>
                                            <Button
                                                className="mt-4 w-fit ml-auto"
                                                size="sm"
                                                variant="destructive"
                                                type="button"
                                                onClick={() => setIsDeleteModalOpen(true)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Account
                                            </Button>
                                        </div>
                                    </div>

                                </div>
                            </form>
                        </Form>
                    </CardContent>
        </Card>
    );
};