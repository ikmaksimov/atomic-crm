import { useEffect, useRef } from "react";
import { useInfinitePaginationContext } from "ra-core";

export const InfiniteScrollDetector = () => {
    const { fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfinitePaginationContext();
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const target = observerTarget.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 },
        );

        observer.observe(target);

        return () => {
            observer.unobserve(target);
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (!hasNextPage) return null;

    return (
        <div
            ref={observerTarget}
            className="h-10 w-full flex items-center justify-center p-4"
        >
            {isFetchingNextPage && (
                <span className="text-sm text-muted-foreground animate-pulse">
                    Loading more companies...
                </span>
            )}
        </div>
    );
};
