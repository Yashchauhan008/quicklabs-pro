import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  documentUploadSchema,
  type DocumentUploadFormValues,
} from '@/schema/document';
import { useUploadDocument } from '@/hooks/useDocuments';
import { useGetSubject, useGetSubjects } from '@/hooks/useSubjects';
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
import { formatFileSize } from '@/utils/formate';
import { DOCUMENT_FILE_ACCEPT } from '@/config/var';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  fileDedupeKey,
  mergeIntoFileList,
} from '@/utils/stageUploadFiles';

const EMPTY_SUBJECTS: Subject[] = [];

const MAX_FILES = 10;

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
  const { data: presetSubjectData } = useGetSubject(
    presetSubject || undefined,
  );
  const uploadMutation = useUploadDocument();

  const subjects = useMemo(() => {
    const list = subjectsData?.items ?? EMPTY_SUBJECTS;
    if (!presetSubjectData) return list;
    if (list.some((s) => s.id === presetSubjectData.id)) return list;
    return [presetSubjectData, ...list];
  }, [subjectsData?.items, presetSubjectData]);

  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      subject_id: '',
      title: '',
      description: '',
      visibility: 'PRIVATE',
      kind: 'informational',
      files: [],
      main_file_index: 0,
      file_titles: [],
      file_descriptions: [],
    },
  });

  const files = useWatch({ control: form.control, name: 'files' });

  useEffect(() => {
    if (!subjects.length) return;
    const current = form.getValues('subject_id');
    const validPreset =
      presetSubject && subjects.some((s) => s.id === presetSubject);
    const nextSubjectId = validPreset ? presetSubject : subjects[0].id;
    if (current !== nextSubjectId) {
      form.setValue('subject_id', nextSubjectId);
    }
  }, [subjects, presetSubject, form]);

  useEffect(() => {
    const len = files?.length ?? 0;
    const prevDesc = form.getValues('file_descriptions') ?? [];
    const prevTitles = form.getValues('file_titles') ?? [];
    if (len === 0) {
      form.setValue('file_descriptions', []);
      form.setValue('file_titles', []);
      form.setValue('main_file_index', 0);
      return;
    }
    if (prevDesc.length !== len) {
      form.setValue(
        'file_descriptions',
        Array.from({ length: len }, (_, i) => prevDesc[i] ?? ''),
      );
    }
    if (prevTitles.length !== len) {
      form.setValue(
        'file_titles',
        Array.from({ length: len }, (_, i) => {
          const existing = prevTitles[i]?.trim();
          if (existing) return prevTitles[i];
          const f = files![i];
          const base = f.name.replace(/\.[^.]+$/, '') || f.name;
          return base.slice(0, 50);
        }),
      );
    }
    const mainIdx = form.getValues('main_file_index');
    if (mainIdx >= len) {
      form.setValue('main_file_index', 0);
    }
  }, [files, form]);

  const onSubmit = async (values: DocumentUploadFormValues) => {
    const fd = new FormData();
    for (const f of values.files) {
      fd.append('files', f);
    }
    fd.append('subject_id', values.subject_id);
    fd.append('title', values.title);
    const desc = values.description?.trim();
    if (desc) fd.append('description', desc);
    fd.append('visibility', values.visibility);
    fd.append('kind', values.kind);
    fd.append('main_index', String(values.main_file_index));
    const perFileDesc = values.files.map((_, i) => {
      const t = values.file_descriptions?.[i]?.trim();
      return t ?? '';
    });
    fd.append(
      'file_descriptions',
      JSON.stringify(perFileDesc.map((t) => (t.length ? t : null))),
    );
    const titles = (values.file_titles ?? []).slice(0, values.files.length);
    fd.append('file_titles', JSON.stringify(titles));

    await uploadMutation.mutateAsync(fd);
    navigate(profileUrl('documents'));
  };

  const removeFileAt = (index: number) => {
    const prevFiles = form.getValues('files') ?? [];
    const prevDesc = form.getValues('file_descriptions') ?? [];
    const prevTitles = form.getValues('file_titles') ?? [];
    if (index < 0 || index >= prevFiles.length) return;

    const newFiles = prevFiles.filter((_, j) => j !== index);
    const newDesc = prevDesc.filter((_, j) => j !== index);
    const newTitles = prevTitles.filter((_, j) => j !== index);

    let main = form.getValues('main_file_index');
    if (index === main) main = 0;
    else if (index < main) main -= 1;

    form.setValue('files', newFiles);
    form.setValue(
      'file_titles',
      newTitles.length
        ? newTitles
        : Array.from({ length: newFiles.length }, () => ''),
    );
    form.setValue(
      'file_descriptions',
      newDesc.length
        ? newDesc
        : Array.from({ length: newFiles.length }, () => ''),
    );
    form.setValue(
      'main_file_index',
      newFiles.length ? Math.min(main, newFiles.length - 1) : 0,
    );
    void form.trigger('files');
  };

  if (subjectsLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="max-w-2xl space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Upload materials</h1>
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
    <div className="max-w-2xl space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-2 -ml-2 rounded-lg">
          <Link to={profileUrl('documents')}>← Profile · Files</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Upload materials</h1>
        <p className="mt-1 text-muted-foreground">
          Up to 10 files per document — PDFs, Office files, PNG and other images,
          text, or CSV (75MB each). One file must be marked as the main file for
          lists and cards.
        </p>
        {studentUploadNote && (
          <p className="mt-2 text-sm text-muted-foreground">
            Student accounts: each file counts toward your daily upload limit
            (UTC midnight reset).
          </p>
        )}
      </div>

      <Card className="border-0 shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
        <CardHeader>
          <CardTitle>Files & details</CardTitle>
          <CardDescription>
            Pick a course, add files, choose the main file, and set visibility.
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
                  <Select value={field.value} onValueChange={field.onChange}>
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
              <Label htmlFor="description">Document description (optional)</Label>
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
                  <Select value={field.value} onValueChange={field.onChange}>
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
                  <Select value={field.value} onValueChange={field.onChange}>
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
              <Label htmlFor="files-input">Add files (max {MAX_FILES})</Label>
              <Controller
                control={form.control}
                name="files"
                render={({ field: { onChange, ref, onBlur, name } }) => (
                  <Input
                    id="files-input"
                    type="file"
                    name={name}
                    ref={ref}
                    onBlur={onBlur}
                    multiple
                    accept={DOCUMENT_FILE_ACCEPT}
                    disabled={(files?.length ?? 0) >= MAX_FILES}
                    onChange={(e) => {
                      const picked = Array.from(e.target.files ?? []);
                      e.target.value = '';
                      if (picked.length === 0) return;

                      const prev = form.getValues('files') ?? [];
                      if (prev.length >= MAX_FILES) {
                        toast.error(
                          `Maximum ${MAX_FILES} files — remove one from the list below to add more.`,
                        );
                        return;
                      }

                      const { merged, skippedDupes, capped } = mergeIntoFileList(
                        prev,
                        picked,
                        MAX_FILES,
                      );

                      if (skippedDupes > 0 && merged.length === prev.length) {
                        toast.error(
                          'Those files are already in the list (same name, size, and date).',
                        );
                        return;
                      }

                      const room = MAX_FILES - prev.length;
                      if (capped && picked.length > room) {
                        toast(
                          `Only ${room} more file${room === 1 ? '' : 's'} fit (max ${MAX_FILES} total).`,
                        );
                      }

                      onChange(merged);
                    }}
                  />
                )}
              />
              <p className="text-xs text-muted-foreground">
                PDF, Office, PNG/JPEG/WebP/GIF, text, CSV — 75MB each. Use
                &quot;Choose
                files&quot; again to <span className="font-medium">add</span>{' '}
                to the list; it does not replace files you already picked.
              </p>
              {form.formState.errors.files && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.files.message ||
                    (form.formState.errors.files.root?.message as string)}
                </p>
              )}
            </div>

            {files && files.length > 0 ? (
              <div className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Label className="text-sm font-medium">
                      Files in this upload
                    </Label>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Main file is used on course cards and file lists.
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {files.length} / {MAX_FILES} file{files.length === 1 ? '' : 's'}
                  </span>
                </div>
                <Controller
                  control={form.control}
                  name="main_file_index"
                  render={({ field }) => (
                    <div className="space-y-3">
                      {files.map((file, index) => (
                        <div
                          key={`${fileDedupeKey(file)}-${index}`}
                          className="flex flex-col gap-2 rounded-md border border-border/50 bg-background/80 p-3 sm:flex-row sm:items-start"
                        >
                          <div className="flex items-start gap-3 pt-0.5">
                            <input
                              type="radio"
                              id={`main-${index}`}
                              name="main_file_index_ui"
                              className="mt-1 h-4 w-4 shrink-0 accent-primary"
                              checked={field.value === index}
                              onChange={() => field.onChange(index)}
                            />
                            <div className="min-w-0 flex-1">
                              <Label
                                htmlFor={`main-${index}`}
                                className="cursor-pointer font-medium leading-snug"
                              >
                                {file.name}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                Original filename · {formatFileSize(file.size)}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={() => removeFileAt(index)}
                              aria-label={`Remove ${file.name}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="min-w-0 flex-1 space-y-3 sm:pl-2">
                            <div className="space-y-1">
                              <Label htmlFor={`ft-${index}`} className="text-xs">
                                Display title{' '}
                                <span className="text-destructive">*</span>{' '}
                                <span className="font-normal text-muted-foreground">
                                  (max 50)
                                </span>
                              </Label>
                              <Input
                                id={`ft-${index}`}
                                maxLength={50}
                                className="text-sm"
                                placeholder="Shown in preview and downloads"
                                {...form.register(`file_titles.${index}` as const)}
                              />
                              <p className="text-[11px] text-muted-foreground">
                                {(form.watch(`file_titles.${index}`) ?? '').length}/50
                              </p>
                              {form.formState.errors.file_titles?.[index] ? (
                                <p className="text-xs text-destructive">
                                  {form.formState.errors.file_titles[index]?.message as string}
                                </p>
                              ) : null}
                            </div>
                            <div className="space-y-1">
                              <Label
                                htmlFor={`fd-${index}`}
                                className="text-xs text-muted-foreground"
                              >
                                Note for this file (optional)
                              </Label>
                              <Textarea
                                id={`fd-${index}`}
                                rows={2}
                                className="min-h-[60px] resize-y text-sm"
                                {...form.register(`file_descriptions.${index}` as const)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                />
                {form.formState.errors.main_file_index && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.main_file_index.message}
                  </p>
                )}
                {form.formState.errors.file_titles &&
                typeof form.formState.errors.file_titles === 'object' &&
                'message' in form.formState.errors.file_titles &&
                typeof (form.formState.errors.file_titles as { message?: string }).message ===
                  'string' ? (
                  <p className="text-sm text-destructive">
                    {(form.formState.errors.file_titles as { message: string }).message}
                  </p>
                ) : null}
              </div>
            ) : null}

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
