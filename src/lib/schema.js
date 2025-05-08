import { z } from "zod";

export const loginSchema = z.object({
  email: z.string({ required_error: "email is required" }).email({ message: "email is not valid" }),
  password: z.string({ required_error: "password is required" }).min(5, { message: "password should be at least 5 characters" }),
});

export const schemaSignUp = loginSchema.extend({
  name: z.string({ required_error: "name is required" }).min(4, { message: "name length must be at least 4 characters" }),
});
