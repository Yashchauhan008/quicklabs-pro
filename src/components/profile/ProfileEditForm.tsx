import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/types/user.type';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  socialProfilesFormSchema,
  type SocialProfilesFormValues,
} from '@/schema/social';
import { usePatchStudentProfile } from '@/hooks/useStudentFeatures';
import { isStudentRole } from '@/utils/roles';
import { useGetBranches, useGetUniversities } from '@/hooks/useAcademicMeta';
import { BIO_MAX_WORDS, countWords, truncateToMaxWords } from '@/utils/bio';
import { ROUTES } from '@/config';

type Props = { user: User };

export function ProfileEditForm({ user }: Props) {
  const navigate = useNavigate();
  const patchProfile = usePatchStudentProfile();
  const isStudent = isStudentRole(user?.role);
  const [bio, setBio] = useState(user.bio ?? '');
  const [batchYear, setBatchYear] = useState(
    user.batch_year != null ? String(user.batch_year) : '',
  );
  const [semester, setSemester] = useState(
    user.semester != null ? String(user.semester) : '',
  );
  const [universityId, setUniversityId] = useState(user.university_id ?? '');
  const [branchId, setBranchId] = useState(user.branch_id ?? '');

  const { data: universitiesData } = useGetUniversities({ page: 1, limit: 500 });
  const { data: branchesData } = useGetBranches({
    page: 1,
    limit: 500,
  });

  const socialForm = useForm<SocialProfilesFormValues>({
    resolver: zodResolver(socialProfilesFormSchema),
    defaultValues: { profiles: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: socialForm.control,
    name: 'profiles',
  });

  useEffect(() => {
    if (!user?.social_profiles?.length) {
      socialForm.reset({ profiles: [{ key: '', value: '' }] });
      return;
    }
    socialForm.reset({
      profiles: user.social_profiles.map((p) => ({
        key: p.key,
        value: p.value,
      })),
    });
  }, [user?.social_profiles, socialForm]);

  useEffect(() => {
    setBio(user.bio ?? '');
    setBatchYear(user.batch_year != null ? String(user.batch_year) : '');
    setSemester(user.semester != null ? String(user.semester) : '');
    setUniversityId(user.university_id ?? '');
    setBranchId(user.branch_id ?? '');
  }, [user.bio, user.batch_year, user.semester, user.university_id, user.branch_id]);

  const onSave = socialForm.handleSubmit((values) => {
    if (!isStudent) return;
    if (countWords(bio) > BIO_MAX_WORDS) return;
    const cleaned = values.profiles
      .map((p) => ({
        key: p.key.trim(),
        value: p.value.trim(),
      }))
      .filter((p) => p.key && p.value)
      .slice(0, 30);
    let batch: number | null = null;
    if (batchYear.trim()) {
      const n = Number(batchYear);
      batch = Number.isFinite(n) ? n : null;
    }
    let sem: number | null = null;
    if (semester.trim()) {
      const n = Number(semester);
      sem = Number.isFinite(n) ? n : null;
    }
    patchProfile.mutate(
      {
        social_profiles: cleaned,
        bio: bio.trim() ? bio.trim() : null,
        batch_year: batch,
        semester: sem,
        university_id: universityId || null,
        branch_id: branchId || null,
      },
      {
        onSuccess: () => {
          navigate(ROUTES.PROFILE);
        },
      },
    );
  });

  if (!isStudent) {
    return (
      <Card className="border-0 shadow-md ring-1 ring-black/4 dark:ring-white/6">
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
          <CardDescription>
            Your name and email are managed by your sign-in provider. For changes,
            contact support.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Name: </span>
            {user.name}
          </p>
          <p>
            <span className="text-muted-foreground">Email: </span>
            {user.email}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md ring-1 ring-black/4 dark:ring-white/6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5" />
          Profile details
        </CardTitle>
        <CardDescription>
          Bio (max {BIO_MAX_WORDS} words), university, batch, semester, and links — all
          saved together. Max 30 links; empty rows are ignored.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSave} className="space-y-7">
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="edit-bio" className="text-sm font-medium">
                Bio
              </Label>
              <span
                className={
                  countWords(bio) > BIO_MAX_WORDS
                    ? 'text-xs font-medium text-destructive'
                    : 'text-xs text-muted-foreground'
                }
              >
                {countWords(bio)} / {BIO_MAX_WORDS} words
              </span>
            </div>
            <Textarea
              id="edit-bio"
              rows={5}
              value={bio}
              onChange={(e) => {
                const v = e.target.value;
                setBio(
                  countWords(v) > BIO_MAX_WORDS ? truncateToMaxWords(v, BIO_MAX_WORDS) : v,
                );
              }}
              placeholder="Tell peers about your focus, skills, or interests. Line breaks are kept."
              className="h-30 max-h-30 resize-none overflow-y-auto leading-6"
            />
          </section>

          <section className="space-y-3 border-t border-border/50 pt-5">
            <p className="text-sm font-medium">Academic details</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-batch">Batch year</Label>
                <Input
                  id="edit-batch"
                  value={batchYear}
                  onChange={(e) => setBatchYear(e.target.value)}
                  placeholder="e.g. 2026"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-sem">Semester</Label>
                <select
                  id="edit-sem"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                >
                  <option value="">Not set</option>
                  <option value="0">Passout</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const semValue = String(i + 1);
                    return (
                      <option key={semValue} value={semValue}>
                        Semester {semValue}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-uni">University</Label>
                <select
                  id="edit-uni"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={universityId}
                  onChange={(e) => {
                    setUniversityId(e.target.value);
                    setBranchId('');
                  }}
                >
                  <option value="">Not set</option>
                  {(universitiesData?.items ?? []).map((uni) => (
                    <option key={uni.id} value={uni.id}>
                      {uni.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-branch">Branch</Label>
                <select
                  id="edit-branch"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                >
                  <option value="">Not set</option>
                  {(branchesData?.items ?? []).map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-border/50 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Social & portfolio links</p>
              <p className="text-xs text-muted-foreground">{fields.length} / 30 links</p>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-border/60 bg-muted/15 p-3 sm:p-4"
              >
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Label</Label>
                    <Input
                      placeholder="e.g. GitHub"
                      {...socialForm.register(`profiles.${index}.key`)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">URL or handle</Label>
                    <Input
                      placeholder="https://…"
                      {...socialForm.register(`profiles.${index}.value`)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 justify-self-end text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => remove(index)}
                    aria-label="Remove row"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </section>

          <div className="flex flex-wrap gap-2 border-t border-border/50 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={fields.length >= 30}
              onClick={() => append({ key: '', value: '' })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add link
            </Button>
            <Button
              type="submit"
              disabled={patchProfile.isPending}
              className="rounded-lg"
            >
              {patchProfile.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
