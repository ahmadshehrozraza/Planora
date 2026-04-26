"use server";

import { z } from "zod";
import { signIn } from "@/auth/auth";
import { AuthError } from "next-auth";
import { loginSchema } from "@/features/auth/schemas";

export async function loginUserAction(values: z.infer<typeof loginSchema>) {
    const validatedFields = loginSchema.safeParse(values);
    
    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    const { email, password } = validatedFields.data;

    try {
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        return { success: "Logged in successfully!" };
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid email or password" };
                default:
                    return { error: "Something went wrong" };
            }
        }
        throw error; 
    }
}