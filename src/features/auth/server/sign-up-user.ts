"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/features/auth/schemas";

export async function registerUserAction(values: z.infer<typeof registerSchema>) {
  const validatedFields = registerSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { error: "Email already exists" };

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return { success: "Account created successfully! Please sign in." };
    
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong" };
  }
}