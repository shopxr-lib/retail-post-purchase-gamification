"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/auth/admin-auth";
import { toNextJsHandler } from "better-auth/next-js";

export async function signOutAdmin() {
  const cookieStore = await cookies();
  // Delete the Better Auth admin session cookie
  cookieStore.delete("gamify-admin.session_token");
  cookieStore.delete("better-auth.session_token");
  redirect("/login");
}
