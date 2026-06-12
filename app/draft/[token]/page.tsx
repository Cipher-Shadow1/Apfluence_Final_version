"use client";

import { use, useMemo, useState, useEffect } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Upload, Youtube, FileText, LoaderCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraftPageProps {
  params: Promise<{ token: string }>;
}

type SubmissionType = "media" | "youtube" | "blog";

function isVideoUrl(url: string): boolean {
  const raw = url.toLowerCase();
  return (
    raw.includes("/video/upload/") ||
    raw.endsWith(".mp4") ||
    raw.endsWith(".mov") ||
    raw.endsWith(".webm")
  );
}

export default function DraftSubmissionPage({ params }: DraftPageProps) {
  const { token } = use(params);

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [submissionType, setSubmissionType] = useState<SubmissionType>("media");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [blogUrl, setBlogUrl] = useState("");
  const [note, setNote] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitOk, setSubmitOk] = useState(false);

  useEffect(() => {
    fetch(`/api/draft/${token}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json);
      })
      .catch(() => setError("Failed to load draft form"))
      .finally(() => setIsLoading(false));
  }, [token]);

  const latestDrafts = useMemo(() => {
    if (!Array.isArray(data?.draft_submissions)) return [];
    return [...data.draft_submissions].reverse().slice(0, 5);
  }, [data?.draft_submissions]);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!uploadPreset || !cloudName) {
      throw new Error("Upload is not configured");
    }
    const kind = file.type.startsWith("video/") ? "video" : "image";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "campaign-drafts");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${kind}/upload`,
      { method: "POST", body: formData },
    );
    const json = await res.json();
    if (!res.ok || !json?.secure_url) {
      throw new Error(json?.error?.message || "Upload failed");
    }
    return json.secure_url as string;
  };

  const handlePickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadToCloudinary));
      setMediaUrls((prev) => [...prev, ...urls]);
    } catch (err: any) {
      setError(err?.message ?? "Upload failed.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (submissionType === "media" && mediaUrls.length === 0) {
      setError("Please upload at least one photo or video.");
      return;
    }
    if (submissionType === "youtube" && !youtubeUrl.trim()) {
      setError("Please add a YouTube URL.");
      return;
    }
    if (submissionType === "blog" && !blogUrl.trim()) {
      setError("Please add a blog URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/draft/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionType,
          mediaUrls,
          youtubeUrl,
          blogUrl,
          note,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Failed to submit draft.");
        return;
      }
      setSubmitOk(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
        <LoaderCircle className="animate-spin text-[#2b2ef8]" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa] px-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-800">Draft link unavailable</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (submitOk) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa] px-6">
        <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <CheckCircle2 size={24} className="mx-auto text-green-500 mb-3" />
          <p className="text-lg font-semibold text-gray-900">Draft submitted</p>
          <p className="text-sm text-gray-500 mt-2">
            Thank you, your content draft was sent successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-[#f5f7fa] py-10 px-4">
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-4xl"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#2020d6]">Submit your work</h1>
              <p className="text-sm text-gray-500 mt-1">
                Campaign: {data?.campaigns?.name ?? "Campaign"}
              </p>
            </div>
            <a
              href={`/apply/${token}`}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Go to Campaign Application
            </a>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-3">
              {[
                { key: "media" as const, label: "Upload Media", icon: Upload },
                { key: "youtube" as const, label: "YouTube URL", icon: Youtube },
                { key: "blog" as const, label: "Blog Post", icon: FileText },
              ].map((item) => {
                const Icon = item.icon;
                const active = submissionType === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSubmissionType(item.key)}
                    className={cn(
                      "flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                      active
                        ? "border-gray-900 bg-white text-gray-900"
                        : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100",
                    )}
                  >
                    <Icon size={14} className="inline mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {submissionType === "media" && (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handlePickFiles}
                  className="hidden"
                  id="draft-media-input"
                />
                <label htmlFor="draft-media-input" className="cursor-pointer">
                  <Upload size={20} className="mx-auto text-[#2b2ef8]" />
                  <p className="mt-2 text-sm text-gray-700">
                    Drop your file here, or <span className="text-[#2b2ef8]">browse</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Allowed formats: jpg, jpeg, png, gif, webp, mp4, mov
                  </p>
                </label>
                {isUploading && (
                  <p className="mt-3 text-xs text-[#2b2ef8]">Uploading...</p>
                )}
                {mediaUrls.length > 0 && (
                  <div className="mt-4 text-left">
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      Uploaded files
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {mediaUrls.map((url) => (
                        <div key={url} className="rounded-lg overflow-hidden border border-gray-200 bg-white relative">
                          {isVideoUrl(url) ? (
                            <video src={url} controls className="h-32 w-full object-cover" />
                          ) : (
                            <img src={url} alt="Uploaded draft" className="h-32 w-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => setMediaUrls((prev) => prev.filter((u) => u !== url))}
                            className="absolute top-1 right-1 rounded-md bg-black/60 text-white text-[10px] px-1.5 py-0.5 hover:bg-black/75"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {submissionType === "youtube" && (
              <div>
                <label className="text-xs font-semibold text-gray-500">YouTube URL</label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#a5a6fc] focus:ring-2 focus:ring-[#eeeeff]"
                />
              </div>
            )}

            {submissionType === "blog" && (
              <div>
                <label className="text-xs font-semibold text-gray-500">Blog URL</label>
                <input
                  type="url"
                  value={blogUrl}
                  onChange={(e) => setBlogUrl(e.target.value)}
                  placeholder="https://yourblog.com/post/..."
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#a5a6fc] focus:ring-2 focus:ring-[#eeeeff]"
                />
              </div>
            )}

            <div className="mt-4">
              <label className="text-xs font-semibold text-gray-500">Notes (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#a5a6fc] focus:ring-2 focus:ring-[#eeeeff]"
                placeholder="Any context for the brand..."
              />
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-500">{error}</p>
            )}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isUploading}
                className={cn(
                  "rounded-xl px-5 py-2 text-sm font-semibold text-white",
                  isSubmitting || isUploading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#2b2ef8] hover:bg-[#2020d6]",
                )}
              >
                {isSubmitting ? "Submitting..." : "Create Draft"}
              </button>
            </div>
          </div>

          {latestDrafts.length > 0 && (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-semibold text-gray-800 mb-3">Latest Draft</p>
              <div className="space-y-2">
                {latestDrafts.map((draft: any, idx: number) => (
                  <div key={draft.id ?? idx} className="rounded-lg border border-gray-100 px-3 py-2">
                    <p className="text-xs font-medium text-gray-700">
                      {draft.type} • {new Date(draft.created_at).toLocaleString()}
                    </p>
                    {Array.isArray(draft.media_urls) && draft.media_urls.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                        {draft.media_urls.map((url: string) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg overflow-hidden border border-gray-200 bg-white block"
                          >
                            {isVideoUrl(url) ? (
                              <video src={url} controls className="h-28 w-full object-cover" />
                            ) : (
                              <img src={url} alt="Draft media" className="h-28 w-full object-cover" />
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                    {draft.youtube_url && (
                      <a href={draft.youtube_url} target="_blank" className="text-xs text-[#2b2ef8] underline">
                        {draft.youtube_url}
                      </a>
                    )}
                    {draft.blog_url && (
                      <a href={draft.blog_url} target="_blank" className="text-xs text-[#2b2ef8] underline">
                        {draft.blog_url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </m.div>
      </div>
    </LazyMotion>
  );
}
