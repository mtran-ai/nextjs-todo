import type { User, Task, Comment } from '@prisma/client';

export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'user-123',
    username: 'testuser',
    password: 'hashed-password-hash',
    ...overrides,
  };
}

export function createMockTask(
  overrides?: Partial<Task>
): Task {
  return {
    id: 'task-123',
    title: 'Test Task',
    description: 'Test task description',
    done: false,
    due: null,
    createdAt: new Date('2026-01-01'),
    authorId: 'user-123',
    ...overrides,
  };
}

export function createMockComment(
  overrides?: Partial<Comment>
): Comment {
  return {
    id: 'comment-123',
    text: 'Test comment',
    createdAt: new Date('2026-01-01'),
    senderId: 'user-123',
    taskId: 'task-123',
    ...overrides,
  };
}

export function createMockSession(userId: string = 'user-123') {
  return {
    user: {
      id: userId,
      username: 'testuser',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}
