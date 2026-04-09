import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  documentUploadSchema,
  type DocumentUploadFormValues,
} from '@/schema/document';
import { useUploadDocument } from '@/hooks/useDocuments';
import { useGetSubjects } from '@/hooks/useSubjects';
import { ROUTES } from '@/config';
import { profileUrl } from '@/utils/profileUrls';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { Subject } from '@/types/subject';
import { useAuth } from '@/context/AuthContext';
import { isStudentRole } from '@/utils/roles';

const EMPTY_SUBJECTS: Subject[] = [];

export const DocumentUploadPage = () => {
  const [searchParams] = useSearchParams();
  const presetSubject = searchParams.get('subject_id') ?? '';
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentUploadNote = isStudentRole(user?.role);
  const { data: subjectsData, isLoading: subjectsLoading } = useGetSubjects({
    page: 1,
    limit: 100,
  });
  const uploadMutation = useUploadDocument();

  const subjects = subjectsData?.items ?? EMPTY_SUBJECTS;

  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      subject_id: '',
      title: '',
      description: '',
      visibility: 'PRIVATE',
      kind: 'informational',
    },
  });

  useEffect(() => {
    if (!subjects.length) return;
    const current = form.getValues('subject_id');
    if (current) return;
    const validPreset =
      presetSubject && subjects.some((s) => s.id === presetSubject);
    form.setValue('subject_id', validPreset ? presetSubject : subjects[0].id);
  }, [subjects, presetSubject, form]);

  const onSubmit = async (values: DocumentUploadFormValues) => {
    const fd = new FormData();
    fd.append('file', values.file);
    fd.append('subject_id', values.subject_id);
    fd.append('title', values.title);
    const desc = values.description?.trim();
    if (desc) fd.append('description', desc);
    fd.append('visibility', values.visibility);
    fd.append('kind', values.kind);

    await uploadMutation.mutateAsync(fd);
    navigate(profileUrl('documents'));
  };

  if (subjectsLoading) {
    return (
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="max-w-xl space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Upload a file</h1>
        <p className="text-muted-foreground">
          Create a course first, then you can attach materials to it.
        </p>
        <Button asChild className="rounded-lg">
          <Link to={ROUTES.SUBJECT_CREATE}>New course</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-2 -ml-2 rounded-lg">
          <Link to={profileUrl('documents')}>← Profile · Files</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Upload a file</h1>
        <p className="mt-1 text-muted-foreground">
          PDFs, Office files, images, text, or CSV — up to 75MB each.
        </p>
        {studentUploadNote && (
          <p className="mt-2 text-sm text-muted-foreground">
            Student accounts: uploads are limited per UTC calendar day (resets at
            midnight UTC). If you hit the limit, try again tomorrow.
          </p>
        )}
      </div>

      <Card className="border-0 shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
        <CardHeader>
          <CardTitle>File & details</CardTitle>
          <CardDescription>
            Pick a course, set whether this file is informational or lab-style,
            and choose visibility.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <Controller
                control={form.control}
                name="subject_id"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.subject_id && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.subject_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...form.register('title')} />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                rows={3}
                {...form.register('description')}
              />
            </div>

            <div className="space-y-2">
              <Label>File kind</Label>
              <Controller
                control={form.control}
                name="kind"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="informational">
                        Informational — notes & key material
                      </SelectItem>
                      <SelectItem value="lab_solutions">
                        Lab / solutions — experiments & write-ups
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.kind && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.kind.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <Controller
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRIVATE">Private</SelectItem>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">File</Label>
              <Controller
                control={form.control}
                name="file"
                render={({ field: { onChange, onBlur, name, ref } }) => (
                  <Input
                    id="file"
                    type="file"
                    name={name}
                    ref={ref}
                    onBlur={onBlur}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onChange(f);
                    }}
                  />
                )}
              />
              {form.formState.errors.file && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.file.message}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? 'Uploading…' : 'Upload'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to={profileUrl('documents')}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
