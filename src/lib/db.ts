import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import type { D1Database } from "@cloudflare/workers-types";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export async function getPrisma(): Promise<PrismaClient> {
  // Try Cloudflare D1 first (works in production on Workers)
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as { DB?: D1Database }).DB;
    if (db) {
      const adapter = new PrismaD1(db);
      return new PrismaClient({ adapter });
    }
  } catch {
    // Not running on Cloudflare — fall through to SQLite
  }

  // Local development: use regular SQLite file
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}
