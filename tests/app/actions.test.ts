import { describe, it, expect, beforeEach, vi } from 'vitest';
import { toogle, deleteTask, createComment, linkRepo } from '~/app/actions';
import { createMockTask, createMockUser, createMockComment } from '../fixtures';
import { mockPrismaClient } from '../mocks/prisma';

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Server Actions', () => {
  describe('toogle', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should toggle task done state when user is authenticated', async () => {
      const mockTask = createMockTask({ id: 'task-1', done: false });

      (mockPrismaClient.task.update as any).mockResolvedValue({
        ...mockTask,
        done: true,
      });

      const result = await toogle(
        { id: 'task-1', done: true },
        { userId: 'user-123' }
      );

      expect(result).toEqual({ done: true });
      expect(mockPrismaClient.task.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: { done: true },
      });
    });

    it('should return session expired error when userId is missing', async () => {
      const result = await toogle(
        { id: 'task-1', done: true },
        { userId: null }
      );

      expect(result).toEqual({
        failure: 'Your session has expired. To use the app sign in again',
      });
      expect(mockPrismaClient.task.update).not.toHaveBeenCalled();
    });

    it('should return error message on database failure', async () => {
      (mockPrismaClient.task.update as any).mockRejectedValue(
        new Error('Database error')
      );

      const result = await toogle(
        { id: 'task-1', done: true },
        { userId: 'user-123' }
      );

      expect(result).toEqual({
        failure: 'Error occurred while toggling the done state!',
      });
    });
  });

  describe('deleteTask', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should delete a task when user is authenticated', async () => {
      const mockTask = createMockTask({ id: 'task-1' });

      (mockPrismaClient.task.delete as any).mockResolvedValue({
        id: 'task-1',
      });

      const result = await deleteTask(
        { id: 'task-1' },
        { userId: 'user-123' }
      );

      expect(result).toEqual({ id: 'task-1' });
      expect(mockPrismaClient.task.delete).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        select: { id: true },
      });
    });

    it('should return session expired error when userId is missing', async () => {
      const result = await deleteTask(
        { id: 'task-1' },
        { userId: null }
      );

      expect(result).toEqual({
        failure: 'Your session has expired. To use the app sign in again',
      });
      expect(mockPrismaClient.task.delete).not.toHaveBeenCalled();
    });

    it('should return error message on database failure', async () => {
      (mockPrismaClient.task.delete as any).mockRejectedValue(
        new Error('Delete failed')
      );

      const result = await deleteTask(
        { id: 'task-1' },
        { userId: 'user-123' }
      );

      expect(result).toEqual({
        failure: 'Error occurred while deleting the task!',
      });
    });
  });

  describe('createComment', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should create a comment when user is authenticated', async () => {
      const mockComment = createMockComment({ id: 'comment-1' });

      (mockPrismaClient.comment.create as any).mockResolvedValue(mockComment);

      const result = await createComment(
        { taskId: 'task-1', text: 'Great task!' },
        { userId: 'user-123' }
      );

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
      const result = await createComment(
        { taskId: 'task-1', text: 'Great task!' },
        { userId: null }
      );

      expect(result).toEqual({
        failure: 'Your session has expired. To use the app sign in again',
      });
      expect(mockPrismaClient.comment.create).not.toHaveBeenCalled();
    });

    it('should return error message on database failure', async () => {
      (mockPrismaClient.comment.create as any).mockRejectedValue(
        new Error('Create comment failed')
      );

      const result = await createComment(
        { taskId: 'task-1', text: 'Great task!' },
        { userId: 'user-123' }
      );

      expect(result).toEqual({
        failure: 'Error occurred while creating the comment!',
      });
    });

    it('should reject empty comment text', async () => {
      const result = await createComment(
        { taskId: 'task-1', text: '' },
        { userId: 'user-123' }
      );

      expect(result).toEqual({ failure: expect.any(String) });
    });
  });

  describe('linkRepo', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should link a GitHub repo to a task when user is authenticated', async () => {
      const mockRepo = {
        id: 1,
        owner: 'testuser',
        repoName: 'repo-name',
        fullName: 'testuser/repo-name',
        taskId: 'task-1',
      };

      (mockPrismaClient.repo.create as any).mockResolvedValue(mockRepo);

      const result = await linkRepo(
        {
          taskId: 'task-1',
          owner: 'testuser',
          repo: 'repo-name',
        },
        { userId: 'user-123' }
      );

      expect(result).toEqual(mockRepo);
      expect(mockPrismaClient.repo.create).toHaveBeenCalledWith({
        data: {
          taskId: 'task-1',
          owner: 'testuser',
          repoName: 'repo-name',
          fullName: 'testuser/repo-name',
        },
      });
    });

    it('should return session expired error when userId is missing', async () => {
      const result = await linkRepo(
        {
          taskId: 'task-1',
          owner: 'testuser',
          repo: 'repo-name',
        },
        { userId: null }
      );

      expect(result).toEqual({
        failure: 'Your session has expired. To use the app sign in again',
      });
      expect(mockPrismaClient.repo.create).not.toHaveBeenCalled();
    });

    it('should return error message on database failure', async () => {
      (mockPrismaClient.repo.create as any).mockRejectedValue(
        new Error('Repo already linked')
      );

      const result = await linkRepo(
        {
          taskId: 'task-1',
          owner: 'testuser',
          repo: 'repo-name',
        },
        { userId: 'user-123' }
      );

      expect(result).toEqual({
        failure: 'Error occurred while linking the repo!',
      });
    });
  });
});
