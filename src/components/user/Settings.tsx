import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useCreateBranch,
  useCreateUniversity,
  useDeleteBranch,
  useDeleteUniversity,
  useGetBranches,
  useGetUniversities,
} from '@/hooks/useAcademicMeta';
import { IS_DEVELOPMENT } from '@/config';
import { SlidersHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { resolvePublicFileUrl } from '@/utils/publicFileUrl';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';

export const Settings = () => {
  const [universityName, setUniversityName] = useState('');
  const [universityLogoFile, setUniversityLogoFile] = useState<File | null>(null);
  const [branchName, setBranchName] = useState('');
  const [pendingDeleteUniversity, setPendingDeleteUniversity] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [pendingDeleteBranch, setPendingDeleteBranch] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const universitiesQuery = useGetUniversities({ page: 1, limit: 200 });
  const branchesQuery = useGetBranches({ page: 1, limit: 200 });
  const createUniversity = useCreateUniversity();
  const deleteUniversity = useDeleteUniversity();
  const createBranch = useCreateBranch();
  const deleteBranch = useDeleteBranch();
  const universities = universitiesQuery.data?.items ?? [];
  const branches = branchesQuery.data?.items ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
        <p className="mt-1 text-muted-foreground">
          Tune how QuickLabs Learning works for you
        </p>
      </div>

      <Card className="border-0 shadow-md ring-1 ring-black/4 dark:ring-white/6">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">Learning preferences</CardTitle>
            <CardDescription>
              Notifications, accessibility, and display options will appear
              here.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="rounded-xl border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
            More settings are on the way.
          </p>
        </CardContent>
      </Card>

      {IS_DEVELOPMENT ? (
        <>
          <Card className="border-0 shadow-md ring-1 ring-black/4 dark:ring-white/6">
            <CardHeader>
              <CardTitle className="text-lg">Universities (development)</CardTitle>
              <CardDescription>
                CRUD for academic metadata dictionaries.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  placeholder="Add university"
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUniversityLogoFile(e.target.files?.[0] ?? null)}
                />
                <Button
                  onClick={async () => {
                    if (!universityLogoFile) return;
                    const formData = new FormData();
                    formData.append('name', universityName.trim());
                    formData.append('logo', universityLogoFile);
                    await createUniversity.mutateAsync(formData);
                    setUniversityName('');
                    setUniversityLogoFile(null);
                  }}
                  disabled={
                    !universityName.trim() ||
                    !universityLogoFile ||
                    createUniversity.isPending
                  }
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Name and logo are required when creating a university.
              </p>
              <div className="space-y-2">
                {universities.map((uni) => (
                  <div
                    key={uni.id}
                    className="flex items-center justify-between rounded-md border border-border/60 p-2"
                  >
                    <div className="flex items-center gap-2 text-left text-sm font-medium">
                      {uni.logo_url ? (
                        <img
                          src={resolvePublicFileUrl(uni.logo_url || undefined) ?? undefined}
                          alt={`${uni.name} logo`}
                          className="h-6 w-6 rounded object-cover"
                        />
                      ) : null}
                      <span>{uni.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setPendingDeleteUniversity({ id: uni.id, name: uni.name })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md ring-1 ring-black/4 dark:ring-white/6">
            <CardHeader>
              <CardTitle className="text-lg">Branches (development)</CardTitle>
              <CardDescription>
                Global branch dictionary (not tied to any university).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="Add branch"
                />
                <Button
                  onClick={() =>
                    createBranch
                      .mutateAsync({
                        name: branchName.trim(),
                      })
                      .then(() => setBranchName(''))
                  }
                  disabled={!branchName.trim() || createBranch.isPending}
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Showing all branches.</p>
              <div className="space-y-2">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    className="flex items-center justify-between rounded-md border border-border/60 p-2"
                  >
                    <p className="text-sm font-medium">{branch.name}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setPendingDeleteBranch({ id: branch.id, name: branch.name })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}

      <ConfirmationModal
        open={!!pendingDeleteUniversity}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteUniversity(null);
        }}
        title="Delete university?"
        description={
          pendingDeleteUniversity
            ? `This will delete "${pendingDeleteUniversity.name}" from the dictionary.`
            : 'This will delete this university from the dictionary.'
        }
        confirmText="Delete"
        variant="destructive"
        isProcessing={deleteUniversity.isPending}
        onConfirm={async () => {
          if (!pendingDeleteUniversity) return;
          await deleteUniversity.mutateAsync(pendingDeleteUniversity.id);
          setPendingDeleteUniversity(null);
        }}
      />

      <ConfirmationModal
        open={!!pendingDeleteBranch}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteBranch(null);
        }}
        title="Delete branch?"
        description={
          pendingDeleteBranch
            ? `This will delete "${pendingDeleteBranch.name}" from the dictionary.`
            : 'This will delete this branch from the dictionary.'
        }
        confirmText="Delete"
        variant="destructive"
        isProcessing={deleteBranch.isPending}
        onConfirm={async () => {
          if (!pendingDeleteBranch) return;
          await deleteBranch.mutateAsync(pendingDeleteBranch.id);
          setPendingDeleteBranch(null);
        }}
      />
    </div>
  );
};
