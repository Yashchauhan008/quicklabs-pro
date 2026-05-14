import { useMemo, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Wrench } from "lucide-react";
import { useGetTools } from "@/hooks/useTools";
import { ROUTES } from "@/config";
import { getFileUrl } from "@/utils/fileUrl";
import { cn } from "@/lib/utils";

function ToolRailItem({
  title,
  logoUrl,
  link,
}: {
  title: string;
  logoUrl: string;
  link: string;
}) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full flex-col items-center gap-2.5 border-b border-white/15 px-1 py-5 transition-colors hover:bg-white/10"
    >
      <div className="shrink-0">
        {logoUrl ? (
          <img
            src={getFileUrl(logoUrl)}
            alt=""
            className="h-8 w-8 rounded-lg -rotate-90 object-cover ring-1 ring-white/25"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
            <Wrench className="h-4 w-4 text-violet-100" />
          </div>
        )}
      </div>
      <span
        className={cn(
          "max-h-36 text-balance text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/95",
          "[writing-mode:vertical-rl] [text-orientation:mixed] rotate-180",
        )}
        title={title}
      >
        {title}
      </span>
    </a>
  );
}

export function ToolsInfiniteRail() {
  const { data, isLoading } = useGetTools({ page: 1, limit: 40 });
  const tools = data?.data ?? [];

  const { loopA, loopB, durationSec } = useMemo(() => {
    if (tools.length === 0) {
      return {
        loopA: [] as typeof tools,
        loopB: [] as typeof tools,
        durationSec: 40,
      };
    }
    const durationSec = Math.min(90, Math.max(28, tools.length * 3.5));
    return {
      loopA: tools,
      loopB: tools,
      durationSec,
    };
  }, [tools]);

  return (
    <aside
      className={cn(
        "relative z-20 hidden w-13 shrink-0 overflow-hidden",
        "border-l border-violet-400/35 bg-linear-to-b from-violet-700 via-indigo-800 to-indigo-950",
        "shadow-[-6px_0_24px_-8px_rgba(79,70,229,0.45)]",
        "lg:flex lg:flex-col",
      )}
      aria-label="QuickLabs tools"
    >
      <div className="flex shrink-0 flex-col items-center gap-1 border-b border-white/15 py-2">
        <Link
          to={ROUTES.EXPLORE_TOOLS}
          className="flex flex-col items-center gap-1 rounded-md p-1 text-violet-100 transition hover:bg-white/10 hover:text-white"
          title="All tools"
        >
          <ExternalLink
            className="h-3.5 w-3.5 shrink-0 rotate-90"
            aria-hidden
          />
          <span
            className={cn(
              "text-[9px] font-bold uppercase tracking-[0.35em] text-white/90",
              "[writing-mode:vertical-rl] [text-orientation:mixed] rotate-180",
            )}
          >
            Tools
          </span>
        </Link>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-6 animate-pulse rounded bg-white/10"
              />
            ))}
          </div>
        ) : loopA.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-2 text-center">
            <span
              className={cn(
                "text-[9px] font-medium text-white/70",
                "[writing-mode:vertical-rl] [text-orientation:mixed] rotate-180",
              )}
            >
              None yet
            </span>
          </div>
        ) : (
          <div
            className="animate-tools-infinite-marquee-y flex flex-col"
            style={
              {
                "--tools-marquee-duration": `${durationSec}s`,
              } as CSSProperties
            }
          >
            <div className="flex flex-col">
              {loopA.map((tool, i) => (
                <ToolRailItem
                  key={`a-${tool.id}-${i}`}
                  title={tool.title}
                  logoUrl={tool.logo_url ?? ""}
                  link={tool.link}
                />
              ))}
            </div>
            <div className="flex flex-col">
              {loopB.map((tool, i) => (
                <ToolRailItem
                  key={`b-${tool.id}-${i}`}
                  title={tool.title}
                  logoUrl={tool.logo_url ?? ""}
                  link={tool.link}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
