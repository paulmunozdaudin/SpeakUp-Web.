import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { AdminProToggle } from "@/components/admin/admin-pro-toggle";
import { ReferralsLookup } from "@/components/admin/referrals-lookup";

export const metadata = {
  title: "Admin",
};

// Security-sensitive gate — never let this get statically cached.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

  if (!isAdminEmail(user?.email)) {
    redirect("/");
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
      <div className="flex flex-wrap gap-6">
        <AdminProToggle />
        <ReferralsLookup />
      </div>
    </div>
  );
}
