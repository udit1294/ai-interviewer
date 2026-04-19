/**
 * Prisma Client Singleton
 * 
 * Ensures only one instance of PrismaClient exists throughout the application
 * This prevents connection pool exhaustion in development with hot-reloading
 * 
 * Usage:
 * import { prisma } from '@/lib/prisma';
 * 
 * const user = await prisma.user.findUnique({ where: { email: 'user@example.com' } });
 */

import { PrismaClient } from '@prisma/client';

// Use globalThis to maintain a single instance across hot reloads in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export for use in API routes and server-side functions
export default prisma;
