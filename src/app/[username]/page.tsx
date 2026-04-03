import { type Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Separator } from '~/components/ui/separator';

import { db } from '~/lib/db';
import { auth } from '~/lib/auth';
import { PAGES } from '~/lib/constants';

import { Search } from '~/components/search';
import { Icons } from '~/components/icons';
import { CreateTaskForm } from '~/components/task-form';
import { TaskCard } from '~/components/task-card';

export const metadata: Metadata = {
  title: 'Home page 🏡'
};

async function getMyTasks(searchValue: string = '') {
  const session = await auth();

  if (!session) {
    redirect(PAGES.SIGN_IN);
  }

  const tasks = await db.task.findMany({
    where: {
      authorId: session.user.id,
      OR: [
        {
          title: {
            contains: searchValue
          }
        },
        {
          description: {
            contains: searchValue
          }
        }
      ]
    },
    orderBy: [{ done: 'asc' }, { createdAt: 'desc' }],
    include: {
      gh: {
        select: {
          fullName: true
        }
      },
      _count: {
        select: {
          comments: true
        }
      }
    }
  });

  return tasks;
}

export default async function HomePage({
  params,
  searchParams
}: {
  params: Promise<{
    username: string;
  }>;
  searchParams: Promise<{
    q?: string;
  }>;
}) {
  const { username } = await params;
  const { q } = await searchParams;
  const tasks = await getMyTasks(q ?? '');

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className='flex w-full max-w-[650px] flex-col gap-6'>
      <div className='flex items-center justify-between gap-3'>
        <Search />
        <CreateTaskForm />
      </div>
      <Separator />
      {tasks.length === 0 ? (
        <div
          data-testid='empty-state'
          className='flex flex-col items-center gap-3 py-12 text-muted-foreground'
        >
          <Icons.square className='size-10 opacity-30' />
          <p className='text-sm font-medium'>No tasks yet</p>
          <p className='text-xs'>Create your first task to get started.</p>
        </div>
      ) : (
        <>
          <p
            data-testid='task-progress'
            className='text-xs text-muted-foreground'
          >
            {doneCount} of {tasks.length} task{tasks.length !== 1 ? 's' : ''}{' '}
            complete
          </p>
          <ul className='flex flex-col gap-3 text-sm'>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} username={username} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
