'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { db } from '~/lib/db';
import { action } from '~/lib/safe-action';

const doneSchema = z.object({
  id: z.string(),
  done: z.boolean()
});

const SESSION_EXPIRED_MESSAGE =
  'Your session has expired. To use the app sign in again';

export const toogle = action(doneSchema, async ({ id, done }, { userId }) => {
  try {
    if (!userId)
      return {
        failure: SESSION_EXPIRED_MESSAGE
      };

    const task = await db.task.update({
      where: {
        id
      },
      data: {
        done
      }
    });

    revalidatePath('/[username]', 'page');

    return {
      done: task.done
    };
  } catch (e) {
    console.log(e);

    return {
      failure: 'Error occurred while toggling the done state!'
    };
  }
});

const deleteTaskSchema = z.object({
  id: z.string()
});

export const deleteTask = action(
  deleteTaskSchema,
  async ({ id }, { userId }) => {
    try {
      if (!userId)
        return {
          failure: SESSION_EXPIRED_MESSAGE
        };

      const task = await db.task.delete({
        where: {
          id
        },
        select: {
          id: true
        }
      });

      revalidatePath('/[username]', 'page');

      return task;
    } catch (e) {
      console.log(e);

      return {
        failure: 'Error occurred while deleting the task!'
      };
    }
  }
);

const createCommentSchema = z.object({
  taskId: z.string(),
  text: z.string()
});

export const createComment = action(
  createCommentSchema,
  async ({ taskId, text }, { userId }) => {
    try {
      if (!userId)
        return {
          failure: SESSION_EXPIRED_MESSAGE
        };

      const task = await db.comment.create({
        data: {
          taskId,
          senderId: userId,
          text
        }
      });

      revalidatePath('/[username]/[taskId]', 'page');

      return task;
    } catch (e) {
      console.log(e);

      return {
        failure: 'Error occurred while creating the comment!'
      };
    }
  }
);

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, { message: 'Color must be a hex like #aabbcc' });

const createLabelSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Label name is required' })
    .max(30, { message: 'Label name is too long (max: 30 symbols)' }),
  color: hexColor
});

export const createLabel = action(
  createLabelSchema,
  async ({ name, color }, { userId }) => {
    try {
      if (!userId)
        return {
          failure: SESSION_EXPIRED_MESSAGE
        };

      const label = await db.label.create({
        data: {
          name: name.trim(),
          color,
          userId
        }
      });

      revalidatePath('/[username]', 'page');

      return label;
    } catch (e) {
      console.log(e);

      return {
        failure: 'Error occurred while creating the label!'
      };
    }
  }
);

const listLabelsSchema = z.object({});

export const listLabels = action(listLabelsSchema, async (_, { userId }) => {
  try {
    if (!userId)
      return {
        failure: SESSION_EXPIRED_MESSAGE
      };

    const labels = await db.label.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, color: true }
    });

    return { labels };
  } catch (e) {
    console.log(e);

    return {
      failure: 'Error occurred while listing labels!'
    };
  }
});

const deleteLabelSchema = z.object({
  id: z.string()
});

export const deleteLabel = action(
  deleteLabelSchema,
  async ({ id }, { userId }) => {
    try {
      if (!userId)
        return {
          failure: SESSION_EXPIRED_MESSAGE
        };

      const owned = await db.label.findFirst({
        where: { id, userId },
        select: { id: true }
      });

      if (!owned) {
        return { failure: 'Label not found' };
      }

      const label = await db.label.delete({
        where: { id },
        select: { id: true }
      });

      revalidatePath('/[username]', 'page');

      return label;
    } catch (e) {
      console.log(e);

      return {
        failure: 'Error occurred while deleting the label!'
      };
    }
  }
);

const linkRepoSchema = z.object({
  taskId: z.string(),
  link: z
    .string()
    .min(1, { message: 'There is no link' })
    .regex(new RegExp('https://github.com/.*/.*'), {
      message: `It's not a github repo link 😡`
    })
});

export const linkRepo = action(
  linkRepoSchema,
  async ({ link, taskId }, { userId }) => {
    try {
      if (!userId)
        return {
          failure: SESSION_EXPIRED_MESSAGE
        };

      const splitted = link.split('/');

      const repoName = splitted[splitted.length - 1];
      const ownerName = splitted[splitted.length - 2];
      const fullName = `${ownerName}/${repoName}`;

      const repo = await db.repo.upsert({
        where: {
          taskId
        },
        update: {
          repoName,
          owner: ownerName,
          fullName
        },
        create: {
          taskId: taskId,
          repoName,
          owner: ownerName,
          fullName
        }
      });

      revalidatePath('/[username]', 'page');

      return repo;
    } catch (e) {
      console.log(e);

      return {
        failure: 'Error occurred while linking the repo!'
      };
    }
  }
);
