import { useEffect, useState, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Link,
  useNavigate,
  useParams,
  generatePath,
  useSearchParams,
} from 'react-router-dom';
import {
  documentUpdateSchema,
  type DocumentUpdateFormValues,
} from '@/schema/document';
import {
  useAddDocumentAttachments,
  useDeleteDocument,
  useDeleteDocumentAttachment,
  useDownloadDocument,
  useGetDocument,
  usePatchDocumentAttachment,
  useUpdateDocument,
} from '@/hooks/useDocuments';
import { useGetSubject } from '@/hooks/useSubjects';
import { useDocumentPreview } from '@/hooks/useDocumentPreview';
import { ROUTES } from '@/config';
import { DOCUMENT_FILE_ACCEPT } from '@/config/var';
import { profileUrl } from '@/utils/profileUrls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';
import { DocumentPreviewPanel } from '@/components/shared/DocumentPreviewPanel';
import { formatDateTime, formatFileSize } from '@/utils/formate';
import { Download, Trash2, FileText, Star, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DOCUMENT_KIND_LABELS, type DocumentAttachment } from '@/types/document';
import { useAuth } from '@/context/AuthContext';
import { isStudentRole } from '@/utils/roles';
import { PeerAttributionRow } from '@/components/shared/PeerAttributionRow';
import { pickDocumentUploader } from '@/utils/displayUser';
import {
  attachmentDisplayTitle,
  getAttachmentPreviewMode,
} from '@/utils/documentPreview';
import { StarPicker } from '@/components/shared/StarPicker';
import { useRateDocument } from '@/hooks/useStudentFeatures';
import { cn } from '@/lib/utils';
import { fileDedupeKey, mergeIntoFileList } from '@/utils/stageUploadFiles';
import { toast } from 'react-hot-toast';
import { useGetUniversities } from '@/hooks/useAcademicMeta';

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="shrink-0 text-xs font-medium text-muted-foreground sm:w-24">
        {label}
      </dt>
      <dd className="min-w-0 text-sm text-foreground">{children}</dd>
    </div>
  );
}

function tabLabel(att: DocumentAttachment): string {
  const name = attachmentDisplayTitle(att);
  return name.length > 28 ? `${name.slice(0, 26)}…` : name;
}

export const DocumentDetailPage = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromExplore = searchParams.get('from') === 'explore';
  const [softDeleteOpen, setSoftDeleteOpen] = useState(false);
  const [permanentDeleteOpen, setPermanentDeleteOpen] = useState(false);
  const [activeAttachmentId, setActiveAttachmentId] = useState<string | null>(
    null,
  );
  const [removeAttachmentId, setRemoveAttachmentId] = useState<string | null>(
    null,
  );

  const [addFiles, setAddFiles] = useState<File[]>([]);
  const [addMainIndex, setAddMainIndex] = useState(0);
  const [addDescs, setAddDescs] = useState<string[]>([]);
  const [addTitles, setAddTitles] = useState<string[]>([]);

  const { data: doc, isLoading, isError } = useGetDocument(id);
  const { data: subject } = useGetSubject(doc?.subject_id);
  const updateMutation = useUpdateDocument(id ?? '');
  const deleteMutation = useDeleteDocument();
  const downloadMutation = useDownloadDocument();
  const rateMutation = useRateDocument(id);
  const addAttachmentsMutation = useAddDocumentAttachments(id ?? '');
  const patchAttachmentMutation = usePatchDocumentAttachment(id ?? '');
  const deleteAttachmentMutation = useDeleteDocumentAttachment(id ?? '');
  const [stars, setStars] = useState(0);

  const attachments = doc?.files ?? [];

  useEffect(() => {
    if (!attachments.length) {
      setActiveAttachmentId(null);
      return;
    }
    setActiveAttachmentId((prev) => {
      if (prev && attachments.some((a) => a.id === prev)) return prev;
      const main = attachments.find((a) => a.is_main) ?? attachments[0];
      return main.id;
    });
  }, [doc?.id, attachments]);

  useEffect(() => {
    const len = addFiles.length;
    setAddDescs((prev) =>
      len === 0
        ? []
        : Array.from({ length: len }, (_, i) => prev[i] ?? ''),
    );
    setAddTitles((prev) => {
      if (len === 0) return [];
      if (prev.length === len) return prev;
      return Array.from({ length: len }, (_, i) => {
        if (i < prev.length && (prev[i] ?? '').trim() !== '') return prev[i];
        const f = addFiles[i];
        const base = f.name.replace(/\.[^.]+$/, '') || f.name;
        return base.slice(0, 50);
      });
    });
    if (addMainIndex >= len) setAddMainIndex(0);
  }, [addFiles, addMainIndex]);

  const activeAttachment =
    attachments.find((a) => a.id === activeAttachmentId) ?? null;

  const previewMode = activeAttachment
    ? getAttachmentPreviewMode(activeAttachment)
    : 'none';
  const previewMimeHint = activeAttachment?.file_mime_type ?? undefined;

  const previewState = useDocumentPreview(id, previewMode, {
    mimeHint: previewMimeHint,
    attachmentId: activeAttachment?.id,
  });

  const form = useForm<DocumentUpdateFormValues>({
    resolver: zodResolver(documentUpdateSchema),
    defaultValues: {
      title: '',
      description: '',
      visibility: 'PRIVATE',
      kind: 'informational',
      university_id: '',
      batch_year: '',
      semester: '',
    },
  });
  const { data: universitiesData } = useGetUniversities({ page: 1, limit: 500 });

  useEffect(() => {
    if (doc) {
      form.reset({
        title: doc.title,
        description: doc.description ?? '',
        visibility: doc.visibility,
        kind: doc.kind ?? 'informational',
        university_id: doc.university_id ?? '',
        batch_year: doc.batch_year != null ? String(doc.batch_year) : '',
        semester: doc.semester != null ? String(doc.semester) : '',
      });
    }
  }, [doc, form]);

  const onSaveMetadata = async (values: DocumentUpdateFormValues) => {
    if (!id) return;
    await updateMutation.mutateAsync({
      title: values.title,
      description: values.description?.trim() ?? '',
      visibility: values.visibility,
      kind: values.kind,
      university_id: values.university_id || null,
      batch_year: values.batch_year?.trim() ? Number(values.batch_year.trim()) : null,
      semester: values.semester?.trim() ? Number(values.semester.trim()) : null,
    });
  };

  const afterDeleteRoute = fromExplore
    ? ROUTES.EXPLORE_MATERIALS
    : profileUrl('documents');

  const handleSoftDelete = async () => {
    if (!id) return;
    await deleteMutation.mutateAsync({ id });
    setSoftDeleteOpen(false);
    navigate(afterDeleteRoute);
  };

  const handlePermanentDelete = async () => {
    if (!id) return;
    await deleteMutation.mutateAsync({ id, permanent: true });
    setPermanentDeleteOpen(false);
    navigate(afterDeleteRoute);
  };

  const handleDownloadZip = async () => {
    if (!id || !doc) return;
    const base = doc.title.replace(/\s+/g, '_').replace(/[^\w-]+/g, '') || 'document';
    await downloadMutation.mutateAsync({ id, fallbackName: base });
  };

  const submitAddFiles = async () => {
    if (!id || addFiles.length === 0) return;
    const titles = addFiles.map((_, i) => addTitles[i]?.trim() ?? '');
    if (titles.some((t) => !t.length)) {
      toast.error('Each new file needs a display title (1–50 characters).');
      return;
    }
    if (titles.some((t) => t.length > 50)) {
      toast.error('Each file title must be at most 50 characters.');
      return;
    }
    const fd = new FormData();
    for (const f of addFiles) fd.append('files', f);
    fd.append('main_index', String(addMainIndex));
    const jsonDesc = addFiles.map((_, i) => {
      const t = addDescs[i]?.trim();
      return t?.length ? t : null;
    });
    fd.append('file_descriptions', JSON.stringify(jsonDesc));
    fd.append('file_titles', JSON.stringify(titles));
    await addAttachmentsMutation.mutateAsync(fd);
    setAddFiles([]);
    setAddDescs([]);
    setAddTitles([]);
    setAddMainIndex(0);
  };

  if (!id) {
    return <p className="text-muted-foreground">Missing document id</p>;
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-4 xl:max-w-400">
        <Skeleton className="h-9 w-2/3 max-w-md" />
        <Skeleton className="h-[320px] w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !doc) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">This document could not be found.</p>
        <Button asChild variant="outline" className="rounded-lg">
          <Link
            to={
              fromExplore ? ROUTES.EXPLORE_MATERIALS : profileUrl('documents')
            }
          >
            {fromExplore ? 'Back to all materials' : 'Back to materials'}
          </Link>
        </Button>
      </div>
    );
  }

  if (!attachments.length) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">This document has no files.</p>
        <Button asChild variant="outline" className="rounded-lg">
          <Link to={profileUrl('documents')}>Back to materials</Link>
        </Button>
      </div>
    );
  }

  const isStudent = isStudentRole(user?.role);
  const uploader = pickDocumentUploader(doc);
  const uploaderId = doc.uploader_id ?? doc.uploaded_by;
  const isOwner =
    !!user?.id &&
    !!uploaderId &&
    String(uploaderId) === String(user.id);

  const listBack = fromExplore
    ? ROUTES.EXPLORE_MATERIALS
    : profileUrl('documents');
  const listBackLabel = fromExplore
    ? '← All materials'
    : '← Profile · Files';
  const canRateDoc =
    isStudent &&
    !!uploaderId &&
    !!user?.id &&
    String(uploaderId) !== String(user.id);

  const totalSize = attachments.reduce(
    (acc, a) => acc + (a.file_size ?? 0),
    0,
  );

  const slotsLeft = Math.max(0, 10 - attachments.length);

  const removeStagedFile = (index: number) => {
    setAddFiles((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      return prev.filter((_, j) => j !== index);
    });
    setAddDescs((prev) => prev.filter((_, j) => j !== index));
    setAddTitles((prev) => prev.filter((_, j) => j !== index));
    setAddMainIndex((m) => {
      if (index === m) return 0;
      if (index < m) return Math.max(0, m - 1);
      return m;
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 xl:max-w-400">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <Button
            variant="ghost"
            asChild
            className="mb-1 -ml-2 h-8 rounded-lg px-2 text-muted-foreground"
          >
            <Link to={listBack}>{listBackLabel}</Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {doc.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {doc.kind ? (
              <Badge variant="outline" className="font-normal">
                {DOCUMENT_KIND_LABELS[doc.kind]}
              </Badge>
            ) : null}
            <Badge variant="secondary" className="font-mono text-xs">
              {doc.visibility}
            </Badge>
            {attachments.length > 1 ? (
              <span className="text-xs text-muted-foreground">
                {attachments.length} files
              </span>
            ) : null}
            {doc.download_count != null ? (
              <span className="text-xs text-muted-foreground">
                {doc.download_count} download{doc.download_count === 1 ? '' : 's'}
              </span>
            ) : null}
            {isStudent &&
            doc.rating_count != null &&
            doc.rating_count > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {Number(doc.rating_avg ?? 0).toFixed(1)} · {doc.rating_count}{' '}
                rating{doc.rating_count === 1 ? '' : 's'}
              </span>
            ) : null}
          </div>
          {isStudent ? (
            <p className="mt-2 text-[11px] text-muted-foreground">
              ZIP download counts once toward your daily limit. Opening each
              preview tab loads that file and may count separately.
            </p>
          ) : null}
          {doc.updated_at ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Updated {formatDateTime(doc.updated_at)}
            </p>
          ) : null}
          <PeerAttributionRow
            variant="detail"
            label="Uploaded by"
            userId={uploaderId}
            displayName={uploader.label}
            profilePictureUrl={uploader.profilePictureUrl}
            className="mt-3"
          >
            {doc.uploader_email ? (
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground/85">
                {doc.uploader_email}
              </p>
            ) : null}
          </PeerAttributionRow>
        </div>
        <Button
          className="shrink-0 rounded-lg"
          onClick={() => void handleDownloadZip()}
          disabled={downloadMutation.isPending}
        >
          <Download className="mr-2 h-4 w-4" />
          {downloadMutation.isPending ? 'Downloading…' : 'Download all (ZIP)'}
        </Button>
      </div>

      <div className="w-full space-y-6">
        <section className="w-full overflow-hidden rounded-xl border border-border/60 bg-card shadow-md ring-1 ring-black/5 dark:bg-card/95 dark:ring-white/10">
          <div className="flex w-full items-center gap-3 border-b border-border/50 bg-linear-to-r from-muted/50 to-muted/25 px-5 py-4 sm:px-6">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold tracking-tight">Preview</h2>
              <p className="text-[11px] text-muted-foreground lg:hidden">
                Swipe tabs to switch files — use ZIP to download everything
              </p>
              <p className="hidden text-[11px] text-muted-foreground lg:block">
                Pick a file on the left — details stay on the right — ZIP downloads all
              </p>
            </div>
          </div>

          {/* Mobile / tablet: horizontal tabs */}
          <div className="border-b border-border/40 bg-muted/15 lg:hidden">
            <div
              className={cn(
                'flex w-full flex-nowrap gap-1 overflow-x-auto overscroll-x-contain px-4 pb-px pt-3 sm:px-5',
                '[scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5',
                '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border',
              )}
            >
              {attachments.map((att) => {
                const fullName = attachmentDisplayTitle(att);
                return (
                  <button
                    key={att.id}
                    type="button"
                    title={fullName}
                    onClick={() => setActiveAttachmentId(att.id)}
                    className={cn(
                      'inline-flex min-h-10 shrink-0 max-w-[min(16rem,42vw)] items-center gap-1.5 rounded-t-md border border-transparent px-3 py-2 text-left text-xs font-medium transition-colors',
                      activeAttachmentId === att.id
                        ? 'border-border border-b-transparent bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                    )}
                  >
                    <span className="min-w-0 truncate">{tabLabel(att)}</span>
                    {att.is_main ? (
                      <Badge variant="secondary" className="shrink-0 px-1 py-0 text-[10px]">
                        Main
                      </Badge>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex min-h-[min(52vh,640px)] flex-col lg:min-h-[min(68vh,820px)] lg:flex-row">
            {/* Desktop: vertical file rail */}
            <nav
              className="hidden w-54 shrink-0 flex-col border-border/40 bg-muted/10 lg:flex lg:border-r"
              aria-label="Files in this document"
            >
              <div className="flex max-h-[min(68vh,820px)] flex-col gap-0.5 overflow-y-auto overscroll-contain p-2 [scrollbar-width:thin]">
                {attachments.map((att) => {
                  const fullName = attachmentDisplayTitle(att);
                  const active = activeAttachmentId === att.id;
                  return (
                    <button
                      key={att.id}
                      type="button"
                      title={fullName}
                      onClick={() => setActiveAttachmentId(att.id)}
                      className={cn(
                        'flex w-full flex-col items-start gap-1 rounded-md border-l-[3px] px-2.5 py-2.5 text-left transition-colors',
                        active
                          ? 'border-l-primary bg-primary/8 text-foreground shadow-sm ring-1 ring-primary/15'
                          : 'border-l-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                      )}
                    >
                      <span className="line-clamp-3 w-full wrap-break-word text-xs font-medium leading-snug">
                        {fullName}
                      </span>
                      {att.is_main ? (
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-normal">
                          Main
                        </Badge>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="flex min-h-[min(44vh,520px)] min-w-0 flex-1 flex-col border-border/40 bg-background/30 lg:border-r">
              <div className="min-h-0 min-w-0 flex-1">
                <DocumentPreviewPanel
                  mode={previewMode}
                  state={previewState}
                  documentTitle={
                    activeAttachment
                      ? `${doc.title} · ${attachmentDisplayTitle(activeAttachment)}`
                      : doc.title
                  }
                />
              </div>
            </div>

          </div>
        </section>

        <section className="w-full rounded-xl border border-border/60 bg-card/80 px-4 py-4 shadow-sm ring-1 ring-black/4 dark:ring-white/6 sm:px-6">
          <h3 className="text-sm font-semibold">Files in this document</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Total size {formatFileSize(totalSize)}
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {attachments.map((att) => (
              <li
                key={att.id}
                className="rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0 break-all font-medium leading-snug">
                    {attachmentDisplayTitle(att)}
                  </span>
                  {att.is_main ? (
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      Main
                    </Badge>
                  ) : null}
                </div>
                {att.file_size != null ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatFileSize(att.file_size)}
                    {att.file_mime_type ? ` · ${att.file_mime_type}` : ''}
                  </p>
                ) : null}
                {att.description?.trim() ? (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {att.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border/40 pt-3">
            {doc.created_at ? (
              <MetaRow label="Uploaded">
                {formatDateTime(doc.created_at)}
              </MetaRow>
            ) : null}
            {subject ? (
              <MetaRow label="Course">
                <Link
                  className="text-primary underline-offset-4 hover:underline"
                  to={`${generatePath(ROUTES.SUBJECT_DETAILS, {
                    id: subject.id,
                  })}${fromExplore ? '?from=explore' : ''}`}
                >
                  {subject.name}
                </Link>
              </MetaRow>
            ) : null}
            {doc.university_name ? (
              <MetaRow label="University">{doc.university_name}</MetaRow>
            ) : null}
            {doc.batch_year ? <MetaRow label="Batch">{doc.batch_year}</MetaRow> : null}
            {doc.semester ? <MetaRow label="Semester">{doc.semester}</MetaRow> : null}
          </dl>
        </section>
      </div>

      {canRateDoc ? (
        <Card className="gap-0 border border-border/60 py-0 shadow-sm ring-1 ring-black/4 dark:ring-white/6">
          <CardHeader className="border-b border-border/50 py-4">
            <CardTitle className="text-base">Rate this material</CardTitle>
            <CardDescription className="text-xs">
              One rating per person. You can&apos;t rate your own upload.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 py-4">
            <StarPicker
              value={stars}
              onChange={setStars}
              disabled={rateMutation.isPending}
            />
            <Button
              type="button"
              size="sm"
              className="rounded-lg"
              disabled={stars < 1 || rateMutation.isPending}
              onClick={() => {
                if (stars < 1) return;
                void rateMutation.mutateAsync(stars);
              }}
            >
              {rateMutation.isPending ? 'Submitting…' : 'Submit rating'}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {isOwner ? (
        <>
          <Card className="gap-0 border border-border/60 py-0 shadow-sm ring-1 ring-black/4 dark:ring-white/6">
            <CardHeader className="border-b border-border/50 py-4">
              <CardTitle className="text-base">Edit document</CardTitle>
              <CardDescription className="text-xs">
                Update title, document description, visibility, and kind.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-4">
              <form
                onSubmit={form.handleSubmit(onSaveMetadata)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" {...form.register('title')} />
                  {form.formState.errors.title ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.title.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Document description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    {...form.register('description')}
                  />
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
                          <SelectValue placeholder="Visibility" />
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
                          <SelectValue placeholder="Kind" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="informational">
                            Informational
                          </SelectItem>
                          <SelectItem value="lab_solutions">
                            Lab / solutions
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.kind ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.kind.message}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>University</Label>
                    <Controller
                      control={form.control}
                      name="university_id"
                      render={({ field }) => (
                        <Select
                          value={field.value || 'none'}
                          onValueChange={(value) => {
                            field.onChange(value === 'none' ? '' : value);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select university" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {(universitiesData?.items ?? []).map((uni) => (
                              <SelectItem key={uni.id} value={uni.id}>
                                {uni.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batch_year">Batch year</Label>
                    <Input id="batch_year" {...form.register('batch_year')} placeholder="2026" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Input id="semester" {...form.register('semester')} placeholder="1-12" />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="rounded-lg"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving…' : 'Save changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="gap-0 border border-border/60 py-0 shadow-sm ring-1 ring-black/4 dark:ring-white/6">
            <CardHeader className="border-b border-border/50 py-4">
              <CardTitle className="text-base">Manage files</CardTitle>
              <CardDescription className="text-xs">
                Add up to {slotsLeft} more file{slotsLeft === 1 ? '' : 's'}.
                One file must stay as main; you can change which file is main.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 py-4">
              {slotsLeft > 0 ? (
                <div className="space-y-3 rounded-lg border border-dashed border-border/70 p-4">
                  <Label>Add files</Label>
                  <Input
                    type="file"
                    multiple
                    accept={DOCUMENT_FILE_ACCEPT}
                    disabled={addFiles.length >= slotsLeft}
                    onChange={(e) => {
                      const picked = Array.from(e.target.files ?? []);
                      e.target.value = '';
                      if (!picked.length) return;
                      setAddFiles((prev) => {
                        if (slotsLeft <= 0) return prev;
                        if (prev.length >= slotsLeft) {
                          toast.error(
                            'Batch is full — upload these files or remove one from the list below.',
                          );
                          return prev;
                        }
                        const { merged, skippedDupes, capped } =
                          mergeIntoFileList(prev, picked, slotsLeft);
                        if (skippedDupes > 0 && merged.length === prev.length) {
                          toast.error(
                            'Those files are already in this batch (same name, size, and date).',
                          );
                          return prev;
                        }
                        const room = slotsLeft - prev.length;
                        if (capped && picked.length > room) {
                          toast(
                            `Only ${room} more file${room === 1 ? '' : 's'} fit on this document.`,
                          );
                        }
                        return merged;
                      });
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose files again to add to this batch (does not replace
                    files you already picked). Up to {slotsLeft} new file
                    {slotsLeft === 1 ? '' : 's'} total.
                  </p>
                  {addFiles.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        Main among new uploads ({addFiles.length} / {slotsLeft})
                      </p>
                      <div className="space-y-4">
                        {addFiles.map((f, i) => (
                          <div
                            key={`${fileDedupeKey(f)}-${i}`}
                            className="space-y-3 rounded-md border border-border/50 bg-background/60 p-3 text-sm"
                          >
                            <div className="flex items-start gap-2">
                              <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2">
                                <input
                                  type="radio"
                                  name="add_main"
                                  className="mt-1 accent-primary"
                                  checked={addMainIndex === i}
                                  onChange={() => setAddMainIndex(i)}
                                />
                                <span className="min-w-0">
                                  <span className="font-medium">{f.name}</span>
                                  <span className="block text-xs text-muted-foreground">
                                    Original · {formatFileSize(f.size)}
                                  </span>
                                </span>
                              </label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => removeStagedFile(i)}
                                aria-label={`Remove ${f.name} from batch`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">
                                Display title{' '}
                                <span className="text-destructive">*</span> (max 50)
                              </Label>
                              <Input
                                maxLength={50}
                                className="text-sm"
                                value={addTitles[i] ?? ''}
                                onChange={(e) => {
                                  const next = [...addTitles];
                                  next[i] = e.target.value;
                                  setAddTitles(next);
                                }}
                                placeholder="Shown in preview and lists"
                              />
                              <p className="text-[11px] text-muted-foreground">
                                {(addTitles[i] ?? '').length}/50
                              </p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">
                                Note (optional)
                              </Label>
                              <Textarea
                                rows={2}
                                className="text-sm"
                                value={addDescs[i] ?? ''}
                                onChange={(e) => {
                                  const next = [...addDescs];
                                  next[i] = e.target.value;
                                  setAddDescs(next);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-lg"
                        disabled={addAttachmentsMutation.isPending}
                        onClick={() => void submitAddFiles()}
                      >
                        {addAttachmentsMutation.isPending
                          ? 'Uploading…'
                          : 'Upload files'}
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-4">
                {attachments.map((att) => (
                  <AttachmentOwnerRow
                    key={att.id}
                    att={att}
                    canRemove={attachments.length > 1}
                    busy={
                      patchAttachmentMutation.isPending ||
                      deleteAttachmentMutation.isPending
                    }
                    onSetMain={() =>
                      void patchAttachmentMutation.mutateAsync({
                        attachmentId: att.id,
                        body: { is_main: true },
                      })
                    }
                    onSaveFileDetails={({ title, description }) =>
                      void patchAttachmentMutation.mutateAsync({
                        attachmentId: att.id,
                        body: { title, description },
                      })
                    }
                    onRemove={() => setRemoveAttachmentId(att.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-destructive/20 bg-destructive/5 py-0 shadow-none">
            <CardHeader className="py-4">
              <CardTitle className="text-base text-destructive">
                Remove from library
              </CardTitle>
              <CardDescription className="text-xs">
                Hide removes the document from lists. Permanent delete removes
                all stored files (cannot be undone).
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 pb-4">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => setSoftDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hide document
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="rounded-lg"
                onClick={() => setPermanentDeleteOpen(true)}
              >
                Delete permanently
              </Button>
            </CardContent>
          </Card>

          <ConfirmationModal
            open={softDeleteOpen}
            onOpenChange={setSoftDeleteOpen}
            onConfirm={() => void handleSoftDelete()}
            title="Hide this document?"
            description="It will disappear from your library. Your organization may still be able to restore it if needed."
            confirmText="Hide document"
            variant="destructive"
          />

          <ConfirmationModal
            open={permanentDeleteOpen}
            onOpenChange={setPermanentDeleteOpen}
            onConfirm={() => void handlePermanentDelete()}
            title="Permanently delete?"
            description="This removes the document and every file from storage. This cannot be undone."
            confirmText="Delete forever"
            variant="destructive"
          />

          <ConfirmationModal
            open={!!removeAttachmentId}
            onOpenChange={(o) => !o && setRemoveAttachmentId(null)}
            onConfirm={async () => {
              if (!removeAttachmentId) return;
              await deleteAttachmentMutation.mutateAsync(removeAttachmentId);
              setRemoveAttachmentId(null);
            }}
            title="Remove this file?"
            description="The file will be deleted from storage. Other files in this document stay."
            confirmText="Remove file"
            variant="destructive"
          />
        </>
      ) : null}
    </div>
  );
};

function AttachmentOwnerRow({
  att,
  canRemove,
  busy,
  onSetMain,
  onSaveFileDetails,
  onRemove,
}: {
  att: DocumentAttachment;
  canRemove: boolean;
  busy: boolean;
  onSetMain: () => void;
  onSaveFileDetails: (payload: { title: string; description: string }) => void;
  onRemove: () => void;
}) {
  const [localTitle, setLocalTitle] = useState(att.title ?? '');
  const [localDesc, setLocalDesc] = useState(att.description ?? '');

  useEffect(() => {
    setLocalTitle(att.title ?? '');
    setLocalDesc(att.description ?? '');
  }, [att.id, att.title, att.description]);

  const handleSaveDetails = () => {
    const t = localTitle.trim();
    if (!t) {
      toast.error('Display title is required (1–50 characters).');
      return;
    }
    if (t.length > 50) {
      toast.error('Title cannot exceed 50 characters.');
      return;
    }
    onSaveFileDetails({ title: t, description: localDesc.trim() });
  };

  return (
    <div className="rounded-lg border border-border/60 bg-muted/10 p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="min-w-0 break-all font-medium">
          {attachmentDisplayTitle(att)}
        </span>
        {att.is_main ? (
          <Badge variant="secondary" className="text-[10px]">
            Main
          </Badge>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-md text-xs"
            disabled={busy}
            onClick={onSetMain}
          >
            Set as main
          </Button>
        )}
      </div>
      <div className="mt-2 space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">
            Display title <span className="text-destructive">*</span> (max 50)
          </Label>
          <Input
            maxLength={50}
            className="text-sm"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">
            {localTitle.length}/50
          </p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">File note (optional)</Label>
          <Textarea
            rows={2}
            className="text-sm"
            value={localDesc}
            onChange={(e) => setLocalDesc(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="rounded-lg"
            disabled={busy}
            onClick={handleSaveDetails}
          >
            Save file details
          </Button>
          {canRemove ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="rounded-lg text-destructive hover:text-destructive"
              disabled={busy}
              onClick={onRemove}
            >
              Remove file
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
