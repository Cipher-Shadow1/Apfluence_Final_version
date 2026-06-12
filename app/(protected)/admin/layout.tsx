import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth/api-user";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import MobileBlocker from "@/components/brand/MobileBlocker";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    redirect("/sign-in/admin");
  }

  if (
    !(await isAdminUser(
      user.id,
      (user.user_metadata as Record<string, any>) ?? null,
    ))
  ) {
    redirect("/brand");
  }

  return (
    <>
      <MobileBlocker />
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <AdminSidebar />
        <div className="relative flex min-w-0 flex-1 flex-col overflow-y-auto pl-14">
          {children}
        </div>
      </div>
    </>
  );
}
