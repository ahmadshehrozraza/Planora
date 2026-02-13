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
import { Loader2 } from "lucide-react";

// Step 1: Verify password schema
const passwordVerifySchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
});

// Step 2: Set new password schema
const newPasswordSchema = z.object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

interface ChangePasswordFormProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

type FormStep = 'verify' | 'newPassword';

export const ChangePasswordForm = ({ 
    isOpen, 
    onClose 
}: ChangePasswordFormProps) => {
    const [currentStep, setCurrentStep] = useState<FormStep>('verify');
    const [isLoading, setIsLoading] = useState(false);
    const [verifiedPassword, setVerifiedPassword] = useState(false);

    // Password verification form
    const verifyForm = useForm<z.infer<typeof passwordVerifySchema>>({
        resolver: zodResolver(passwordVerifySchema),
        defaultValues: {
            currentPassword: "",
        },
    });

    // New password form
    const newPasswordForm = useForm<z.infer<typeof newPasswordSchema>>({
        resolver: zodResolver(newPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    // Step 1: Verify current password
    const onVerifySubmit = async (values: z.infer<typeof passwordVerifySchema>) => {
        setIsLoading(true);
        try {
            // Add your password verification API call here
            console.log("Verifying password:", values);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // If password is correct
            setVerifiedPassword(true);
            setCurrentStep('newPassword');
            toast.success("Password verified successfully");
        } catch (error) {
            toast.error("Invalid password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Set new password
    const onNewPasswordSubmit = async (values: z.infer<typeof newPasswordSchema>) => {
        setIsLoading(true);
        try {
            // Add your password change API call here
            console.log("Changing password:", values);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success("Password changed successfully");
            resetForms();
            onClose();
        } catch (error) {
            toast.error("Failed to change password");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForms = () => {
        setCurrentStep('verify');
        setVerifiedPassword(false);
        verifyForm.reset();
        newPasswordForm.reset();
        setIsLoading(false);
    };

    const handleClose = () => {
        resetForms();
        onClose();
    };

    const goBack = () => {
        if (currentStep === 'newPassword') {
            setCurrentStep('verify');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {currentStep === 'verify' && "Verify Your Identity"}
                        {currentStep === 'newPassword' && "Set New Password"}
                    </DialogTitle>
                </DialogHeader>

                {/* Step 1: Password Verification */}
                {currentStep === 'verify' && (
                    <Form {...verifyForm}>
                        <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-4">
                            <div className="text-sm text-gray-600">
                                <p>For security reasons, please verify your current password to continue.</p>
                            </div>

                            <FormField
                                control={verifyForm.control}
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
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        "Verify Password"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}

                {/* Step 2: Set New Password */}
                {currentStep === 'newPassword' && (
                    <Form {...newPasswordForm}>
                        <form onSubmit={newPasswordForm.handleSubmit(onNewPasswordSubmit)} className="space-y-4">
                            <div className="text-sm text-gray-600">
                                <p>Your password has been verified. Now set your new password.</p>
                            </div>

                            <FormField
                                control={newPasswordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="Enter new password"
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={newPasswordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="Confirm new password"
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-between gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={goBack}
                                    disabled={isLoading}
                                >
                                    Back
                                </Button>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleClose}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Changing...
                                            </>
                                        ) : (
                                            "Change Password"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
};