"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { sendPasswordResetEmail } from "@/lib/mail";

const resetSchema = z.object({
  email: z.string().email(),
});

export async function resetPasswordAction(values: z.infer<typeof resetSchema>) {
  const validatedFields = resetSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Invalid email" };

  const { email } = validatedFields.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
      return { error: "Email not found!" };
    }

    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000);

    await prisma.passwordResetToken.deleteMany({ where: { email } });
    await prisma.passwordResetToken.create({
      data: { email, token, expires },
    });

    await sendPasswordResetEmail(email, token);

    return { success: "Reset email sent! Please check your inbox." };
  } catch (error) {
    console.error("EMAIL_ERROR:", error);
    return { error: "Something went wrong" };
  }
}