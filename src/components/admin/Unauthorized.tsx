import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { ROUTES } from '@/config';

export const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <ShieldAlert className="h-24 w-24 text-destructive mb-4" />
      <h1 className="text-6xl font-bold text-primary mb-2">403</h1>
      <p className="text-xl text-muted-foreground mb-2">Unauthorized</p>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        You don't have permission to access this resource
      </p>
      <Button asChild>
        <Link to={ROUTES.DASHBOARD}>Go to Dashboard</Link>
      </Button>
    </div>
  );
};