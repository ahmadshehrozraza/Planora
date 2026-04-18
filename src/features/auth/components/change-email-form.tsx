// components/change-email-form.tsx
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
import { PageLoader } from "@/components/page-loader";

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
});

const emailSchema = z.object({
    newEmail: z.string().email("Invalid email address"),
});

const otpSchema = z.object({
    otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

interface ChangeEmailFormProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

type FormStep = 'password' | 'email' | 'otp';

export const ChangeEmailForm = ({ 
    isOpen, 
    onClose, 
    user, 
}: ChangeEmailFormProps) => {
    const [currentStep, setCurrentStep] = useState<FormStep>('password');
    const [isLoading, setIsLoading] = useState(false);
    const [verifiedPassword, setVerifiedPassword] = useState(false);
    const [newEmail, setNewEmail] = useState("");

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
        },
    });

    const emailForm = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            newEmail: "",
        },
    });

    const otpForm = useForm<z.infer<typeof otpSchema>>({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            otp: "",
        },
    });

    const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
        setIsLoading(true);
        try {
            console.log("Verifying password:", values);

            setVerifiedPassword(true);
            setCurrentStep('email');
            toast.success("Password verified successfully");
        } catch (error) {
            toast.error("Invalid password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const onEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
        setIsLoading(true);
        try {
            console.log("Sending OTP to:", values.newEmail);
            
            // Simulate API call
           
            
            setNewEmail(values.newEmail);
            setCurrentStep('otp');
            toast.success(`OTP sent to ${values.newEmail}`);
        } catch (error) {
            toast.error("Failed to send OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const onOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
        setIsLoading(true);
        try {
            console.log("Verifying OTP and changing email:", { newEmail, otp: values.otp });
            toast.success("Email changed successfully");
            resetForms();
            onClose();
        } catch (error) {
            toast.error("Invalid OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForms = () => {
        setCurrentStep('password');
        setVerifiedPassword(false);
        setNewEmail("");
        passwordForm.reset();
        emailForm.reset();
        otpForm.reset();
        setIsLoading(false);
    };

    const handleClose = () => {
        resetForms();
        onClose();
    };

    const goBack = () => {
        if (currentStep === 'otp') {
            setCurrentStep('email');
        } else if (currentStep === 'email') {
            setCurrentStep('password');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {currentStep === 'password' && "Verify Your Identity"}
                        {currentStep === 'email' && "Enter New Email"}
                        {currentStep === 'otp' && "Verify OTP"}
                    </DialogTitle>
                </DialogHeader>

                {currentStep === 'password' && (
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                            <div className="text-sm text-gray-600">
                                <p>For security reasons, please verify your password to continue.</p>
                            </div>

                            <FormField
                                control={passwordForm.control}
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
                                            <PageLoader />
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

                {currentStep === 'email' && (
                    <Form {...emailForm}>
                        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                            <div className="text-sm text-gray-600">
                                <p>Current email: <strong>{user.email}</strong></p>
                                <p className="mt-2">Enter your new email address. We'll send a verification code.</p>
                            </div>

                            <FormField
                                control={emailForm.control}
                                name="newEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Email Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="Enter new email address"
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
                                                <PageLoader />
                                                Sending...
                                            </>
                                        ) : (
                                            "Send OTP"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                )}

                {currentStep === 'otp' && (
                    <Form {...otpForm}>
                        <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                            <div className="text-sm text-gray-600">
                                <p>We sent a 6-digit verification code to:</p>
                                <p className="font-semibold">{newEmail}</p>
                                <p className="mt-2">Enter the code below to verify your new email address.</p>
                            </div>

                            <FormField
                                control={otpForm.control}
                                name="otp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Verification Code</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter 6-digit code"
                                                maxLength={6}
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
                                                <PageLoader />
                                                Verifying...
                                            </>
                                        ) : (
                                            "Verify & Change"
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