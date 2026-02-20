"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
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
import { registerSchema } from "../schemas";
import { useRegister } from "../api/use-register";
import { signUpWithGithub, signUpWithGoogle } from "@/lib/oauth";




export const SignUpCard = () => {

    const { mutate, isPending } = useRegister();

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })

    const onSubmit = (values: z.infer<typeof registerSchema>) => {
        // mutate({ json: values });
    }

    return (
        <Card className="w-full h-full md:w-[487px]">
            <CardHeader className="flex items-center justify-center text-center p-7">
                <CardTitle className="text-2xl">
                    Sign Up
                </CardTitle>
                <CardDescription>
                    By Signing up, you agree to our {" "}
                    <Link href="/privacy">
                        <span className="text-blue-700">Privacy Policy</span>
                    </Link>
                    and{" "}
                    <Link href="/terms" prefetch>
                        <span className="text-blue-700">Terms of Services</span>
                    </Link>
                </CardDescription>
            </CardHeader>
            <div className="px-7">
                <Separator />
            </div>
            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            name="name"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="Enter your name"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                        >
                            Register
                        </Button>

                        <Button
                            onClick={() => signUpWithGoogle()}
                            size="lg"
                            disabled={isPending}
                            className="w-full"
                            variant="secondary"
                        >
                            <FcGoogle className="mr-2 size-5" />
                            Login with Google
                        </Button>

                        <Button
                            onClick={() => signUpWithGithub()}
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

            <CardContent className="p-7 flex items-center justify-center">
                <p>
                    Already have an account?
                    <Link href="/sign-in">
                        <span className="text-blue-700">&nbsp;Sign In</span>
                    </Link>
                </p>

            </CardContent>
        </Card>
    )
}