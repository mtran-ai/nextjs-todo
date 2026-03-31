import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { toogle, deleteTask, createComment, linkRepo } from '~/app/actions';
import { createMockTask, createMockComment } from '../fixtures';
import { mockPrismaClient } from '../mocks/prisma';
import { resetMockSession, setMockSessionNull } from '../mocks/auth';

// Mock next/cache before importing actions
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toogle', () => {
    afterEach(() => {
      resetMockSession();
    });

    it('should toggle task done state when user is authenticated', async () => {
      const mockTask = createMockTask({ id: 'task-1', done: false });

      (mockPrismaClient.task.update as any).mockResolvedValue({
        ...mockTask,
        done: true,
      });

      const result = await toogle({
        id: 'task-1',
        done: true,
      });

      expect(result).toEqual({ done: true });
      expect(mockPrismaClient.task.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: { done: true },
      });
    });

    it('should return session expired error when userId is missing', async () => {
      // Mock auth to return null session
      setMockSessionNull();

      const result = await toogle({
        id: 'task-1',
        done: true,
      });

      expect(result).toEqual({
        failure: 'Your session has expired. To use the app sign in again',
      });
      expect(mockPrismaClient.task.update).not.toHaveBeenCalled();
    });

    it('should return error message on database failure', async () => {
      (mockPrismaClient.task.update as any).mockRejectedValue(
        new Error('Database error')
      );

      const result = await toogle({
        id: 'task-1',
        done: true,
      });

      expect(result).toEqual({
        failure: 'Error occurred while toggling the done state!',
      });
    });
  });

  describe('deleteTask', () => {
    afterEach(() => {
      resetMockSession();
    });

    it('should delete a task when user is authenticated', async () => {
      (mockPrismaClient.task.delete as any).mockResolvedValue({
        id: 'task-1',
      });

      const result = await deleteTask({
        id: 'task-1',
      });

      expect(result).toEqual({ id: 'task-1' });
      expect(mockPrismaClient.task.delete).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        select: { id: true },
      });
    });

    it('should return session expired error when userId is missing', async () => {
      setMockSessionNull();

      const result = await deleteTask({
        id: 'task-1',
      });

      expect(result).toEqual({
        failure: 'Your session has expired. To use the app sign in again',
      });
      expect(mockPrismaClient.task.delete).not.toHaveBeenCalled();
    });

    it('should return error message on database failure', async () => {
      (mockPrismaClient.task.delete as any).mockRejectedValue(
        new Error('Delete failed')
      );

      const result = await deleteTask({
        id: 'task-1',
      });

      expect(result).toEqual({
        failure: 'Error occurred while deleting the task!',
      });
    });
  });

  describe('createComment', () => {
    afterEach(() => {
      resetMockSession();
    });

    it('should create a comment when user is authenticated', async () => {
      const mockComment = createMockComment({ id: 'comment-1' });

      (mockPrismaClient.comment.create as any).mockResolvedValue(mockComment);

      const result = await createComment({
        taskId: 'task-1',
        text: 'Great task!',
      });

      expect(result).toEqual(mockComment);
      expect(mockPrismaClient.comment.create).toHaveBeenCalledWith({
        data: {
          taskId: 'task-1',
          senderId: 'user-123',
          text: 'Great task!',
        },
      });
    });

    it('should return session expired error when userId is missing', async () => {
      setMockSessionNull();

      const result = await createComment({
        taskId: 'task-1',
        text: 'Great task!',
      });

      expect(result).toEqual({
        failure: 'Your session has expired. To use the app sign in again',
      });
      expect(mockPrismaClient.comment.create).not.toHaveBeenCalled();
    });

    it('should return error message on database failure', async () => {
      (mockPrismaClient.comment.create as any).mockRejectedValue(
        new Error('Create comment failed')
      );

      const result = await createComment({
        taskId: 'task-1',
        text: 'Great task!',
      });

      expect(result).toEqual({
        failure: 'Error occurred while creating the comment!',
      });
    });
  });

  describe('linkRepo', () => {
    afterEach(() => {
      resetMockSession();
    });

    it('should link a GitHub repo to a task when user is authenticated', async () => {
      const mockRepo = {
        id: 1,
        owner: 'testuser',
        repoName: 'repo-name',
        fullName: 'testuser/repo-name',
        taskId: 'task-1',
      };

      (mockPrismaClient.repo.upsert as any).mockResolvedValue(mockRepo);

      const result = await linkRepo({
        taskId: 'task-1',
        link: 'https://github.com/testuser/repo-name',
      });

      expect(result).toEqual(mockRepo);
      expect(mockPrismaClient.repo.upsert).toHaveBeenCalledWith({
        where: { taskId: 'task-1' },
        update: {
          repoName: 'repo-name',
          owner: 'testuser',
          fullName: 'testuser/repo-name',
        },
        create: {
          taskId: 'task-1',
          repoName: 'repo-name',
          owner: 'testuser',
          fullName: 'testuser/repo-name',
        },
      });
    });

    it('should return session expired error when userId is missing', async () => {
      setMockSessionNull();

      const result = await linkRepo({
        taskId: 'task-1',
        link: 'https://github.com/testuser/repo-name',
      });

      expect(result).toEqual({
        failure: 'Your session has expired. To use the app sign in again',
      });
      expect(mockPrismaClient.repo.upsert).not.toHaveBeenCalled();
    });

    it('should return error message on database failure', async () => {
      (mockPrismaClient.repo.upsert as any).mockRejectedValue(
        new Error('Repo already linked')
      );

      const result = await linkRepo({
        taskId: 'task-1',
        link: 'https://github.com/testuser/repo-name',
      });

      expect(result).toEqual({
        failure: 'Error occurred while linking the repo!',
      });
    });

    it('should reject invalid GitHub URL', async () => {
      const result = await linkRepo({
        taskId: 'task-1',
        link: 'https://invalid-url.com',
      });

      expect(result).toHaveProperty('failure');
      expect(mockPrismaClient.repo.upsert).not.toHaveBeenCalled();
    });
  });
});
