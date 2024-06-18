import React, { useRef, useCallback, useEffect } from "react";

// Infinite scroll component modified from https://github.com/ankeetmaini/react-infinite-scroll-component/issues/380#issuecomment-1646970802
interface InfiniteScrollProps {
  load: () => void;
  hasMore: boolean;
  loader: React.ReactNode;
  dataLength: number;
  inverse?: boolean;
  children?: React.ReactNode;
  endMessage?: React.ReactNode;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  load,
  hasMore,
  loader,
  dataLength,
  inverse = false,
  children,
  endMessage,
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemIndex = inverse ? 0 : dataLength - 1;

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      // Check if the sentinel element is intersecting, and if so, call the load function
      if (entries[0].isIntersecting && hasMore) {
        load();
      }
    },
    [load]
  );

  useEffect(() => {
    // Create a new IntersectionObserver when the component mounts
    observerRef.current = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
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
  }, [load]);

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
