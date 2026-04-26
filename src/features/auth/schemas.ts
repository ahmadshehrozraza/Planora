import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1, "Required"),
});

export const registerSchema = z.object({
    name: z.string().trim().min(1, "Required"),
    email: z.string().email().toLowerCase(),
    password: z.string().min(8, "Minimum 8 characters"),
});

export const updateProfileSchema = z.object({
    name: z.string().min(1, "Name is required"),
    imageUrl: z.union([
        z.instanceof(File),
        z.string().transform((value) => value === "" ? undefined : value),
    ]).optional(),
});

export const passwordVerifySchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
});

export const emailSchema = z.object({
    email: z.string().email().toLowerCase(),
});

export const resetPasswordSchema = z.object({
    password: z.string().min(8, "Minimum 8 characters required"),
    confirmPassword: z.string().min(8, "Minimum 8 characters required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});