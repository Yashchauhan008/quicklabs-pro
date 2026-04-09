import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { enquiryFormSchema, type EnquiryFormValues } from '@/schema/enquiry';
import { useCreateEnquiry } from '@/hooks/useStudentFeatures';
import { useAuth } from '@/context/AuthContext';
import { isStudentRole } from '@/utils/roles';
import { ROUTES } from '@/config';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const EnquiryCreatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createMutation = useCreateEnquiry();
  const isStudent = isStudentRole(user?.role);

  const form = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: {
      title: '',
      description: '',
      topic: 'other',
      is_private: false,
    },
  });

  const onSubmit = async (values: EnquiryFormValues) => {
    await createMutation.mutateAsync({
      title: values.title,
      description: values.description,
      topic: values.topic,
      is_private: values.is_private,
    });
    navigate(ROUTES.ENQUIRIES);
  };

  if (!isStudent) {
    return (
      <div className="mx-auto max-w-lg">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>New enquiry</CardTitle>
            <CardDescription>Available to student accounts only.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <Button variant="ghost" asChild className="mb-2 -ml-2 rounded-lg">
          <Link to={ROUTES.ENQUIRIES}>← All enquiries</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New enquiry</h1>
        <p className="mt-1 text-muted-foreground">
          Describe what you need - description must be at least 10 characters.
        </p>
      </div>

      <Card className="border-0 shadow-md ring-1 ring-black/4 dark:ring-white/6">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>
            Your instructors or support team will see this in their queue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...form.register('title')} className="rounded-lg" />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={6}
                className="rounded-lg"
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Select
                value={form.watch('topic')}
                onValueChange={(value) =>
                  form.setValue('topic', value as EnquiryFormValues['topic'], {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger id="topic" className="rounded-lg">
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subject">Subject</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="is_private">Private enquiry</Label>
                <p className="text-xs text-muted-foreground">
                  Mark private if only you and admins should see it.
                </p>
              </div>
              <Switch
                id="is_private"
                checked={form.watch('is_private')}
                onCheckedChange={(value) =>
                  form.setValue('is_private', value, { shouldDirty: true })
                }
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Sending…' : 'Send enquiry'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to={ROUTES.ENQUIRIES}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
