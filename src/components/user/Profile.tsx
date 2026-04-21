import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { InstagramProfileLayout } from '@/components/profile/InstagramProfileLayout';
import { ProfileEditPanel } from '@/components/profile/ProfileEditPanel';
import type { ProfileTab } from '@/utils/profileUrls';

export const Profile = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: ProfileTab =
    searchParams.get('tab') === 'documents' ? 'documents' : 'subjects';

  const setTab = (t: ProfileTab) => {
    if (t === 'documents') setSearchParams({ tab: 'documents' });
    else setSearchParams({});
  };

  if (!user) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed bg-card/50">
        <p className="text-sm text-muted-foreground">Loading your profile…</p>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <InstagramProfileLayout
        userId={user.id}
        name={user.name}
        profilePictureUrl={user.profile_picture_url}
        email={user.email}
        role={user.role}
        socialProfiles={user.social_profiles}
        createdAt={user.created_at}
        tab={tab}
        onTabChange={setTab}
      />
      <ProfileEditPanel user={user} />
    </div>
  );
};
