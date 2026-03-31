import { PrismaClient } from "@prisma/client/edge";
import { PrismaD1 } from "@prisma/adapter-d1";
import type { D1Database } from "@cloudflare/workers-types";

let cachedPrisma: PrismaClient | undefined;

interface CloudflareContext {
  env: { DB?: D1Database };
}

export async function getPrisma(): Promise<PrismaClient> {
  if (cachedPrisma) return cachedPrisma;

  // Read Cloudflare context directly from the global symbol
  // (set by the OpenNext worker entrypoint in production)
  const ctx = (globalThis as Record<symbol, CloudflareContext | undefined>)[
    Symbol.for("__cloudflare-context__")
  ];

  if (ctx?.env?.DB) {
    const adapter = new PrismaD1(ctx.env.DB);
    return new PrismaClient({ adapter });
  }

  // Local development: use regular SQLite file
  // Need to use the standard client for local SQLite
  const { PrismaClient: LocalPrismaClient } = await import("@prisma/client");
  cachedPrisma = new LocalPrismaClient();
  return cachedPrisma;
}
