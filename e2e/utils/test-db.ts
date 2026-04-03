// Import with absolute path to support Playwright global setup
// Using dynamic import for ES module compatibility
const prismaPromise = import('@prisma/client').then(
  m => m.PrismaClient
);

let prisma: any;

export async function getPrismaClient() {
  if (!prisma) {
    const PrismaClient = await prismaPromise;
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  }
  return prisma;
}

export async function resetDatabase() {
  const prisma = await getPrismaClient();

  // Delete in order of dependencies
  await prisma.comment.deleteMany({});
  await prisma.repo.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});
}

export async function closeDatabase() {
  if (prisma) {
    await prisma.$disconnect();
  }
}

export async function seedTestUser(data: {
  username: string;
  password: string;
}) {
  const prisma = await getPrismaClient();
  const bcrypt = await import('bcrypt');

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword
    }
  });
}

export async function seedTestTask(data: {
  authorId: string;
  title: string;
  description?: string;
  due?: Date;
  done?: boolean;
}) {
  const prisma = await getPrismaClient();

  return prisma.task.create({
    data: {
      authorId: data.authorId,
      title: data.title,
      description: data.description,
      due: data.due,
      done: data.done ?? false
    }
  });
}
