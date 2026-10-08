import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// We create a getter function so we can catch environment variable errors gracefully
// and prevent module-initialization crashes in Next.js Server Components
export const getPrisma = () => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  
  try {
    let url = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;
    
    // If it's a Vercel Postgres URL or Supabase and doesn't have pgbouncer=true, we should probably add it
    // But Vercel's POSTGRES_PRISMA_URL already has it.
    // Let's just pass the URL we found to PrismaClient.
    
    const client = new PrismaClient(url ? {
      datasources: {
        db: {
          url: url
        }
      }
    } : undefined);
    
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;
    return client;
  } catch (error) {
    console.error("PrismaClient initialization failed:", error);
    // Return a dummy object that throws on use, so error.tsx can catch it!
    return new Proxy({}, {
      get: (target, prop) => {
        throw new Error(`Prisma Initialization Error: ${error}`);
      }
    }) as PrismaClient;
  }
};

// Export a proxy so we don't have to rewrite all imports
export const prisma = new Proxy({}, {
  get: (target, prop) => {
    return getPrisma()[prop as keyof PrismaClient];
  }
}) as PrismaClient;
