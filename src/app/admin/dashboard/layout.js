import { getUser } from "@/lib/auth";
import Navbar from "@/components/NavbarVoter";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const { session, user } = await getUser();

  // Redirect to login if not authenticated or not an admin
  if (!session || user.role !== "ADMIN") {
    console.log("Redirecting non-admin user:", user);
    return redirect("/admin/login");
  }

  return (
    <>
      <Navbar user={user} role="ADMIN" />
      <main className="mt-20 px-3 max-w-7xl mx-auto">{children}</main>
    </>
  );
}
