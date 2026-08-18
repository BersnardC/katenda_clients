import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

export function InfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  children,
}: {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  children: ReactNode;
}) {
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) onLoadMore();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <>
      {children}
      <div ref={sentinel} className="h-10" />
    </>
  );
}
