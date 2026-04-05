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
  useDeleteDocument,
  useDownloadDocument,
  useGetDocument,
  useUpdateDocument,
} from '@/hooks/useDocuments';
import { useGetSubject } from '@/hooks/useSubjects';
import { useDocumentPreview } from '@/hooks/useDocumentPreview';
import { ROUTES } from '@/config';
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
import { Download, Trash2, FileText, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DOCUMENT_KIND_LABELS } from '@/types/document';
import { useAuth } from '@/context/AuthContext';
import { isStudentRole } from '@/utils/roles';
import { PeerAttributionRow } from '@/components/shared/PeerAttributionRow';
import { pickDocumentUploader } from '@/utils/displayUser';
import { getDocumentPreviewMode } from '@/utils/documentPreview';
import { StarPicker } from '@/components/shared/StarPicker';
import { useRateDocument } from '@/hooks/useStudentFeatures';

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

export const DocumentDetailPage = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromExplore = searchParams.get('from') === 'explore';
  const [softDeleteOpen, setSoftDeleteOpen] = useState(false);
  const [permanentDeleteOpen, setPermanentDeleteOpen] = useState(false);

  const { data: doc, isLoading, isError } = useGetDocument(id);
  const { data: subject } = useGetSubject(doc?.subject_id);
  const updateMutation = useUpdateDocument(id ?? '');
  const deleteMutation = useDeleteDocument();
  const downloadMutation = useDownloadDocument();
  const rateMutation = useRateDocument(id);
  const [stars, setStars] = useState(0);

  const previewMode = doc ? getDocumentPreviewMode(doc) : 'none';
  const previewMimeHint = doc
    ? doc.file_mime_type ?? doc.mime_type
    : undefined;
  const previewState = useDocumentPreview(id, previewMode, {
    mimeHint: previewMimeHint,
  });

  const form = useForm<DocumentUpdateFormValues>({
    resolver: zodResolver(documentUpdateSchema),
    defaultValues: {
      title: '',
      description: '',
      visibility: 'PRIVATE',
      kind: 'informational',
    },
  });

  useEffect(() => {
    if (doc) {
      form.reset({
        title: doc.title,
        description: doc.description ?? '',
        visibility: doc.visibility,
        kind: doc.kind ?? 'informational',
      });
    }
  }, [doc, form]);

  const onSaveMetadata = async (values: DocumentUpdateFormValues) => {
    if (!id) return;
    const fd = new FormData();
    fd.append('title', values.title);
    const desc = values.description?.trim();
    if (desc) fd.append('description', desc);
    fd.append('visibility', values.visibility);
    fd.append('kind', values.kind);
    if (values.file) fd.append('file', values.file);
    await updateMutation.mutateAsync(fd);
    form.reset({ ...values, file: undefined });
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

  const handleDownload = async () => {
    if (!id || !doc) return;
    const name =
      doc.original_filename ||
      doc.file_name ||
      `${doc.title.replace(/\s+/g, '_')}`;
    await downloadMutation.mutateAsync({ id, fallbackName: name });
  };

  if (!id) {
    return <p className="text-muted-foreground">Missing file id</p>;
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-9 w-2/3 max-w-md" />
        <Skeleton className="h-[320px] w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !doc) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">This file could not be found.</p>
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

  const displayName =
    doc.original_filename || doc.file_name || doc.title || '—';

  return (
    <div className="mx-auto max-w-5xl space-y-6">
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
            {doc.download_count != null ? (
              <span className="text-xs text-muted-foreground">
                {doc.download_count} downloads
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
              Downloads count toward a daily limit (UTC midnight reset). Preview
              loads the file once for viewing.
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
          onClick={() => void handleDownload()}
          disabled={downloadMutation.isPending}
        >
          <Download className="mr-2 h-4 w-4" />
          {downloadMutation.isPending ? 'Downloading…' : 'Download'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-md ring-1 ring-black/5 dark:bg-card/95 dark:ring-white/10">
            <div className="flex items-center gap-2 border-b border-border/50 bg-gradient-to-r from-muted/50 to-muted/25 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold tracking-tight">Preview</h2>
                <p className="text-[11px] text-muted-foreground">
                  In-browser view — download only from the button above
                </p>
              </div>
            </div>
            <DocumentPreviewPanel
              mode={previewMode}
              state={previewState}
              documentTitle={doc.title}
            />
          </section>

          {doc.description?.trim() ? (
            <section className="rounded-xl border border-border/60 bg-card/80 px-4 py-3 text-sm shadow-sm ring-1 ring-black/4 dark:ring-white/6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </h3>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed text-foreground/90">
                {doc.description}
              </p>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm ring-1 ring-black/4 dark:ring-white/6">
            <h3 className="text-sm font-semibold">File details</h3>
            <dl className="mt-3 space-y-2.5">
              <MetaRow label="Filename">{displayName}</MetaRow>
              {doc.file_size != null ? (
                <MetaRow label="Size">{formatFileSize(doc.file_size)}</MetaRow>
              ) : null}
              {doc.mime_type ? (
                <MetaRow label="Type">{doc.mime_type}</MetaRow>
              ) : null}
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
            </dl>
          </div>
        </aside>
      </div>

      {canRateDoc ? (
        <Card className="gap-0 border border-border/60 py-0 shadow-sm ring-1 ring-black/4 dark:ring-white/6">
          <CardHeader className="border-b border-border/50 py-4">
            <CardTitle className="text-base">Rate this file</CardTitle>
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
              <CardTitle className="text-base">Edit details</CardTitle>
              <CardDescription className="text-xs">
                Only you can change this file. Update metadata or replace the
                file.
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
                  <Label htmlFor="description">Description</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="file">Replace file (optional)</Label>
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
                          onChange(f ?? undefined);
                        }}
                      />
                    )}
                  />
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

          <Card className="border border-destructive/20 bg-destructive/5 py-0 shadow-none">
            <CardHeader className="py-4">
              <CardTitle className="text-base text-destructive">
                Remove from library
              </CardTitle>
              <CardDescription className="text-xs">
                Hide removes the file from lists. Permanent delete removes the
                stored file (cannot be undone).
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
                Hide file
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
            title="Hide this file?"
            description="It will disappear from your library. Your organization may still be able to restore it if needed."
            confirmText="Hide file"
            variant="destructive"
          />

          <ConfirmationModal
            open={permanentDeleteOpen}
            onOpenChange={setPermanentDeleteOpen}
            onConfirm={() => void handlePermanentDelete()}
            title="Permanently delete?"
            description="This removes the database row and the file from storage. This cannot be undone."
            confirmText="Delete forever"
            variant="destructive"
          />
        </>
      ) : null}
    </div>
  );
};
