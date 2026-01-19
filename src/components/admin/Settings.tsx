import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Settings = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your application settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Settings coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};