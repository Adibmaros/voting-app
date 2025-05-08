import { Geist, Geist_Mono } from "next/font/google";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RootLayout({ children }) {
  const { session, user } = await getUser(); // Tambahkan await untuk fungsi async
  // console.log(session);
  // console.log(user);

  if (session) {
    return redirect("/"); // Tambahkan return setelah redirect
  }

  return <>{children}</>;
}
