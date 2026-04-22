import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/config';
import { isStudentRole } from '@/utils/roles';
import {
  useDeleteStudentProfilePicture,
  useUploadStudentProfilePicture,
} from '@/hooks/useStudentFeatures';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/shared/UserAvatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';
import { Camera, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/formate';

export function ProfileEditPage() {
  const { user } = useAuth();
  const uploadPicture = useUploadStudentProfilePicture();
  const deletePicture = useDeleteStudentProfilePicture();
  const [pictureDialogOpen, setPictureDialogOpen] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isStudent = isStudentRole(user?.role);

  if (!user) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed bg-card/50">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-12">
      <div>
        <Button variant="ghost" asChild className="mb-2 -ml-2 h-9 rounded-lg text-muted-foreground">
          <Link to={ROUTES.PROFILE} className="inline-flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to profile
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit profile</h1>
        <p className="mt-1 text-muted-foreground">
          Update how you appear to other learners — photo, bio, school details, and links.
        </p>
      </div>

      <Card className="overflow-hidden border-0 shadow-md ring-1 ring-black/4 dark:ring-white/6">
        <CardHeader className="flex flex-row items-start gap-4 space-y-0 border-b bg-muted/30 pb-4">
          <div className="relative">
            <UserAvatar
              profilePictureUrl={user.profile_picture_url}
              name={user.name}
              size="lg"
              className="h-20 w-20 rounded-2xl text-2xl"
            />
            {isStudent ? (
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full border shadow"
                onClick={() => setPictureDialogOpen(true)}
                aria-label="Update profile picture"
              >
                <Camera className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <CardDescription className="break-all">{user.email}</CardDescription>
            {user.role ? (
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
            ) : null}
            {user.created_at ? (
              <p className="text-xs text-muted-foreground">
                Member since {formatDate(user.created_at)}
              </p>
            ) : null}
          </div>
        </CardHeader>
        {isStudent ? (
          <CardContent className="pt-4 text-sm text-muted-foreground">
            Tap the camera button to change your profile photo. JPG, PNG, or WebP up to 5MB.
          </CardContent>
        ) : null}
      </Card>

      {isStudent ? (
        <>
          <Dialog open={pictureDialogOpen} onOpenChange={setPictureDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Update profile picture</DialogTitle>
                <DialogDescription>Upload a new image or remove your current one.</DialogDescription>
              </DialogHeader>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (f) {
                    void uploadPicture.mutateAsync(f).then(() => setPictureDialogOpen(false));
                  }
                }}
              />
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
                <UserAvatar
                  profilePictureUrl={user.profile_picture_url}
                  name={user.name}
                  size="md"
                  className="h-12 w-12 rounded-xl"
                />
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WebP up to 5MB</p>
                </div>
              </div>
              <DialogFooter className="sm:justify-start">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadPicture.isPending}
                >
                  {uploadPicture.isPending ? 'Uploading…' : 'Upload new photo'}
                </Button>
                {user.profile_picture_url ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-muted-foreground"
                    disabled={deletePicture.isPending}
                    onClick={() => setRemoveConfirmOpen(true)}
                  >
                    {deletePicture.isPending ? 'Removing…' : 'Remove photo'}
                  </Button>
                ) : null}
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <ConfirmationModal
            open={removeConfirmOpen}
            onOpenChange={setRemoveConfirmOpen}
            title="Remove profile photo?"
            description="This will remove your current profile picture from your account."
            confirmText="Remove"
            variant="destructive"
            isProcessing={deletePicture.isPending}
            onConfirm={async () => {
              await deletePicture.mutateAsync();
              setRemoveConfirmOpen(false);
              setPictureDialogOpen(false);
            }}
          />
        </>
      ) : null}

      <Separator className="opacity-60" />

      <ProfileEditForm user={user} />
    </div>
  );
}
