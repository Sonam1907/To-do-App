"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";

export async function signup(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = formData.get("password") as string | null;
  const name = (formData.get("name") as string | null)?.trim();

  if (!email || !password) {
    return redirect("/signup?error=missing_fields");
  }

  if (password.length < 8) {
    return redirect("/signup?error=weak_password");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return redirect("/signup?error=email_taken");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { email, passwordHash, name: name || null },
  });

  await signIn("credentials", { email, password, redirectTo: "/" });
}
