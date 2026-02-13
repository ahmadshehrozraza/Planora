"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { passwordVerifySchema } from "../schemas";
import { useVerifyPassword } from "../api/use-verify-current-password";
import { useDeleteUser } from "../api/use-delete-user";

interface DeleteUserFormProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export const DeleteUserForm = ({ 
    isOpen, 
    onClose,
    user,
}: DeleteUserFormProps) => {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Account",
        "This action cannot be undone. All your data will be permanently removed.",
        "destructive",
    );

    const form = useForm<z.infer<typeof passwordVerifySchema>>({
        resolver: zodResolver(passwordVerifySchema),
        defaultValues: {
            currentPassword: "",
        },
    });

    const { mutate: verifyPassword, isPending: isVerifying } = useVerifyPassword();
    const { mutate: deleteUser, isPending: isDeletingUser } = useDeleteUser();

    const handleDeleteAccount = async () => {
    deleteUser({
        param: { 
            userId: user.$id
        }
    }, {
        onSuccess: () => {
            router.push("/sign-in");
        },
        onError: (error) => {
            console.error("Delete error:", error);
            toast.error("Failed to delete account");
        }
    });
};

    const onVerifySubmit = async (values: z.infer<typeof passwordVerifySchema>) => {
        console.log("values: ", values);
    verifyPassword({
        json: {
            email: user.email,
            currentPassword: values.currentPassword,
        }
        }, {
            onSuccess: () => {
                confirmDelete().then((ok) => {
                    if (ok) {
                        handleDeleteAccount(); // Call delete function
                    }
                });
            },
            // onError already handled in the hook
        });
    };

    const resetForm = () => {
        form.reset();
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const isLoading = isVerifying || isDeleting;

    return (
        <>
            <DeleteDialog />
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Account
                        </DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onVerifySubmit)} className="space-y-4">
                            <div className="text-sm text-gray-600 space-y-2">
                                <p className="font-medium text-red-600">
                                    Warning: This action is permanent and cannot be undone.
                                </p>
                                <p>
                                    All your data including workspaces, projects, and tasks will be permanently deleted.
                                </p>
                                <p className="font-medium">
                                    To continue, please verify your identity by entering your current password.
                                </p>
                            </div>

                            <FormField
                                control={form.control}
                                name="currentPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="Enter your current password"
                                                disabled={isLoading}
                                                autoComplete="current-password"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={isLoading}
                                    variant="destructive"
                                >
                                    {isVerifying ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : isDeleting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        "Verify & Continue"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
};