import { test as base } from '@playwright/test';
import { seedTestUser, seedTestTask, getPrismaClient } from '../utils/test-db';

type DbFixtures = {
  userWithTasks: {
    username: string;
    password: string;
    id: string;
    taskIds: string[];
  };
};

export const test = base.extend<DbFixtures>({
  userWithTasks: async ({}, use) => {
    const prisma = await getPrismaClient();
    const username = `dbuser_${Date.now()}`;
    const password = 'TestPassword123!';

    // Create user
    const user = await seedTestUser({ username, password });

    // Create sample tasks
    const task1 = await seedTestTask({
      authorId: user.id,
      title: 'Buy groceries',
      description: 'Milk, eggs, bread',
      done: false
    });

    const task2 = await seedTestTask({
      authorId: user.id,
      title: 'Complete project',
      description: 'Finish the e2e tests',
      done: false
    });

    const userWithTasks = {
      username,
      password,
      id: user.id,
      taskIds: [task1.id, task2.id]
    };

    await use(userWithTasks);
  }
});

export { expect } from '@playwright/test';
