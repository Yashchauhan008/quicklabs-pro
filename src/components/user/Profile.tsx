import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { InstagramProfileLayout } from '@/components/profile/InstagramProfileLayout';
import type { ProfileTab } from '@/utils/profileUrls';
import {
  useDeleteStudentProfilePicture,
  useUploadStudentProfilePicture,
} from '@/hooks/useStudentFeatures';
import { isStudentRole } from '@/utils/roles';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { ROUTES } from '@/config';

export const Profile = () => {
  const { user } = useAuth();
  const uploadPicture = useUploadStudentProfilePicture();
  const deletePicture = useDeleteStudentProfilePicture();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: ProfileTab =
    searchParams.get('tab') === 'subjects' ? 'subjects' : 'documents';

  const setTab = (t: ProfileTab) => {
    if (t === 'subjects') setSearchParams({ tab: 'subjects' });
    else setSearchParams({});
  };

  if (!user) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed bg-card/50">
        <p className="text-sm text-muted-foreground">Loading your profile…</p>
      </div>
    );
  }

  const isStudent = isStudentRole(user?.role);

  return (
    <div className="pb-12">
      <div className="mx-auto mb-4 flex max-w-3xl justify-end px-0">
        <Button asChild variant="outline" size="sm" className="rounded-lg">
          <Link to={ROUTES.PROFILE_EDIT}>
            <Pencil className="mr-2 h-4 w-4" />
            {isStudent ? 'Edit profile' : 'Account details'}
          </Link>
        </Button>
      </div>
      <InstagramProfileLayout
        userId={user.id}
        name={user.name}
        profilePictureUrl={user.profile_picture_url}
        email={user.email}
        role={user.role}
        socialProfiles={user.social_profiles}
        bio={user.bio}
        batchYear={user.batch_year}
        semester={user.semester}
        universityName={user.university_name}
        universityLogoUrl={user.university_logo_url}
        branchName={user.branch_name}
        createdAt={user.created_at}
        totalCourses={user.total_courses}
        totalMaterials={user.total_files}
        tab={tab}
        onTabChange={setTab}
        canEditProfilePicture={isStudent}
        isUploadingPicture={uploadPicture.isPending}
        isRemovingPicture={deletePicture.isPending}
        onUploadProfilePicture={async (file) => {
          await uploadPicture.mutateAsync(file);
        }}
        onRemoveProfilePicture={async () => {
          await deletePicture.mutateAsync();
        }}
      />
    </div>
  );
};
