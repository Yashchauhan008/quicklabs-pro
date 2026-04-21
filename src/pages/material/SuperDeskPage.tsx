import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BrainCircuit,
  CalendarClock,
  Crown,
  Sparkles,
  WandSparkles,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type FeatureItem = {
  id: string;
  title: string;
  description: string;
  icon: typeof Sparkles;
  eta: string;
};

const featureItems: FeatureItem[] = [
  {
    id: 'personal-desk',
    title: 'Personalized prep desk',
    description:
      'A focused workspace that adapts to your learning pace, goals, and topic priority.',
    icon: Crown,
    eta: 'Phase 1',
  },
  {
    id: 'ai-doubt-solving',
    title: 'Onboarded AI doubt solver',
    description:
      'Ask from anywhere and get contextual answers while staying inside your learning flow.',
    icon: BrainCircuit,
    eta: 'Phase 1',
  },
  {
    id: 'super-explainer',
    title: 'Superior explainer',
    description:
      'Complex concepts broken into simple, structured steps with cleaner visual guidance.',
    icon: WandSparkles,
    eta: 'Phase 2',
  },
  {
    id: 'senior-appointments',
    title: 'Master & senior appointments',
    description:
      'Book short mentoring slots with seniors to learn practical approaches and exam strategy.',
    icon: CalendarClock,
    eta: 'Phase 2',
  },
  {
    id: 'test-generation',
    title: 'Test generation from selected files',
    description:
      'Generate targeted prep tests based on your selected documents and desired outcomes.',
    icon: FileText,
    eta: 'Phase 3',
  },
];

export const SuperDeskPage = () => {
  const [selectedId, setSelectedId] = useState<string>(featureItems[0].id);

  const selectedFeature = useMemo(
    () =>
      featureItems.find((feature) => feature.id === selectedId) ??
      featureItems[0],
    [selectedId],
  );

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-linear-to-r from-violet-600/95 via-indigo-600/95 to-blue-600/95 text-white shadow-xl">
        <CardContent className="space-y-3 p-6 md:p-8">
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white hover:bg-white/20">
              Premium Lab
            </Badge>
            <Badge className="bg-amber-300/90 text-amber-950 hover:bg-amber-300/90">
              Still in development
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Super Desk
          </h1>
          <p className="max-w-3xl text-sm text-white/90 md:text-base">
            Your next-level preparation desk is on the way. Some features are
            under active development and will roll out in phases.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1.85fr]">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="space-y-3 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Upcoming stack
            </p>
            {featureItems.map((feature) => {
              const active = feature.id === selectedFeature.id;
              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => setSelectedId(feature.id)}
                  className={cn(
                    'w-full rounded-xl border p-3 text-left transition-all',
                    active
                      ? 'border-violet-400/80 bg-violet-500/10 shadow-sm'
                      : 'border-border/60 hover:border-violet-300/50 hover:bg-muted/40',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2">
                      <feature.icon className="h-4 w-4 text-violet-600" />
                      <span className="text-sm font-semibold">{feature.title}</span>
                    </div>
                    <Badge variant="outline" className="text-[11px]">
                      {feature.eta}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="space-y-5 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Feature preview
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight">
                  {selectedFeature.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  {selectedFeature.description}
                </p>
              </div>
              <div className="rounded-xl bg-violet-500/10 p-3">
                <selectedFeature.icon className="h-6 w-6 text-violet-700" />
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-violet-300/70 bg-violet-50/50 p-4 dark:bg-violet-500/5">
              <div className="flex items-center gap-2 text-sm font-medium text-violet-800 dark:text-violet-200">
                <Sparkles className="h-4 w-4" />
                Build status
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                We are shaping this experience with premium quality and clean
                interaction design. Release timeline may evolve as we polish the
                final experience.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button className="rounded-lg bg-violet-600 hover:bg-violet-700">
                Notify me on launch
              </Button>
              <Button variant="outline" className="rounded-lg">
                Share feature ideas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
