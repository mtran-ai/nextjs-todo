import { Card, CardContent, CardDescription, CardTitle } from '~/components/ui/card';

type TodoStatsProps = {
  total: number;
  completed: number;
};

export function TodoStats({ total, completed }: TodoStatsProps) {
  const pending = total - completed;

  const items = [
    { label: 'Total', value: total, testId: 'stats-total' },
    { label: 'Completed', value: completed, testId: 'stats-completed' },
    { label: 'Pending', value: pending, testId: 'stats-pending' }
  ];

  return (
    <div
      data-testid='todo-stats'
      className='grid grid-cols-3 gap-3'
    >
      {items.map(({ label, value, testId }) => (
        <Card key={label}>
          <CardContent className='flex flex-col gap-1 p-4'>
            <CardDescription className='text-xs uppercase tracking-wide'>
              {label}
            </CardDescription>
            <CardTitle
              data-testid={testId}
              className='text-2xl font-semibold tabular-nums'
            >
              {value}
            </CardTitle>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
