import { getUnifiedSession } from "@/lib/auth/session";
import { CustomerShell } from "@/components/customer/CustomerShell";
import { AdminShell } from "@/components/shared/AdminShell";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const session = await getUnifiedSession();

  if (session?.type === "admin") {
    return (
      <AdminShell user={{ name: session.name, email: session.email }}>
        {children}
      </AdminShell>
    );
  }

  return (
    <CustomerShell user={session ? { name: session.name, totalCredits: session.totalCredits ?? 0 } : null}>
      {children}
    </CustomerShell>
  );
}
