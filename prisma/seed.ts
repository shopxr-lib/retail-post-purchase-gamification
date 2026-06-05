import { PrismaClient, ProbabilityMode } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database…");

  // ── Stores ─────────────────────────────────────────────────────────────────
  const [store1, store2, store3] = await Promise.all([
    db.retailStore.create({
      data: {
        name: "Store 1",
        address: "Lot G-12, Pavilion KL",
      },
    }),
    db.retailStore.create({
      data: {
        name: "Store 2",
      },
    }),
    db.retailStore.create({
      data: { name: "Store 3" },
    }),
  ]);
  console.log("✅ Stores:", store1.name, store2.name, store3.name);

  // ── Admin ──────────────────────────────────────────────────────────────────
  const adminEmail = "admin@shopxr.org";
  const adminPassword = "admin123";
  const adminHash = await hashPassword(adminPassword);
  const admin = await db.staff.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Super Admin",
      email: adminEmail,
      storeId: store1.id,
      emailVerified: true,
      accounts: {
        create: { accountId: adminEmail, providerId: "credential", password: adminHash },
      },
    },
  });
  console.log("✅ Admin:", admin.email);

  // ── Campaign (currently active) ────────────────────────────────────────────
  const campaign = await db.campaign.create({
    data: {
      name: "Summer 2026 Rewards",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      status: 1,
      creditsPerUnit: 100, // $100 = 1 credit
      gameType: 1,
      prizes: {
        create: [
          {
            name: "RM500 Grand Prize Voucher",
            type: 1,
            value: "GRAND500",
            winningProbabilityMode: ProbabilityMode.PERCENTAGE,
            winningProbabilityValue: 5,
          },
          {
            name: "Free Tote Bag",
            type: 2,
            value: "Designer Tote Bag",
            winningProbabilityMode: ProbabilityMode.PERCENTAGE,
            winningProbabilityValue: 15,
          },
          {
            name: "Jackpot on 50th Play",
            type: 3,
            value: "RM200 Shopping Spree",
            winningProbabilityMode: ProbabilityMode.CREDIT_COUNT,
            winningProbabilityValue: 50,
          },
          {
            name: "Better Luck Next Time",
            type: 4,
            value: null,
            winningProbabilityMode: ProbabilityMode.PERCENTAGE,
            winningProbabilityValue: 80,
          },
        ],
      },
    },
  });
  console.log("✅ Campaign:", campaign.name);

  // ── Dummy Customers ────────────────────────────────────────────────────────
  const customers = await Promise.all(
    [{ name: "Customer 1", email: "info@shopxr.org", phone: "+60112345001" }].map((c) =>
      db.customer.upsert({
        where: { email: c.email },
        update: {},
        create: { ...c, emailVerified: true, isActive: true },
      })
    )
  );
  console.log("✅ Customers:", customers.map((c) => c.name).join(", "));

  // ── Dummy QR codes + Orders + Credits ─────────────────────────────────────
  const stores = [store1, store2, store3];
  for (const customer of customers) {
    const numOrders = 2 + Math.floor(Math.random() * 4); // 2-5 orders each
    let totalCredits = 0;
    let totalSpent = 0;

    for (let i = 0; i < numOrders; i++) {
      const store = stores[i % stores.length];
      const amountPaid = 200 + Math.floor(Math.random() * 800); // $200-$1000
      const creditsGranted = Math.floor(amountPaid / campaign.creditsPerUnit);
      totalCredits += creditsGranted;
      totalSpent += amountPaid;

      const qr = await db.qRCode.create({
        data: {
          campaignId: campaign.id,
          generatedById: admin.id,
          amountPaid,
          receiptNumber: `INV-${Date.now()}-${i}`,
          creditsGranted,
          status: "REDEEMED",
          redeemedById: customer.id,
          redeemedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });

      const order = await db.order.create({
        data: {
          customerId: customer.id,
          qrCodeId: qr.id,
        },
      });

      await db.creditTransaction.create({
        data: {
          customerId: customer.id,
          orderId: order.id,
          type: "EARNED_QR",
          amount: creditsGranted,
          balanceBefore: totalCredits - creditsGranted,
          balanceAfter: totalCredits,
          description: `Order at ${store.name}`,
        },
      });
    }

    // Simulate some game plays
    const numPlays = Math.floor(Math.random() * 3); // 0-2 plays
    for (let j = 0; j < numPlays && totalCredits > 0; j++) {
      const creditCost = 1;
      const gamePlay = await db.gamePlay.create({
        data: {
          customerId: customer.id,
          campaignId: campaign.id,
          gameType: 1,
          creditCost,
          status: "COMPLETED",
          completedAt: new Date(),
          result: { won: false, prizeName: null },
        },
      });

      await db.creditTransaction.create({
        data: {
          customerId: customer.id,
          gamePlayId: gamePlay.id,
          type: "SPENT_GAME",
          amount: -creditCost,
          balanceBefore: totalCredits,
          balanceAfter: totalCredits - creditCost,
          description: "Played Treasure Box",
        },
      });

      totalCredits -= creditCost;
    }

    // Update customer totals
    await db.customer.update({
      where: { id: customer.id },
      data: { totalCredits, totalSpent },
    });
  }
  console.log("✅ Dummy orders, QRs, and game plays created");

  console.log("\n🎉 Seed complete!\n");
  console.log(`Admin:    ${adminEmail}  /  ${adminPassword}`);
  console.log("Customer: info@shopxr.org  (OTP to email)");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
