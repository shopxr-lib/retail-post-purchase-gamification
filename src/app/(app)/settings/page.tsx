import { requireAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db/prisma";

export const metadata = { title: "Settings — Admin" };

export default async function SettingsPage() {
  await requireAdminSession();

  const stores = await db.retailStore.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* Stores — read-only list, managed via seed */}
      <div className="bg-white rounded-xl border border-border p-5 shadow-card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-semibold text-foreground">Retail Stores</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Stores are managed via the seed file. Contact a developer to add or modify stores.
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{stores.length} stores</span>
        </div>
        {stores.length === 0 ? (
          <p className="text-sm text-muted-foreground">No stores found. Run the seed script.</p>
        ) : (
          <ul className="divide-y divide-border">
            {stores.map((store) => (
              <li key={store.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-foreground">{store.name}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
