import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { subjectFormSchema, type SubjectFormValues } from '@/schema/subject';
import {
  useCreateSubject,
  useGetSubject,
  useUpdateSubject,
} from '@/hooks/useSubjects';
import { ROUTES } from '@/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { generatePath } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { parseEntity } from '@/utils/parseApiResponse';
import { useAuth } from '@/context/AuthContext';
import { isStudentRole } from '@/utils/roles';

export const SubjectFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: subject, isLoading } = useGetSubject(isEdit ? id : undefined);
  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject(id ?? '');

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (subject && isEdit) {
      form.reset({
        name: subject.name,
        description: subject.description ?? '',
      });
    }
  }, [subject, isEdit, form]);

  const onSubmit = async (values: SubjectFormValues) => {
    if (isEdit && id) {
      await updateMutation.mutateAsync({
        name: values.name,
        description: values.description?.trim() || undefined,
      });
      navigate(generatePath(ROUTES.SUBJECT_DETAILS, { id }));
      return;
    }
    const res = await createMutation.mutateAsync({
      name: values.name,
      description: values.description?.trim() || undefined,
    });
    const created = parseEntity<{ id: string }>(res);
    if (created?.id) {
      navigate(generatePath(ROUTES.SUBJECT_DETAILS, { id: created.id }));
    } else {
      navigate(ROUTES.SUBJECTS);
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-2 -ml-2 rounded-lg">
          <Link to={ROUTES.SUBJECTS}>← Courses</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEdit ? 'Edit course' : 'New course'}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isEdit
            ? 'Update how this course appears in your workspace'
            : 'Create a course to group readings, notes, and uploads'}
        </p>
        {isStudentRole(user?.role) && !isEdit && (
          <p className="mt-2 text-sm text-muted-foreground rounded-lg border bg-muted/40 px-3 py-2">
            Students can have up to <strong>2</strong> active courses. Choose
            whether each file is informational or lab-style when you upload it.
          </p>
        )}
      </div>

      <Card className="border-0 shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
        <CardHeader>
          <CardTitle>Course details</CardTitle>
          <CardDescription>
            Name: 2–255 characters. Description is optional (up to 1000
            characters).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving…'
                  : isEdit
                    ? 'Save changes'
                    : 'Create course'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link
                  to={
                    isEdit && id
                      ? generatePath(ROUTES.SUBJECT_DETAILS, { id })
                      : ROUTES.SUBJECTS
                  }
                >
                  Cancel
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
