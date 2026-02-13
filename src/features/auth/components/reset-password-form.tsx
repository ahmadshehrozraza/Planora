"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { resetPasswordSchema } from "@/features/auth/schemas";
import { useResetPassword } from "@/features/auth/api/use-reset-password";

interface ResetPasswordFormProps {
    userId: string;
    secret: string;
}

export const ResetPasswordForm = ({ userId, secret }: ResetPasswordFormProps) => {
    const { mutate: resetPassword, isPending } = useResetPassword();

    const form = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            userId,
            secret, 
            password: "",
            confirmPassword: "",
        }
    });

    const onSubmit = (values: z.infer<typeof resetPasswordSchema>) => {

        resetPassword({ json: values });
    };

    return (
        <Card className="w-full h-full md:w-[487px] border-none shadow-none">
            <CardHeader className="flex items-center justify-center text-center p-7">
                <CardTitle className="text-2xl">
                    Set New Password
                </CardTitle>
            </CardHeader>
            <div className="px-7">
                <Separator/>
            </div>
            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <input type="hidden" {...form.register("userId")} />
                        <input type="hidden" {...form.register("secret")} />

                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            type="password"
                                            placeholder="Enter new password"
                                        />
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
                                        <Input 
                                            {...field}
                                            type="password"
                                            placeholder="Confirm new password"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button 
                            size="lg" 
                            disabled={isPending} 
                            className="w-full"
                        >
                            {isPending ? "Resetting..." : "Reset Password"}
                        </Button>

                        <div className="text-center">
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

export default ResetPasswordForm;