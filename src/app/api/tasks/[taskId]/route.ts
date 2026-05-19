import { NextRequest } from 'next/server';
import { z } from 'zod';

import { auth } from '~/lib/auth';
import { db } from '~/lib/db';

const paramsSchema = z.object({
  taskId: z.string()
});

const updateTaskSchema = z.object({
  title: z.string(),
  description: z.string().nullish(),
  due: z.string().nullish(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional()
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return Response.json({
        success: false,
        message: 'Your session has expired. To use the app sign in again'
      });
    }

    const params = paramsSchema.parse(await context.params);

    const json = await request.json();
    const body = updateTaskSchema.parse(json);

    await db.task.update({
      data: {
        title: body.title,
        description: body.description,
        due: body.due,
        priority: body.priority
      },
      where: {
        id: params.taskId
      }
    });

    return Response.json({
      success: true,
      message: 'The task was successfully updated'
    });
  } catch (e) {
    return Response.json({
      success: false,
      message: 'Error occured while updating the task!'
    });
  }
}
