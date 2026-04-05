import { useEffect, useRef } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from '@/types/user.type';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/utils/formate';
import { Plus, Trash2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  socialProfilesFormSchema,
  type SocialProfilesFormValues,
} from '@/schema/social';
import {
  useDeleteStudentProfilePicture,
  usePatchStudentProfile,
  useUploadStudentProfilePicture,
} from '@/hooks/useStudentFeatures';
import { isStudentRole } from '@/utils/roles';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/shared/UserAvatar';

type Props = { user: User };

export function ProfileEditPanel({ user }: Props) {
  const patchSocial = usePatchStudentProfile();
  const uploadPicture = useUploadStudentProfilePicture();
  const deletePicture = useDeleteStudentProfilePicture();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isStudent = isStudentRole(user?.role);

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

  const onSaveSocial = socialForm.handleSubmit((values) => {
    const cleaned = values.profiles
      .map((p) => ({
        key: p.key.trim(),
        value: p.value.trim(),
      }))
      .filter((p) => p.key && p.value)
      .slice(0, 30);
    patchSocial.mutate(cleaned);
  });

  return (
    <div className="mx-auto mt-12 max-w-2xl space-y-8 border-t border-border/60 pt-10">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Edit profile</h2>
        <p className="text-sm text-muted-foreground">
          Photo and links are visible to other students on your public profile.
        </p>
      </div>

      <Card className="overflow-hidden border-0 shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b bg-muted/30 pb-4">
          <UserAvatar
            profilePictureUrl={user.profile_picture_url}
            name={user.name}
            size="lg"
            className="rounded-2xl"
          />
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
            {user.role ? (
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Full name
            </Label>
            <p className="text-sm font-medium">{user.name}</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Email
            </Label>
            <p className="text-sm font-medium">{user.email}</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Member since
            </Label>
            <p className="text-sm font-medium">{formatDate(user.created_at)}</p>
          </div>
        </CardContent>
      </Card>

      {!isStudent && user.social_profiles && user.social_profiles.length > 0 ? (
        <Card className="border-0 shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-lg">Public links</CardTitle>
            <CardDescription>Shown on your profile when available.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.social_profiles.map((p) => (
              <div key={`${p.key}-${p.value}`} className="text-sm">
                <span className="font-medium">{p.key}: </span>
                <a
                  href={p.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-primary hover:underline"
                >
                  {p.value}
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {isStudent ? (
        <Card className="border-0 shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-lg">Profile photo</CardTitle>
            <CardDescription>
              JPG, PNG, WebP, or other common image formats. Max 5MB.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) void uploadPicture.mutateAsync(f);
              }}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                disabled={uploadPicture.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadPicture.isPending ? 'Uploading…' : 'Upload photo'}
              </Button>
              {user.profile_picture_url ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-muted-foreground"
                  disabled={deletePicture.isPending}
                  onClick={() => void deletePicture.mutateAsync()}
                >
                  {deletePicture.isPending ? 'Removing…' : 'Remove photo'}
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {isStudent ? (
        <Card className="border-0 shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Link2 className="h-5 w-5" />
              Social & portfolio links
            </CardTitle>
            <CardDescription>
              Labels (GitHub, LinkedIn, portfolio…). Max 30. Empty rows are
              ignored.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSaveSocial} className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col gap-2 sm:flex-row sm:items-end"
                >
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input
                        placeholder="e.g. GitHub"
                        {...socialForm.register(`profiles.${index}.key`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">URL or handle</Label>
                      <Input
                        placeholder="https://…"
                        {...socialForm.register(`profiles.${index}.value`)}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => remove(index)}
                    aria-label="Remove row"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
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
                  disabled={patchSocial.isPending || fields.length === 0}
                  className="rounded-lg"
                >
                  {patchSocial.isPending ? 'Saving…' : 'Save links'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
