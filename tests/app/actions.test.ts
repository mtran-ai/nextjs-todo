import { describe, it, expect, beforeEach, vi } from 'vitest';
import { toogle, deleteTask } from '~/app/actions';
import { createMockTask, createMockUser } from '../fixtures';
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
});
