"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { NormalizedPost as MockPost } from "./influencer-side-panel.types";
import { PlatformPostCard } from "./PlatformPostCard";

const CARD_WIDTH_PX = 360;
const GAP_PX = 16;

type CardPlatform = "instagram" | "tiktok" | "youtube" | "x";

/**
 * Horizontal scroll “carousel”: center card sharp, side cards blurred + slightly scaled down.
 * Does not modify PlatformPostCard — only wraps it.
 */
export function PlatformPostsScrollRail({
  posts,
  cardPlatform,
  authorUsername,
  scrollKey,
}: {
  posts: MockPost[];
  cardPlatform: CardPlatform;
  authorUsername: string;
  /** Changes when platform/influencer changes so layout + focus re-run. */
  scrollKey: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const [sidePad, setSidePad] = useState(24);

  const updateFocusStyles = useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const rect = scrollEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const falloff = Math.max(rect.width * 0.32, CARD_WIDTH_PX * 0.55);
    const n = posts.length;

    for (let i = 0; i < n; i++) {
      const node = slideRefs.current[i];
      if (!node) continue;
      const r = node.getBoundingClientRect();
      const cardCenter = r.left + r.width / 2;
      const dist = Math.abs(cardCenter - centerX);
      const t = Math.min(1, dist / falloff);
      const blurPx = t * 5.5;
      const opacity = 1 - t * 0.38;
      const scale = 1 - t * 0.045;

      node.style.filter = blurPx > 0.35 ? `blur(${blurPx.toFixed(2)}px)` : "none";
      node.style.opacity = opacity.toFixed(3);
      node.style.transform = `scale(${scale.toFixed(4)})`;
    }
  }, [posts.length]);

  const scheduleFocusUpdate = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      updateFocusStyles();
    });
  }, [updateFocusStyles]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      setSidePad(Math.max(16, (w - CARD_WIDTH_PX) / 2));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scrollKey, posts.length]);

  useLayoutEffect(() => {
    scheduleFocusUpdate();
  }, [scrollKey, posts.length, scheduleFocusUpdate]);

  useLayoutEffect(() => {
    scheduleFocusUpdate();
  }, [sidePad, scheduleFocusUpdate]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => scheduleFocusUpdate();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleFocusUpdate);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleFocusUpdate);
    };
  }, [scheduleFocusUpdate, scrollKey]);

  if (posts.length === 0) return null;

  return (
    <div className="min-w-0 w-full">
      <div
        ref={scrollRef}
        className={[
          "w-full overflow-x-auto overflow-y-hidden pb-3 pt-1",
          "scroll-smooth snap-x snap-mandatory",
          "[scrollbar-width:none]",
          "[&::-webkit-scrollbar]:hidden",
        ].join(" ")}
        onWheel={(e) => {
          const el = scrollRef.current;
          if (!el || el.scrollWidth <= el.clientWidth) return;
          if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
          el.scrollLeft += e.deltaY;
          e.preventDefault();
        }}
      >
        <div
          className="flex w-max items-stretch gap-4"
          style={{ gap: GAP_PX }}
        >
          <div
            aria-hidden
            className="shrink-0"
            style={{ width: sidePad, minWidth: sidePad }}
          />
          {posts.map((post, index) => (
            <div
              key={`${scrollKey}-${post.id}-${post.postedAt}-${index}`}
              ref={(el) => {
                slideRefs.current[index] = el;
              }}
              className={[
                "snap-center shrink-0 origin-center",
                "transition-[filter,opacity,transform] duration-200 ease-out",
                "will-change-[filter,opacity,transform]",
              ].join(" ")}
              style={{ width: CARD_WIDTH_PX }}
            >
              <PlatformPostCard
                post={post}
                platform={cardPlatform}
                authorUsername={authorUsername}
              />
            </div>
          ))}
          <div
            aria-hidden
            className="shrink-0"
            style={{ width: sidePad, minWidth: sidePad }}
          />
        </div>
      </div>
    </div>
  );
}
