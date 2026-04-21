import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SlidersHorizontal } from 'lucide-react';

export const Settings = () => {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
        <p className="mt-1 text-muted-foreground">
          Tune how QuickLabs Learning works for you
        </p>
      </div>

      <Card className="border-0 shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">Learning preferences</CardTitle>
            <CardDescription>
              Notifications, accessibility, and display options will appear
              here.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="rounded-xl border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
            More settings are on the way.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
