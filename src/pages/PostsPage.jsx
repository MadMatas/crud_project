import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:3000/api";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function PostsPage({ onNewPost, onPostClick }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: 18 });
      if (search) params.set("q", search);
      // category filter would need a category name, handled below via client-side for Free/Paid/Active
      const res = await fetch(`${API_BASE}/posts?${params}`, {
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });
      const raw = await res.text();
      console.log("POST response status:", res.status);
      console.log("POST response body:", raw);
      if (!res.ok) throw new Error(`Failed to load posts (${res.status}): ${raw}`);
      const data = JSON.parse(raw);
      setPosts(data.posts ?? data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(fetchPosts, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [fetchPosts, search]);

  // Client-side filter for Active / Free / Paid since API uses `category` param, not these
  const visiblePosts = posts.filter((p) => {
    if (filter === "Active") return p.is_active;
    if (filter === "Free") return !p.price;
    if (filter === "Paid") return !!p.price;
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Nav */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold text-stone-800 tracking-tight">Listings</span>
        <button
          onClick={onNewPost}
          className="bg-stone-800 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors"
        >
          + New post
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            className="flex-1 bg-white border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-700 placeholder-stone-400 outline-none focus:border-stone-400"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <div className="flex gap-2">
            {["All", "Active", "Free", "Paid"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  filter === f
                    ? "bg-stone-800 text-white border-stone-800"
                    : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {error} —{" "}
            <button onClick={fetchPosts} className="underline">
              retry
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-xl overflow-hidden animate-pulse">
                <div className="h-40 bg-stone-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-stone-100 rounded w-1/3" />
                  <div className="h-4 bg-stone-100 rounded w-2/3" />
                  <div className="h-3 bg-stone-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <>
            {visiblePosts.length === 0 ? (
              <div className="text-center py-20 text-stone-400">
                <p className="text-4xl mb-3">🗂</p>
                <p className="text-sm">No posts found. Try a different search or filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visiblePosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => onPostClick?.(post.id)}
                    className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  >
                    {/* Image */}
                    <div className="h-40 bg-stone-100 flex items-center justify-center text-stone-300 text-3xl overflow-hidden">
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        "🖼"
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          {post.category ?? post.category_name ?? "—"}
                        </span>
                        {!post.is_active && (
                          <span className="text-xs text-stone-400">Inactive</span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-stone-800 mb-1 leading-snug">{post.title}</h3>
                      <p className="text-xs text-stone-400 line-clamp-2 mb-3">{post.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-stone-800">
                          {post.price ? `€${post.price}` : <span className="text-sm font-normal text-stone-400">Free</span>}
                        </span>
                        <span className="text-xs text-stone-400">{post.username}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
\
            {/* Pagination */}
            {visiblePosts.length > 0 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm rounded-lg border border-stone-200 text-stone-500 disabled:opacity-40 hover:border-stone-400 disabled:hover:border-stone-200 transition-colors"
                >
                  ← Prev
                </button>
                <span className="px-4 py-2 text-sm text-stone-400">Page {page}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={posts.length < 18}
                  className="px-4 py-2 text-sm rounded-lg border border-stone-200 text-stone-500 disabled:opacity-40 hover:border-stone-400 disabled:hover:border-stone-200 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
