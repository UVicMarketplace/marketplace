import React, { useRef, useCallback, useEffect } from "react";

// Infinite scroll component modified from https://github.com/ankeetmaini/react-infinite-scroll-component/issues/380#issuecomment-1646970802
interface InfiniteScrollProps {
  load: () => void;
  hasMore: boolean;
  loader: React.ReactNode;
  inverse?: boolean;
  children?: React.ReactNode;
  endMessage?: React.ReactNode;
  scrollContainerId?: string | null;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  load,
  hasMore,
  loader,
  inverse = false,
  children,
  endMessage,
  scrollContainerId = null,
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      // Check if the sentinel element is intersecting, and if so, call the load function
      if (entries[0].isIntersecting && hasMore) {
        load();
      }
    },
    [load, hasMore]
  );

  useEffect(() => {
    if (observerRef.current) return;

    const scrollContainer = scrollContainerId
      ? document.getElementById(scrollContainerId)
      : null;

    // Create a new IntersectionObserver when the component mounts
    observerRef.current = new IntersectionObserver(handleIntersect, {
      root: scrollContainer,
      rootMargin: "100px",
      threshold: 0,
    });

    // Attach the observer to the sentinel element
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    // Clean up the observer when the component unmounts
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [load, handleIntersect, scrollContainerId]);

  useEffect(() => {
    // When the hasMore prop changes, disconnect the previous observer and reattach it to the new sentinel element
    if (observerRef.current && sentinelRef.current) {
      observerRef.current.disconnect();
      observerRef.current.observe(sentinelRef.current);
    }
  }, [hasMore]);

  if (inverse) {
    children = React.Children.toArray(children).reverse();
  }

  return (
    <>
      {!inverse && children}
      <div ref={sentinelRef}>{hasMore && loader}</div>
      {inverse && children}

      {!hasMore && endMessage}
    </>
  );
};
