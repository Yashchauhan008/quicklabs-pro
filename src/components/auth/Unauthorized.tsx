import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookX } from 'lucide-react';
import { ROUTES } from '@/config';

export const Unauthorized = () => {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 text-center shadow-lg ring-1 ring-black/[0.06] dark:ring-white/[0.08]">
        <CardHeader className="space-y-4 pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <BookX className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">You can&apos;t open this</CardTitle>
          <CardDescription className="text-base">
            This page isn&apos;t available for your account. If you think
            that&apos;s a mistake, contact your instructor or support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Error code 403</p>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button asChild className="rounded-lg">
            <Link to={ROUTES.DASHBOARD}>Back to home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
