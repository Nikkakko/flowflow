"use server";
import db from "@/lib/db/db";
import { z } from "zod";
import { cookies } from "next/headers";
import { comparePasswords, hashPassword, setSession } from "@/lib/auth/session";
import { authSchema } from "@/lib/validation";
import { redirect } from "next/navigation";

export const signIn = async (values: z.infer<typeof authSchema>) => {
  const validateValues = authSchema.safeParse(values);
  if (!validateValues.success) {
    return {
      error: validateValues.error.errors[0].message,
    };
  }

  const user = await db.user.findFirst({
    where: {
      email: validateValues.data.email,
    },
  });

  if (!user) {
    return {
      error: "არასწორი ელ. ფოსტა ან პაროლი. სცადეთ თავიდან.",
    };
  }

  const isPasswordValid = await comparePasswords(
    validateValues.data.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: "არასწორი ელ. ფოსტა ან პაროლი. სცადეთ თავიდან.",
    };
  }

  await setSession(user);

  redirect("/");
};

export const signUp = async (values: z.infer<typeof authSchema>) => {
  const validateValues = authSchema.safeParse(values);
  if (!validateValues.success) {
    return {
      error: validateValues.error.errors[0].message,
    };
  }

  const existingUser = await db.user.findFirst({
    where: {
      email: validateValues.data.email,
    },
  });

  if (existingUser) {
    return { error: "მომხმარებელი უკვე არსებობს" };
  }

  const passwordHash = await hashPassword(validateValues.data.password);
  const user = await db.user.create({
    data: {
      email: validateValues.data.email,
      passwordHash,
      name: "New User",
    },
  });

  await setSession(user);

  redirect("/");
};

export const signOut = async () => {
  cookies().delete("session");

  return { success: "Signed out successfully" };
};
