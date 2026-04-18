"use server";

import { signOut } from "@/auth/auth";

export async function logoutUserAction() {
  await signOut({ redirectTo: "/sign-in" }); 
}