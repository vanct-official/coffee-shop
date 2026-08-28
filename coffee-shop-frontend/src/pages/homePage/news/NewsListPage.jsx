import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";
import newsService from "@/services/newsService";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const LIMIT = 6;

// Shimmer skeleton card
function SkeletonCard() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="relative w-full aspect-[16/9] bg-secondary/60 rounded mb-4" />
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-secondary/60 rounded" />
        <div className="h-5 w-1/2 bg-secondary/60 rounded" />
        <div className="h-3 w-2/5 bg-secondary/50 rounded mt-1" />
        <div className="h-3 w-1/4 bg-secondary/40 rounded mt-2" />
      </div>
    </div>
  );
}

export default function NewsListPage() {
  useDocumentTitle("Tin tức");

  const [articles, setArticles] = useState([]);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false); // initial load
  const [loadingMore, setLoadingMore] = useState(false); // subsequent loads
  const [hasMore, setHasMore] = useState(true);

  // Sentinel ref — the div observed by IntersectionObserver
  const sentinelRef = useRef(null);

  // ── Fetch featured sidebar news ──────────────────────────────────────────
  useEffect(() => {
    newsService
      .getFeatured({ limit: 5 })
      .then((res) =>
        setFeaturedNews(
          Array.isArray(res?.data) ? res.data : res?.data?.items || []
        )
      )
      .catch(() => {});
  }, []);

  // ── Fetch a single page and accumulate results ───────────────────────────
  const fetchPage = useCallback(
    async (pageNum) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await newsService.getAll({ page: pageNum, limit: LIMIT });
        const data = res?.data;
        const items = data?.items || [];
        const pages = data?.totalPages || 1;

        setTotalPages(pages);
        setArticles((prev) => (pageNum === 1 ? items : [...prev, ...items]));
        setHasMore(pageNum < pages);
      } catch {
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  // Load more when sentinel comes into view
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => {
            const next = prev + 1;
            fetchPage(next);
            return next;
          });
        }
      },
      { rootMargin: "200px" }
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, loading, loadingMore, fetchPage]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-2 md:pt-4 pb-10 md:pb-16 mb-5">

        {/* Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 min-h-[50px]">
          <div className="text-base md:text-lg text-gray-500 dark:text-gray-400 flex items-center flex-wrap gap-2 font-medium">
            <Link to="/" className="cursor-pointer hover:text-amber-600 transition-colors">Trang chủ</Link>
            <span className="text-gray-400">/</span>
            <span className="text-amber-600 font-bold">Tin tức</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">

            {/* Initial skeleton */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && articles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Newspaper className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Chưa có bài viết nào</h3>
                <p className="text-gray-500 dark:text-gray-400">Vui lòng quay lại sau để xem những tin tức mới nhất.</p>
              </div>
            )}

            {/* Article grid */}
            {!loading && articles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
                {articles.map((item) => (
                  <Link key={item.id} to={`/news/${item.slug}`} className="group flex flex-col">
                    {item.thumbnail && (
                      <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="flex flex-col flex-1 space-y-2">
                      <h2 className="text-[17px] font-bold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 transition-colors uppercase leading-snug line-clamp-2">
                        {item.title}
                      </h2>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-gray-700 dark:text-gray-300 mr-2">Coffee Shop</span>
                        {new Date(item.created_at).toLocaleDateString("vi-VN", {
                          weekday: "long",
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                        })}
                      </div>
                      <p className="text-sm text-amber-600 mt-2 hover:underline">Đọc tiếp</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* "Load more" skeleton — shown while fetching next page */}
            {loadingMore && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10 mt-10">
                {Array.from({ length: 2 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* End of feed */}
            {!loading && !loadingMore && !hasMore && articles.length > 0 && (
              <div className="mt-12 flex flex-col items-center gap-2 text-gray-400 dark:text-gray-600 text-sm">
                <div className="w-16 h-px bg-gray-200 dark:bg-gray-800" />
                <span>Bạn đã xem hết tất cả bài viết</span>
                <div className="w-16 h-px bg-gray-200 dark:bg-gray-800" />
              </div>
            )}

            {/* Invisible sentinel for IntersectionObserver */}
            {hasMore && !loading && (
              <div ref={sentinelRef} className="h-1" aria-hidden="true" />
            )}
          </div>

          {/* ── Sidebar: Tin nổi bật ── */}
          <div className="w-full lg:w-[320px] flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 uppercase pb-3 border-b border-gray-200 dark:border-gray-800">
                Tin nổi bật
              </h3>
              <div className="flex flex-col gap-5">
                {featuredNews.map((item) => (
                  <Link key={item.id} to={`/news/${item.slug}`} className="flex gap-4 group">
                    <div className="w-24 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[13px] font-bold text-gray-800 dark:text-gray-200 group-hover:text-amber-600 transition-colors line-clamp-3 uppercase leading-snug">
                        {item.title}
                      </h4>
                    </div>
                  </Link>
                ))}
                {featuredNews.length === 0 && (
                  <p className="text-sm text-gray-500">Đang cập nhật...</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
