import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface StarPickerProps {
  value: number;
  onChange: (stars: number) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function StarPicker({
  value,
  onChange,
  disabled,
  label,
  className,
}: StarPickerProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <Button
            key={n}
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="h-9 w-9 rounded-lg"
            onClick={() => onChange(n)}
            aria-label={`${n} stars`}
          >
            <Star
              className={cn(
                'h-6 w-6 transition-colors',
                n <= value
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground/40',
              )}
            />
          </Button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground tabular-nums">
          {value > 0 ? `${value} / 5` : 'Pick a rating'}
        </span>
      </div>
    </div>
  );
}
