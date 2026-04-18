"use server";

import { z } from "zod";
import { signIn } from "@/auth/auth"; // NextAuth ka function import kiya
import { AuthError } from "next-auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

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