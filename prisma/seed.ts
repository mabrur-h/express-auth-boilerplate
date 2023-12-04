import { PrismaClient, type User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import logger from '../src/lib/logger';
import { HR } from '../src/utils/helper';
const myUUID = uuidv4(); // Generates a UUID

const prisma = new PrismaClient();
const seedUsers = async (): Promise<void> => {
  const fakeUsers = faker.helpers.uniqueArray<User>(
    () => ({
      id: faker.datatype.uuid(),
      email: faker.internet.email(),
      name: faker.name.firstName(),
      password: faker.internet.password(),
      googleId: faker.datatype.uuid() || myUUID,
      emailVerified: faker.datatype.boolean(),
      emailVerificationToken: faker.datatype.uuid(),
      emailTokenExpires: faker.date.future(),
      passwordResetToken: faker.datatype.uuid(),
      passwordResetExpires: faker.date.future(),
      requestCount: faker.datatype.number(),
      createdAt: faker.date.future(),
      updatedAt: faker.date.future(),
    }),
    3
  );
  const users = await prisma.user.createMany({ data: fakeUsers });
  logger.info(`
    \r${HR('white', '-', 30)}
    \rSeed completed for model: user
    \rcount: ${users.count}
    \r${HR('white', '-', 30)}
  `);
};

async function seed(): Promise<void> {
  await Promise.all([seedUsers()]);
}

async function main(): Promise<void> {
  let isError: boolean = false;
  try {
    await seed();
  } catch (e) {
    isError = true;
    logger.error(e);
  } finally {
    await prisma.$disconnect();
    process.exit(isError ? 1 : 0);
  }
}

void main();
