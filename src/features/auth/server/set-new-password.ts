"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { resetPasswordSchema } from "../schemas";


export async function setNewPasswordAction(
  values: z.infer<typeof resetPasswordSchema>,
  token: string | null
) {
  if (!token) return { error: "Missing token!" };

  const validatedFields = resetPasswordSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Invalid fields!" };

  const { password } = validatedFields.data;

  try {
    const existingToken = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!existingToken) return { error: "Invalid or expired token!" };

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) return { error: "Token has expired!" };

    const existingUser = await prisma.user.findUnique({ where: { email: existingToken.email } });
    if (!existingUser) return { error: "Email does not exist!" };

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({ where: { id: existingToken.id } });

    return { success: "Password updated successfully!" };
  } catch (error) {
    return { error: "Something went wrong" };
  }
}