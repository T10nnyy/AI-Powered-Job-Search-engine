import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import DashboardContent from "@/components/dashboard-content";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return <DashboardContent user={user} />;
}
