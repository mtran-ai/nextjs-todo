import { NextRequest } from 'next/server';
import { z } from 'zod';

import { auth } from '~/lib/auth';
import { db } from '~/lib/db';

const createTaskSchema = z.object({
  title: z.string(),
  description: z.string().nullish(),
  due: z.string().nullish(),
  labelIds: z.array(z.string()).optional()
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return Response.json({
        success: false,
        message: 'Your session has expired. To use the app sign in again'
      });
    }

    const json = await request.json();
    const body = createTaskSchema.parse(json);

    const labelIds = body.labelIds ?? [];

    if (labelIds.length > 0) {
      const ownedCount = await db.label.count({
        where: { id: { in: labelIds }, userId: session.user.id }
      });

      if (ownedCount !== labelIds.length) {
        return Response.json({
          success: false,
          message: 'One or more labels do not exist'
        });
      }
    }

    await db.task.create({
      data: {
        title: body.title,
        description: body.description,
        due: body.due,
        authorId: session.user.id,
        labels: {
          connect: labelIds.map((id) => ({ id }))
        }
      }
    });

    return Response.json({
      success: true,
      message: 'A new task was successfully created'
    });
  } catch (e) {
    return Response.json({
      success: false,
      message: 'Error occured while create a task!'
    });
  }
}
