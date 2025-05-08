"use server";

import { redirect } from "next/navigation";
import { loginSchema, schemaSignUp } from "@/lib/schema";
import bcrypt from "bcrypt";
import { lucia, getUser } from "@/lib/auth";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function signIn(_, formData) {
  console.log(formData.get("email"));
  const validate = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validate.success) {
    return {
      message: "Invalid email or password",
    };
  }

  const existingAdmin = await prisma.user.findFirst({
    where: {
      email: validate.data.email,
      role: "VOTER",
    },
  });

  if (!existingAdmin) {
    return {
      message: "Invalid email or password",
    };
  }

  const validatePassword = bcrypt.compareSync(validate.data.password, existingAdmin.password);

  if (!validatePassword) {
    return {
      message: "Invalid email or password",
    };
  }

  const session = await lucia.createSession(existingAdmin.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  return redirect("/");
}

export async function signUp(_, formData) {
  const parse = schemaSignUp.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parse.success) {
    return {
      message: parse.error.errors[0].message,
    };
  }

  const hashedPassword = bcrypt.hashSync(parse.data.password, 12);

  try {
    await prisma.user.create({
      data: {
        email: parse.data.email,
        name: parse.data.name,
        password: hashedPassword,
        role: "VOTER",
      },
    });
  } catch (err) {
    console.log(err);
    return {
      message: "Failed to sign up",
    };
  }
  return redirect("/login");
}

export async function logout(_, formData) {
  const { session } = await getUser();

  if (!session) {
    return {
      error: "Unauthorized",
    };
  }
  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  return redirect("/");
}
