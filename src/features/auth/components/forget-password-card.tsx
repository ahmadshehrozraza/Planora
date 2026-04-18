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
import { emailSchema } from "../schemas";
import { useVerifyEmail } from "../api/use-verify-email";

export const ForgetPasswordCard = () => {

    const { mutate: verifyEmail, isPending } = useVerifyEmail();

    const form = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: "",
        }
    });

    const onSubmit = (values: z.infer<typeof emailSchema>) => {
        verifyEmail(values); 
    };

    return (
        <Card className="w-full h-full md:w-[487px] border-none shadow-none">
            <CardHeader className="flex items-center justify-center text-center p-7">
                <CardTitle className="text-2xl">
                    Reset Password
                </CardTitle>
            </CardHeader>

            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            type="email"
                                            placeholder="Enter email address"
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button 
                            type="submit"
                            size="lg" 
                            disabled={isPending}
                            className="w-full"
                        >
                            {isPending ? "Sending Link..." : "Send Reset Link"}
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