'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAction } from 'next-safe-action/hooks';

import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '~/components/ui/popover';
import { Icons } from '~/components/icons';

import { listLabels } from '~/app/actions';

export const LABELS_QUERY = 'labels';

type LabelOption = { id: string; name: string; color: string };

function parseSelected(raw: string | null): string[] {
  if (!raw) return [];
  return raw.split(',').filter(Boolean);
}

export function LabelFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [labels, setLabels] = useState<LabelOption[]>([]);

  const selected = parseSelected(searchParams.get(LABELS_QUERY));

  const list = useAction(listLabels, {
    onSuccess: (data) => {
      if (data && 'failure' in data) {
        toast.error(data.failure);
        return;
      }
      if (data && 'labels' in data) {
        setLabels(data.labels);
      }
    }
  });

  useEffect(() => {
    list.execute({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = (ids: string[]) => {
    const params = new URLSearchParams(searchParams);

    if (ids.length === 0) {
      params.delete(LABELS_QUERY);
    } else {
      params.set(LABELS_QUERY, ids.join(','));
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      apply(selected.filter((x) => x !== id));
    } else {
      apply([...selected, id]);
    }
  };

  const clear = () => apply([]);

  const selectedLabels = labels.filter((l) => selected.includes(l.id));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          className='relative flex-shrink-0'
          data-testid='label-filter-trigger'
        >
          <Icons.tag className='size-4' />
          {selected.length > 0 && (
            <span className='absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground'>
              {selected.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-72 p-3' align='end'>
        <div className='flex items-center justify-between pb-2'>
          <span className='text-sm font-medium'>Filter by labels</span>
          {selected.length > 0 && (
            <button
              type='button'
              onClick={clear}
              className='text-xs text-muted-foreground hover:text-foreground'
              data-testid='label-filter-clear'
            >
              Clear
            </button>
          )}
        </div>
        {selectedLabels.length > 0 && (
          <div className='flex flex-wrap gap-1 border-b pb-2'>
            {selectedLabels.map((l) => (
              <Badge
                key={l.id}
                style={{ backgroundColor: l.color, color: '#fff' }}
                className='border-transparent'
              >
                {l.name}
              </Badge>
            ))}
          </div>
        )}
        <div
          className='flex max-h-60 flex-col gap-1 overflow-y-auto pt-2'
          data-testid='label-filter-list'
        >
          {labels.length === 0 ? (
            <p className='py-2 text-center text-xs text-muted-foreground'>
              No labels yet.
            </p>
          ) : (
            labels.map((label) => {
              const isOn = selected.includes(label.id);

              return (
                <button
                  key={label.id}
                  type='button'
                  onClick={() => toggle(label.id)}
                  className='flex items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-accent'
                  data-testid={`label-filter-option-${label.name}`}
                >
                  <span
                    className='inline-block size-3 flex-shrink-0 rounded-full'
                    style={{ backgroundColor: label.color }}
                  />
                  <span className='flex-1 text-sm'>{label.name}</span>
                  {isOn && <Icons.check className='size-4' />}
                </button>
              );
            })
          )}
        </div>
        {isPending && (
          <div className='flex justify-center pt-2'>
            <Icons.spinner className='size-4 animate-spin' />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
