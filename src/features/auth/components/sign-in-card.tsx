"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
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
import { loginSchema } from "../schemas";
import { useLogin } from "../api/use-login";
import { signIn } from "next-auth/react";

export const SignInCard = () => {

    const { mutate, isPending } = useLogin();

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })

    const onSubmit = (values: z.infer<typeof loginSchema>) => {
        mutate(values); 
    }


    return (
        <Card className="w-full h-full md:w-[487px]">
            <CardHeader className="flex items-center justify-center text-center p-7">
                <CardTitle className="text-2xl">
                    Welcome back!
                </CardTitle>
            </CardHeader>
            <div className="px-7">
                <Separator />
            </div>
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
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="password"
                                            placeholder="Enter password"
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
                            type="submit"
                        >
                            Login
                        </Button>

                        <p className=" flex justify-end">
                            <Link href="/forget-password">
                                <span className=" text-blue-700">&nbsp;Forget Password?</span>
                            </Link>
                        </p>

                        <Button
                            type="button"
                            onClick={() => signIn("google", { callbackUrl: "/" })}
                            size="lg"
                            disabled={isPending}
                            className="w-full"
                            variant="secondary"
                            
                        >
                            <FcGoogle className="mr-2 size-5" />
                            Login with Google
                        </Button>

                        <Button
                            type="button"
                            onClick={() => signIn("github", { callbackUrl: "/" })}
                            size="lg"
                            disabled={isPending}
                            className="w-full"
                            variant="secondary"
                        >
                            <FaGithub className="mr-2 size-5" />
                            Login with GitHub
                        </Button>
                    </form>
                </Form>
            </CardContent>

            <div className="px-7">
                <Separator />
            </div>

            <CardContent className="p-7 flex items-center justify-center flex-col">

                <p>
                    Don&apos;t have an account?
                    <Link href="/sign-up">
                        <span className="text-blue-700">&nbsp;Sign Up</span>
                    </Link>
                </p>

            </CardContent>
        </Card>
    )
}