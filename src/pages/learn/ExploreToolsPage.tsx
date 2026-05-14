import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  useGetTools,
  Tool,
  useCreateTool,
  useUpdateTool,
  useDeleteTool,
} from "@/hooks/useTools";
import { Skeleton } from "@/components/ui/skeleton";
import { IS_DEVELOPMENT } from "@/config";
import { toast } from "react-hot-toast";
import axios from "axios";
import { cn } from "@/lib/utils";
import { getFileUrl } from "@/utils/fileUrl";

function getExistingBannerPreviewUrl(editTool: Tool, fileId: string): string {
  const ids = editTool.banner_file_ids ?? [];
  const idx = ids.indexOf(fileId);
  const path = idx >= 0 ? editTool.banner_urls?.[idx] : undefined;
  return path ? getFileUrl(path) : "";
}

const ToolFormModal = ({
  tool,
  trigger,
}: {
  tool?: Tool;
  trigger: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateTool();
  const updateMutation = useUpdateTool();

  const [formData, setFormData] = useState({
    title: tool?.title || "",
    description: tool?.description || "",
    link: tool?.link || "",
    category: tool?.category || "",
    status: tool?.status || ("online" as Tool["status"]),
  });

  const [keptBannerFileIds, setKeptBannerFileIds] = useState<string[]>([]);

  const [previews, setPreviews] = useState<{
    logo: string | null;
    banners: string[];
  }>({
    logo: null,
    banners: [],
  });

  const [files, setFiles] = useState<{
    logo: File | null;
    banners: File[];
  }>({
    logo: null,
    banners: [],
  });

  React.useEffect(() => {
    return () => {
      if (previews.logo) URL.revokeObjectURL(previews.logo);
      previews.banners.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setFormData({
        title: tool?.title || "",
        description: tool?.description || "",
        link: tool?.link || "",
        category: tool?.category || "",
        status: (tool?.status || "online") as Tool["status"],
      });
      setKeptBannerFileIds(
        tool && Array.isArray(tool.banner_file_ids)
          ? [...tool.banner_file_ids]
          : [],
      );
      setFiles({ logo: null, banners: [] });
      setPreviews({ logo: null, banners: [] });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFiles((prev) => ({ ...prev, logo: file }));
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, logo: url }));
    } else {
      setPreviews((prev) => ({ ...prev, logo: null }));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const total =
      keptBannerFileIds.length + files.banners.length + newFiles.length;
    if (total > 5) {
      toast.error("Maximum 5 banner images allowed");
      return;
    }

    const updatedFiles = [...files.banners, ...newFiles];
    setFiles((prev) => ({ ...prev, banners: updatedFiles }));

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => ({
      ...prev,
      banners: [...prev.banners, ...newPreviews],
    }));
  };

  const removeNewBanner = (index: number) => {
    setFiles((prev) => ({
      ...prev,
      banners: prev.banners.filter((_, i) => i !== index),
    }));
    setPreviews((prev) => ({
      ...prev,
      banners: prev.banners.filter((_, i) => i !== index),
    }));
  };

  const removeKeptBanner = (fileId: string) => {
    setKeptBannerFileIds((prev) => prev.filter((id) => id !== fileId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        data.append(key, String(value));
      }
    });

    if (files.logo) data.append("logo", files.logo);
    files.banners.forEach((file) => {
      data.append("banners", file);
    });
    if (tool) {
      data.append("keep_banner_file_ids", JSON.stringify(keptBannerFileIds));
    }

    try {
      if (tool) {
        await updateMutation.mutateAsync({ id: tool.id, formData: data });
        toast.success("Tool updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Tool created successfully");
      }
      setOpen(false);
    } catch (error: unknown) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? String(error.response.data.message)
          : "Something went wrong";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{tool ? "Edit Tool" : "Add New Tool"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. Code Editor Pro"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="What does this tool do?"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                placeholder="e.g. Development"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as Tool["status"],
                  }))
                }
              >
                <option value="online">Online</option>
                <option value="beta">Beta</option>
                <option value="new">New</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Link (URL)</Label>
            <Input
              id="link"
              value={formData.link}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, link: e.target.value }))
              }
              placeholder="https://tool.quicklabs.pro"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Logo Image</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                  {previews.logo || tool?.logo_url ? (
                    <img
                      src={previews.logo || getFileUrl(tool?.logo_url)}
                      alt="Logo preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <Plus className="h-6 w-6" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={handleLogoChange}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-500">
                    Upload a square logo for your tool.
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    PNG, JPG or SVG (max 2MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Banner images ({keptBannerFileIds.length + files.banners.length}
                /5)
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {tool
                  ? keptBannerFileIds.map((fileId) => (
                      <div
                        key={fileId}
                        className="relative group aspect-square overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800"
                      >
                        <img
                          src={getExistingBannerPreviewUrl(tool, fileId)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeKeptBanner(fileId)}
                          className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  : null}
                {previews.banners.map((url, i) => (
                  <div
                    key={`new-${i}`}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800"
                  >
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewBanner(i)}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {keptBannerFileIds.length + files.banners.length < 5 && (
                  <div className="relative aspect-square rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 hover:border-violet-400 hover:text-violet-500 transition-colors dark:border-slate-800 dark:bg-slate-900">
                    <Plus className="h-6 w-6" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={handleBannerChange}
                    />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400">
                Add up to 5 screenshots or marketing banners.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {tool ? "Save Changes" : "Create Tool"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const statusStyles: Record<Tool["status"], string> = {
  online:
    "bg-emerald-500/15 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
  beta: "bg-amber-500/15 text-amber-800 ring-amber-500/25 dark:text-amber-200",
  new: "bg-violet-500/15 text-violet-800 ring-violet-500/25 dark:text-violet-200",
};

const ToolCard = ({ tool }: { tool: Tool }) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const deleteMutation = useDeleteTool();
  const bannerOnlyUrls = (tool.banner_urls ?? []).filter(
    (u): u is string => typeof u === "string" && u.trim().length > 0,
  );
  const heroSlides =
    bannerOnlyUrls.length > 0
      ? bannerOnlyUrls
      : tool.logo_url?.trim()
        ? [tool.logo_url]
        : [];
  const showCarouselNav = bannerOnlyUrls.length > 1;

  React.useEffect(() => {
    setCurrentBanner((prev) =>
      heroSlides.length === 0 ? 0 : Math.min(prev, heroSlides.length - 1),
    );
  }, [tool.id, heroSlides.length]);

  const nextBanner = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!showCarouselNav) return;
    setCurrentBanner((prev) => (prev + 1) % heroSlides.length);
  };

  const prevBanner = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!showCarouselNav) return;
    setCurrentBanner(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  };

  const goToBanner = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!showCarouselNav) return;
    setCurrentBanner(index);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this tool?")) return;
    try {
      await deleteMutation.mutateAsync(tool.id);
      toast.success("Tool deleted");
    } catch {
      toast.error("Failed to delete tool");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="group/card relative h-full"
    >
      <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-0 shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-violet-300/50 hover:shadow-xl hover:shadow-violet-500/10 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-violet-500/30">
        <div className="relative aspect-21/10 min-h-[calc(11rem+100px)] w-full overflow-hidden sm:aspect-24/10">
          {heroSlides.length === 0 ? (
            <div className="flex min-h-[calc(11rem+100px)] w-full items-center justify-center bg-slate-100 dark:bg-slate-900" />
          ) : (
            <motion.div
              className="relative z-0 flex h-full will-change-transform"
              style={{ width: `${heroSlides.length * 100}%` }}
              animate={{ x: `${(-currentBanner * 100) / heroSlides.length}%` }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {heroSlides.map((url, i) => (
                <div
                  key={`${tool.id}-hero-${i}`}
                  className="relative h-full shrink-0 overflow-hidden"
                  style={{ width: `${100 / heroSlides.length}%` }}
                >
                  <img
                    src={getFileUrl(url)}
                    alt=""
                    aria-hidden
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </div>
              ))}
            </motion.div>
          )}
          <div
            className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-slate-950/55 via-slate-950/10 to-transparent"
            aria-hidden
          />

          {IS_DEVELOPMENT && (
            <div className="absolute right-3 top-3 z-5 flex gap-1.5 opacity-0 transition-opacity group-hover/card:opacity-100">
              <ToolFormModal
                tool={tool}
                trigger={
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 rounded-full border-0 bg-white/90 text-slate-800 shadow-md backdrop-blur-sm hover:bg-white dark:bg-slate-900/90 dark:text-slate-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                }
              />
              <Button
                size="icon"
                variant="destructive"
                className="h-9 w-9 rounded-full border-0 bg-red-600/90 shadow-md backdrop-blur-sm hover:bg-red-600"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {showCarouselNav && (
            <div className="pointer-events-none absolute inset-0 z-30">
              <button
                type="button"
                onClick={prevBanner}
                aria-label="Previous banner"
                className="pointer-events-auto absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-zinc-900/75 text-white shadow-lg backdrop-blur-md transition-[background-color,transform] hover:bg-zinc-900/90 active:scale-95 sm:left-3"
              >
                <ChevronLeft className="h-5 w-5 shrink-0" strokeWidth={2.25} />
              </button>
              <button
                type="button"
                onClick={nextBanner}
                aria-label="Next banner"
                className="pointer-events-auto absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-zinc-900/75 text-white shadow-lg backdrop-blur-md transition-[background-color,transform] hover:bg-zinc-900/90 active:scale-95 sm:right-3"
              >
                <ChevronRight className="h-5 w-5 shrink-0" strokeWidth={2.25} />
              </button>
              <div className="pointer-events-auto absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 px-12">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={goToBanner(i)}
                    aria-label={`Show slide ${i + 1} of ${heroSlides.length}`}
                    aria-current={i === currentBanner ? "true" : undefined}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === currentBanner
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/45 hover:bg-white/70",
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <CardContent className="relative flex flex-1 flex-col p-5 pt-0">
          <div className="flex gap-4">
            <div className="-mt-11 relative z-10 shrink-0">
              <div className="h-18 w-18 overflow-hidden rounded-2xl bg-white shadow-lg ring-4 ring-white dark:bg-slate-900 dark:ring-slate-950">
                <img
                  src={getFileUrl(tool.logo_url)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="min-w-0 flex-1 pt-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                    {tool.title}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {tool.category ? (
                      <Badge
                        variant="secondary"
                        className="rounded-md border-0 bg-slate-100 px-2 py-0 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {tool.category}
                      </Badge>
                    ) : null}
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-0 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset",
                        statusStyles[tool.status],
                      )}
                    >
                      {tool.status}
                    </span>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="shrink-0 gap-1.5 rounded-full bg-linear-to-r from-violet-600 to-indigo-600 px-4 text-xs font-semibold text-white shadow-md shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500"
                >
                  <a href={tool.link} target="_blank" rel="noopener noreferrer">
                    Launch
                    <ExternalLink
                      className="h-3.5 w-3.5 opacity-90"
                      aria-hidden
                    />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {tool.description || "No description yet."}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const ExploreToolsPage = () => {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useGetTools({ search });
  const tools = data?.data || [];

  return (
    <div className="space-y-10 pb-10">
      <div className="relative overflow-hidden rounded-[3rem] bg-linear-to-br from-violet-600 via-indigo-700 to-indigo-900 p-8 text-white shadow-2xl sm:p-16">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold tracking-widest uppercase backdrop-blur-xl border border-white/20"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>QuickLabs Ecosystem</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
              className="text-5xl font-black leading-[1.1] tracking-tight sm:text-7xl"
            >
              Discover <br />
              <span className="bg-linear-to-r from-violet-200 to-indigo-100 bg-clip-text text-transparent">
                Powerful Tools
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 max-w-xl text-lg text-white/70 leading-relaxed font-medium"
            >
              Explore our suite of specialized tools designed to supercharge
              your learning and development workflow. All tools are integrated
              with your QuickLabs account.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, rotate: -10, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", damping: 15 }}
            className="flex shrink-0 items-center justify-center"
          >
            <div className="relative h-56 w-56">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/20 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-6 rounded-full border-2 border-dashed border-white/40 animate-[spin_15s_linear_infinite_reverse]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-8 rounded-full bg-white/10 blur-2xl" />
                  <Wrench className="h-20 w-20 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tools by name, category..."
              className="h-12 rounded-2xl pl-12 bg-white/50 backdrop-blur-md border-violet-100 focus:ring-violet-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {IS_DEVELOPMENT && (
            <ToolFormModal
              trigger={
                <Button className="h-12 rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-violet-500/20">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Tool
                </Button>
              }
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Showing {tools.length} results
          </p>
        </div>
      </div>

      <motion.div layout className="grid gap-8 grid-cols-1 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card
                  key={i}
                  className="flex h-full flex-col gap-0 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-0 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  <Skeleton className="aspect-21/10 min-h-[calc(11rem+100px)] w-full shrink-0 rounded-none sm:aspect-24/10" />
                  <CardContent className="relative flex flex-1 flex-col p-5 pt-0">
                    <div className="flex gap-4">
                      <div className="-mt-11 relative z-10 shrink-0">
                        <Skeleton className="h-18 w-18 rounded-2xl ring-4 ring-white dark:ring-slate-950" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2 pt-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-8 w-24 shrink-0 rounded-full" />
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-20 rounded-md" />
                          <Skeleton className="h-5 w-14 rounded-md" />
                        </div>
                      </div>
                    </div>
                    <Skeleton className="mt-4 h-10 w-full" />
                  </CardContent>
                </Card>
              ))
            : tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
        </AnimatePresence>
      </motion.div>

      {!isLoading && tools.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="mb-4 rounded-full bg-slate-100 p-6 dark:bg-slate-800">
            <Search className="h-12 w-12 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold">No tools found</h3>
          <p className="mt-2 text-slate-500">
            Try adjusting your search to find what you're looking for.
          </p>
          <Button
            variant="link"
            onClick={() => setSearch("")}
            className="mt-4 text-violet-600"
          >
            Clear all filters
          </Button>
        </motion.div>
      )}
    </div>
  );
};
