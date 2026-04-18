"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { useResetPassword } from "../api/use-reset-password";
import { resetPasswordSchema } from "../schemas";

interface ResetPasswordFormProps {
    token: string;
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
    const { mutate: setNewPassword, isPending } = useResetPassword();

    const form = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        }
    });

    const onSubmit = (values: z.infer<typeof resetPasswordSchema>) => {
        setNewPassword({ values, token }); 
    };

    return (
        <Card className="w-full h-full md:w-[487px] border-none shadow-none">
            <CardHeader className="flex items-center justify-center text-center p-7">
                <CardTitle className="text-2xl">Set New Password</CardTitle>
            </CardHeader>
            <div className="px-7"><Separator/></div>
            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} type="password" placeholder="Enter new password" disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="confirmPassword"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} type="password" placeholder="Confirm new password" disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" size="lg" disabled={isPending} className="w-full">
                            {isPending ? "Resetting..." : "Reset Password"}
                        </Button>
                        <div className="text-center mt-4">
                            <Link href="/sign-in" className="text-sm text-blue-600 hover:underline">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};