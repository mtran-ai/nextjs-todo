import Link from 'next/link';
import { DoneCheckbox } from '~/components/done-checkbox';
import { TaskMenu } from '~/components/task-menu';
import { Icons } from '~/components/icons';
import { Badge } from '~/components/ui/badge';
import { formatDate, cn } from '~/lib/utils';

type TaskCardProps = {
  task: {
    id: string;
    done: boolean;
    title: string;
    description: string | null;
    due: Date | null;
    gh: { fullName: string } | null;
    _count: { comments: number };
    labels: { id: string; name: string; color: string }[];
  };
  username: string;
};

function isOverdue(due: Date | null, done: boolean): boolean {
  return !done && due !== null && due < new Date();
}

export function TaskCard({ task, username }: TaskCardProps) {
  const overdue = isOverdue(task.due, task.done);
  const hasMetadata = task.due || task.gh || task._count.comments > 0;
  const hasLabels = task.labels.length > 0;

  return (
    <li
      className={cn(
        'flex items-center gap-2 rounded-md border p-3 transition-opacity',
        task.done && 'opacity-60'
      )}
    >
      <DoneCheckbox id={task.id} done={task.done} />
      <Link
        className='flex-1 overflow-hidden rounded-md p-2 hover:bg-accent'
        href={`/${username}/${task.id}`}
      >
        <div className='flex flex-1 flex-col gap-1'>
          <h4
            className={cn(
              'font-semibold',
              task.done && 'text-muted-foreground line-through'
            )}
          >
            {task.title}
          </h4>
          {task.description && (
            <span className='line-clamp-2 text-sm text-muted-foreground'>
              {task.description}
            </span>
          )}
          {hasLabels && (
            <div
              data-testid='task-labels'
              className='mt-1 flex flex-wrap gap-1'
            >
              {task.labels.map((label) => (
                <Badge
                  key={label.id}
                  style={{ backgroundColor: label.color, color: '#fff' }}
                  className='border-transparent'
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          )}
          {hasMetadata && (
            <div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
              {task.due && (
                <time
                  className={cn(
                    'flex items-center gap-1',
                    overdue && 'font-medium text-destructive'
                  )}
                >
                  <Icons.calendarClock className='size-3.5 flex-shrink-0' />
                  <span className='sm:hidden'>
                    {formatDate(task.due.toString(), 'short')}
                  </span>
                  <span className='hidden sm:block'>
                    {formatDate(task.due.toString())}
                  </span>
                  {overdue && <span>(overdue)</span>}
                </time>
              )}
              {task.gh && (
                <span className='flex items-center gap-1'>
                  <Icons.github className='size-3.5 flex-shrink-0' />
                  <span className='overflow-hidden text-ellipsis text-nowrap'>
                    {task.gh.fullName}
                  </span>
                </span>
              )}
              {task._count.comments > 0 && (
                <span className='flex items-center gap-1'>
                  <Icons.comments className='size-3.5' />
                  <span>{task._count.comments}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
      <TaskMenu
        id={task.id}
        title={task.title}
        description={task.description}
        due={task.due}
        labels={task.labels}
      />
    </li>
  );
}
