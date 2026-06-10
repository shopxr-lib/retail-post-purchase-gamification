import { requireAdminSession } from "@/lib/auth/session";
import { NewCampaignClient } from "./client";
export const dynamic = "force-dynamic";

export const metadata = { title: "New Campaign — Admin" };

export default async function NewCampaignPage() {
  await requireAdminSession();
  return <NewCampaignClient />;
}
