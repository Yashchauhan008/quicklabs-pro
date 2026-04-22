import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/config';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetPeerProfile,
  useListBookmarkedPeers,
  usePinPeer,
  useRatePeer,
  useUnpinPeer,
} from '@/hooks/useStudentFeatures';
import { useAuth } from '@/context/AuthContext';
import { isStudentRole } from '@/utils/roles';
import { StarPicker } from '@/components/shared/StarPicker';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { InstagramProfileLayout } from '@/components/profile/InstagramProfileLayout';
import type { ProfileTab } from '@/utils/profileUrls';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';

export const PeerProfilePage = () => {
  const { peerId } = useParams<{ peerId: string }>();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: ProfileTab =
    searchParams.get('tab') === 'subjects' ? 'subjects' : 'documents';

  const setTab = (t: ProfileTab) => {
    if (t === 'subjects') setSearchParams({ tab: 'subjects' });
    else setSearchParams({});
  };

  const { data: peer, isLoading, isError } = useGetPeerProfile(peerId);
  const { data: bookmarks = [] } = useListBookmarkedPeers();
  const rateMutation = useRatePeer(peerId);
  const pinMutation = usePinPeer();
  const unpinMutation = useUnpinPeer();
  const [stars, setStars] = useState(0);
  const [unpinConfirmOpen, setUnpinConfirmOpen] = useState(false);

  const isStudent = isStudentRole(user?.role);
  const isSelf = !!user?.id && user.id === peerId;
  const canRatePeer = isStudent && !!peerId && !isSelf;
  const isPinned =
    !!peerId && bookmarks.some((b) => b.id === peerId);
  const pinBusy =
    (pinMutation.isPending && pinMutation.variables === peerId) ||
    (unpinMutation.isPending && unpinMutation.variables === peerId);

  if (!peerId) {
    return <p className="text-muted-foreground">Missing peer id</p>;
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="mx-auto h-36 w-36 rounded-full" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !peer) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <p className="text-destructive">Could not load this profile.</p>
        <Button asChild variant="outline" className="rounded-lg">
          <Link to={isStudent ? ROUTES.PEERS : ROUTES.DASHBOARD}>
            {isStudent ? 'Back to peers' : 'Home'}
          </Link>
        </Button>
      </div>
    );
  }

  const hasRatedThisPeer =
    peer.my_rating_stars != null &&
    peer.my_rating_stars >= 1 &&
    peer.my_rating_stars <= 5;

  const headerActions =
    isStudent && !isSelf && peerId ? (
      isPinned ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg"
          disabled={pinBusy}
          onClick={() => setUnpinConfirmOpen(true)}
        >
          <BookmarkCheck className="mr-2 h-4 w-4" />
          {pinBusy ? 'Updating…' : 'Unpin'}
        </Button>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="rounded-lg"
          disabled={pinBusy}
          onClick={() => pinMutation.mutate(peerId)}
        >
          <Bookmark className="mr-2 h-4 w-4" />
          {pinBusy ? 'Saving…' : 'Pin'}
        </Button>
      )
    ) : null;

  return (
    <div className="space-y-8 pb-12">
      <Button variant="ghost" asChild className="-ml-2 rounded-lg text-muted-foreground">
        <Link to={isStudent ? ROUTES.PEERS : ROUTES.DASHBOARD}>
          {isStudent ? '← Peers' : '← Home'}
        </Link>
      </Button>

      <InstagramProfileLayout
        userId={peer.id}
        name={peer.name}
        profilePictureUrl={peer.profile_picture_url}
        socialProfiles={peer.social_profiles}
        bio={peer.bio}
        batchYear={peer.batch_year}
        semester={peer.semester}
        universityName={peer.university_name}
        universityLogoUrl={peer.university_logo_url}
        branchName={peer.branch_name}
        createdAt={peer.created_at}
        ratingAvg={peer.rating_avg}
        ratingCount={peer.rating_count}
        totalCourses={peer.total_courses}
        totalMaterials={peer.total_files}
        tab={tab}
        onTabChange={setTab}
        headerActions={headerActions}
      />
      <ConfirmationModal
        open={unpinConfirmOpen}
        onOpenChange={setUnpinConfirmOpen}
        title="Unpin this user?"
        description="This peer will be removed from your pinned list."
        confirmText="Unpin"
        variant="destructive"
        isProcessing={pinBusy}
        onConfirm={async () => {
          await unpinMutation.mutateAsync(peerId);
          setUnpinConfirmOpen(false);
        }}
      />

      {canRatePeer && !hasRatedThisPeer ? (
        <Card className="mx-auto max-w-3xl border-0 shadow-md ring-1 ring-black/4 dark:ring-white/6">
          <CardHeader>
            <CardTitle className="text-lg">Rate this student</CardTitle>
            <CardDescription>
              One rating per pair. You can&apos;t rate yourself.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StarPicker
              value={stars}
              onChange={setStars}
              disabled={rateMutation.isPending}
            />
            <Button
              type="button"
              disabled={stars < 1 || rateMutation.isPending}
              className="rounded-lg"
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

      {isSelf ? (
        <p className="mx-auto max-w-3xl text-center text-sm text-muted-foreground">
          This is you. Edit photo and links on your{' '}
          <Link
            to={ROUTES.PROFILE}
            className="font-medium text-primary hover:underline"
          >
            Profile
          </Link>{' '}
          page (sidebar → Profile).
        </p>
      ) : null}
    </div>
  );
};
