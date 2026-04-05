import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import { ROUTES } from '@/config';

export const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <FileQuestion className="h-24 w-24 text-muted-foreground mb-4" />
      <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
      <p className="text-xl text-muted-foreground mb-2">Page not found</p>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button asChild>
        <Link to={ROUTES.DASHBOARD}>Back to home</Link>
      </Button>
    </div>
  );
};