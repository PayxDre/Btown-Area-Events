import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import type { D1Database } from "@cloudflare/workers-types";

let cachedPrisma: PrismaClient | undefined;

export async function getPrisma(): Promise<PrismaClient> {
  if (cachedPrisma) return cachedPrisma;

  // Try Cloudflare D1 via multiple methods
  // Method 1: @opennextjs/cloudflare context
  try {
    const mod = await import("@opennextjs/cloudflare");
    if (mod.getCloudflareContext) {
      const ctx = await mod.getCloudflareContext({ async: true });
      const db = (ctx.env as { DB?: D1Database }).DB;
      if (db) {
        const adapter = new PrismaD1(db);
        return new PrismaClient({ adapter });
      }
    }
  } catch (e) {
    console.log("D1 method 1 (opennextjs) failed:", e);
  }

  // Method 2: cloudflare:workers module (newer Workers)
  try {
    const { env } = await import("cloudflare:workers" as string);
    const db = (env as { DB?: D1Database }).DB;
    if (db) {
      const adapter = new PrismaD1(db);
      return new PrismaClient({ adapter });
    }
  } catch (e) {
    console.log("D1 method 2 (cloudflare:workers) failed:", e);
  }

  // Method 3: Check globalThis for env bindings
  try {
    const globalEnv = (globalThis as unknown as { __env__?: { DB?: D1Database } }).__env__;
    if (globalEnv?.DB) {
      const adapter = new PrismaD1(globalEnv.DB);
      return new PrismaClient({ adapter });
    }
  } catch (e) {
    console.log("D1 method 3 (globalThis) failed:", e);
  }

  // Fallback: local SQLite for development
  cachedPrisma = new PrismaClient();
  return cachedPrisma;
}
