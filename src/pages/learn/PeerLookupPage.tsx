import { useState } from 'react';
import { useNavigate, Link, generatePath } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ROUTES } from '@/config';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { isStudentRole } from '@/utils/roles';
import {
  useListBookmarkedPeers,
  useUnpinPeer,
} from '@/hooks/useStudentFeatures';
import { Bookmark, Star, ChevronDown, ChevronRight } from 'lucide-react';
import { UserAvatar } from '@/components/shared/UserAvatar';
import type { BookmarkedPeer } from '@/types/student';

const uuidRe =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatPinnedAt(iso: string) {
  try {
    return format(parseISO(iso), 'MMM d, yyyy · h:mm a');
  } catch {
    return iso;
  }
}

function BookmarkRow({
  peer,
  onUnpin,
  unpinning,
}: {
  peer: BookmarkedPeer;
  onUnpin: () => void;
  unpinning: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <UserAvatar
          profilePictureUrl={peer.profile_picture_url}
          name={peer.name}
          size="md"
          className="rounded-xl"
        />
        <div className="min-w-0">
          <p className="font-semibold leading-tight">{peer.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Pinned {formatPinnedAt(peer.pinned_at)}
          </p>
          {peer.rating_count != null && peer.rating_count > 0 ? (
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {Number(peer.rating_avg ?? 0).toFixed(1)} · {peer.rating_count}{' '}
              rating{peer.rating_count === 1 ? '' : 's'}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">No ratings yet</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
        <Button variant="outline" size="sm" className="rounded-lg" asChild>
          <Link to={generatePath(ROUTES.PEER_PROFILE, { peerId: peer.id })}>
            View profile
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-lg text-muted-foreground"
          disabled={unpinning}
          onClick={onUnpin}
        >
          {unpinning ? 'Removing…' : 'Unpin'}
        </Button>
      </div>
    </div>
  );
}

export const PeerLookupPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: bookmarks, isLoading, isError } = useListBookmarkedPeers();
  const unpinMutation = useUnpinPeer();

  const [showIdLookup, setShowIdLookup] = useState(false);
  const [raw, setRaw] = useState('');
  const [lookupError, setLookupError] = useState('');

  const isStudent = isStudentRole(user?.role);

  const handleGoById = () => {
    const id = raw.trim();
    if (!uuidRe.test(id)) {
      setLookupError('Enter a valid student user id (UUID).');
      return;
    }
    setLookupError('');
    navigate(generatePath(ROUTES.PEER_PROFILE, { peerId: id }));
  };

  if (!isStudent) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Peers</CardTitle>
            <CardDescription>
              The peer directory is available to student accounts.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Button variant="ghost" asChild className="mb-2 -ml-2 rounded-lg">
          <Link to={ROUTES.DASHBOARD}>← Home</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Peers</h1>
        <p className="mt-1 text-muted-foreground">
          Students you pin appear here (newest first). Pin someone from their
          profile after you open them from a material or shared link.
        </p>
      </div>

      <Card className="border-0 shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bookmark className="h-5 w-5" />
            Pinned peers
          </CardTitle>
          <CardDescription>
            Quick access to profiles you bookmarked.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          )}

          {isError && (
            <p className="text-sm text-destructive">
              Could not load pinned peers. Try again later.
            </p>
          )}

          {!isLoading && !isError && bookmarks && bookmarks.length === 0 && (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 px-4 py-8 text-center">
              <p className="text-sm font-medium text-foreground">
                No pinned peers yet
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Open a student profile (for example from an uploader link on a
                material), then use <strong>Pin peer</strong> on their page.
              </p>
            </div>
          )}

          {!isLoading &&
            !isError &&
            bookmarks &&
            bookmarks.map((peer) => (
              <BookmarkRow
                key={peer.id}
                peer={peer}
                unpinning={
                  unpinMutation.isPending && unpinMutation.variables === peer.id
                }
                onUnpin={() => unpinMutation.mutate(peer.id)}
              />
            ))}
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border/60 bg-muted/20">
        <button
          type="button"
          className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setShowIdLookup((v) => !v)}
        >
          {showIdLookup ? (
            <ChevronDown className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
          Open profile by user id (advanced)
        </button>
        {showIdLookup && (
          <div className="space-y-4 border-t border-border/60 px-4 pb-4 pt-3">
            <p className="text-xs text-muted-foreground">
              If you have a UUID (class list, deep link, or uploader id), you can
              open the profile directly. Pin them there to save them to the list
              above.
            </p>
            <div className="space-y-2">
              <Label htmlFor="peer-id">Student user id</Label>
              <Input
                id="peer-id"
                placeholder="00000000-0000-4000-8000-000000000000"
                value={raw}
                onChange={(e) => {
                  setRaw(e.target.value);
                  setLookupError('');
                }}
                className="rounded-lg font-mono text-sm"
              />
              {lookupError && (
                <p className="text-sm text-destructive">{lookupError}</p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={handleGoById}
            >
              View profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
