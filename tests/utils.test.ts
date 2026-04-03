import { describe, it, expect } from 'vitest';
import { createMockTask, createMockUser, createMockComment, createMockSession } from './fixtures';

describe('Test Fixtures', () => {
  describe('createMockUser', () => {
    it('should create a user with default values', () => {
      const user = createMockUser();
      expect(user.id).toBe('user-123');
      expect(user.username).toBe('testuser');
    });

    it('should allow overriding properties', () => {
      const user = createMockUser({ username: 'customuser' });
      expect(user.username).toBe('customuser');
      expect(user.id).toBe('user-123');
    });
  });

  describe('createMockTask', () => {
    it('should create a task with default values', () => {
      const task = createMockTask();
      expect(task.id).toBe('task-123');
      expect(task.title).toBe('Test Task');
      expect(task.done).toBe(false);
    });

    it('should allow overriding properties', () => {
      const task = createMockTask({ done: true, title: 'Completed' });
      expect(task.done).toBe(true);
      expect(task.title).toBe('Completed');
    });
  });

  describe('createMockComment', () => {
    it('should create a comment with default values', () => {
      const comment = createMockComment();
      expect(comment.id).toBe('comment-123');
      expect(comment.text).toBe('Test comment');
    });

    it('should allow overriding properties', () => {
      const comment = createMockComment({ text: 'Custom comment' });
      expect(comment.text).toBe('Custom comment');
    });
  });

  describe('createMockSession', () => {
    it('should create a session with default values', () => {
      const session = createMockSession();
      expect(session.user.id).toBe('user-123');
      expect(session.user.username).toBe('testuser');
    });

    it('should allow specifying custom userId', () => {
      const session = createMockSession('custom-user');
      expect(session.user.id).toBe('custom-user');
    });
  });
});
