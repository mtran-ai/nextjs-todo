'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAction } from 'next-safe-action/hooks';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '~/components/ui/popover';
import { Icons } from '~/components/icons';

import { listLabels, createLabel, deleteLabel } from '~/app/actions';

export type LabelOption = {
  id: string;
  name: string;
  color: string;
};

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899'
];

export function LabelSelector({
  selectedIds,
  onChange
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [labels, setLabels] = useState<LabelOption[]>([]);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

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

  const create = useAction(createLabel, {
    onSuccess: (data) => {
      if (data && 'failure' in data) {
        toast.error(data.failure);
        return;
      }
      if (data && 'id' in data) {
        setLabels((prev) =>
          [...prev, data as LabelOption].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        );
        onChange([...selectedIds, data.id]);
        setNewName('');
      }
    }
  });

  const remove = useAction(deleteLabel, {
    onSuccess: (data, input) => {
      if (data && 'failure' in data) {
        toast.error(data.failure);
        return;
      }
      setLabels((prev) => prev.filter((l) => l.id !== input.id));
      onChange(selectedIds.filter((id) => id !== input.id));
    }
  });

  useEffect(() => {
    list.execute({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedLabels = labels.filter((l) => selectedIds.includes(l.id));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id='labels'
          variant='outline'
          type='button'
          className='flex h-auto min-h-10 justify-between'
          data-testid='label-selector-trigger'
        >
          <div className='flex flex-wrap items-center gap-1'>
            {selectedLabels.length === 0 ? (
              <span>Pick labels</span>
            ) : (
              selectedLabels.map((l) => (
                <Badge
                  key={l.id}
                  style={{ backgroundColor: l.color, color: '#fff' }}
                  className='border-transparent'
                >
                  {l.name}
                </Badge>
              ))
            )}
          </div>
          <Icons.tag className='size-4 flex-shrink-0' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-72 p-3' align='start'>
        <div className='flex flex-col gap-2'>
          <div
            className='flex max-h-48 flex-col gap-1 overflow-y-auto'
            data-testid='label-list'
          >
            {labels.length === 0 ? (
              <p className='py-2 text-center text-xs text-muted-foreground'>
                No labels yet. Create one below.
              </p>
            ) : (
              labels.map((label) => {
                const selected = selectedIds.includes(label.id);

                return (
                  <div
                    key={label.id}
                    className='flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent'
                  >
                    <button
                      type='button'
                      onClick={() => toggle(label.id)}
                      className='flex flex-1 items-center gap-2 text-left'
                      data-testid={`label-option-${label.name}`}
                    >
                      <span
                        className='inline-block size-3 flex-shrink-0 rounded-full'
                        style={{ backgroundColor: label.color }}
                      />
                      <span className='flex-1 text-sm'>{label.name}</span>
                      {selected && <Icons.check className='size-4' />}
                    </button>
                    <button
                      type='button'
                      aria-label={`Delete label ${label.name}`}
                      onClick={() => remove.execute({ id: label.id })}
                      className='text-muted-foreground hover:text-destructive'
                    >
                      <Icons.delete className='size-3.5' />
                    </button>
                  </div>
                );
              })
            )}
          </div>
          <div className='flex flex-col gap-2 border-t pt-2'>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder='New label name'
              data-testid='new-label-name'
            />
            <div className='flex flex-wrap gap-1'>
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type='button'
                  aria-label={`Pick color ${color}`}
                  onClick={() => setNewColor(color)}
                  style={{ backgroundColor: color }}
                  className={
                    'size-6 rounded-full border-2 ' +
                    (newColor === color
                      ? 'border-foreground'
                      : 'border-transparent')
                  }
                />
              ))}
            </div>
            <Button
              type='button'
              size='sm'
              disabled={create.status === 'executing' || newName.trim() === ''}
              onClick={() =>
                create.execute({ name: newName.trim(), color: newColor })
              }
              data-testid='create-label-button'
            >
              {create.status === 'executing' ? (
                <Icons.spinner className='size-4 animate-spin' />
              ) : (
                'Create label'
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
