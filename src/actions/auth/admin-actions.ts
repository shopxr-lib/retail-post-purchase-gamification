"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOutAdmin() {
  const cookieStore = await cookies();
  // Delete the Better Auth admin session cookie
  cookieStore.delete("gamify-admin.session_token");
  cookieStore.delete("better-auth.session_token");
  redirect("/login/admin");
}
