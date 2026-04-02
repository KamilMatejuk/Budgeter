'use client';

import { useRef, useEffect, PropsWithChildren } from "react";

export default function ScrollableHorizontal({ children }: PropsWithChildren) {
  const topScrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const tableWrapBottomRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);

  const syncScroll = (from: "top" | "bottom" | "content") => {
    const top = topScrollRef.current;
    const bottom = bottomScrollRef.current;
    const content = contentRef.current;
    if (!top || !bottom || !content) return;
    if (from === "top") { bottom.scrollLeft = top.scrollLeft; content.scrollLeft = top.scrollLeft; }
    else if (from === "bottom") { top.scrollLeft = bottom.scrollLeft; content.scrollLeft = bottom.scrollLeft; }
    else { top.scrollLeft = content.scrollLeft; bottom.scrollLeft = content.scrollLeft; }
  };

  useEffect(() => {
    const content = contentRef.current;
    const phantomTop = tableWrapRef.current;
    const phantomBottom = tableWrapBottomRef.current;
    if (!content || !phantomTop || !phantomBottom) return;
    const updateWidth = () => {
      const w = `${content.scrollWidth}px`;
      phantomTop.style.width = w;
      phantomBottom.style.width = w;
    };
    const observer = new ResizeObserver(updateWidth);
    observer.observe(content);
    updateWidth();
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full">
      {/* top scrollbar */}
      <div
        ref={topScrollRef}
        className="overflow-x-scroll md:hidden"
        style={{ scrollbarGutter: "stable" }}
        onScroll={() => syncScroll("top")}
      >
        <div
          ref={tableWrapRef}
          className="h-0.5 bg-second-bg"
        />
      </div>
      {/* content */}
      <div
        ref={contentRef}
        className="overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
        onScroll={() => syncScroll("content")}
      >
        {children}
      </div>
      {/* bottom scrollbar */}
      <div
        ref={bottomScrollRef}
        className="overflow-x-scroll md:hidden"
        style={{ scrollbarGutter: "stable" }}
        onScroll={() => syncScroll("bottom")}
      >
        <div
          ref={tableWrapBottomRef}
          className="h-0.5 bg-second-bg"
        />
      </div>
    </div>
  );
}
