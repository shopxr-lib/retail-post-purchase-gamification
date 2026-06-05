import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db/prisma";

export const adminAuth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  advanced: {
    cookiePrefix: "gamify-admin",
    generateId: false,
  },
  session: {
    fields: {
      userId: "staffId",
    },
    modelName: "StaffSession", 
    expiresIn: 60 * 60 * 8, // 8 hours
    updateAge: 60 * 60, // refresh session every hour
  },
  user: {
    modelName: "Staff",
  },
  account: {
    modelName: "StaffAccount",
    fields: {
      userId: "staffId",
    }
  },
  verification: {
    modelName: "StaffVerification",
  },
});

export type AdminAuth = typeof adminAuth;
