import { useState, useEffect } from "react";

const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders(extra = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...extra };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export default function PostPage({ postId, onBack, currentUser }) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState(null);

  const id = postId; // passed as prop; could also read from router

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/posts/${id}`, {
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error(`Failed to load post (${res.status})`);
        const data = await res.json();
        // API returns post with embedded comments and favorited flag
        const p = data.post ?? data;
        setPost(p);
        setFavorited(p.favorited ?? false);
        setComments(data.comments ?? p.comments ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Also fetch comments separately as fallback
  useEffect(() => {
    if (!id || comments.length > 0) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/posts/${id}/comments`, {
          headers: authHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments ?? data ?? []);
        }
      } catch (_) {}
    })();
  }, [id, comments.length]);

  async function toggleFavorite() {
    if (!getToken()) return;
    setFavLoading(true);
    try {
      const method = favorited ? "DELETE" : "POST";
      const res = await fetch(`${API_BASE}/posts/${id}/favorite`, {
        method,
        headers: authHeaders(),
      });
      if (res.ok) setFavorited(!favorited);
    } finally {
      setFavLoading(false);
    }
  }

  async function submitComment() {
    if (!commentText.trim()) return;
    setCommentLoading(true);
    setCommentError(null);
    try {
      const res = await fetch(`${API_BASE}/posts/${id}/comments`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ content: commentText.trim() }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      const data = await res.json();
      const newComment = data.comment ?? data;
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
    } catch (err) {
      setCommentError(err.message);
    } finally {
      setCommentLoading(false);
    }
  }

  async function deleteComment(commentId) {
    try {
      const res = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, is_removed: true } : c))
        );
      }
    } catch (_) {}
  }

  const canDeleteComment = (c) => {
    if (!currentUser) return false;
    if (currentUser.is_admin) return true;
    if (c.user_id && c.user_id === currentUser.id) return true;
    if (post && post.user_id === currentUser.id) return true;
    return false;
  };

  const canEditPost =
    currentUser && post && (currentUser.is_admin || post.user_id === currentUser.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center gap-3">
          <button onClick={onBack} className="text-stone-400 hover:text-stone-600 text-sm">← Back</button>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-8 animate-pulse space-y-4">
          <div className="h-64 bg-stone-100 rounded-xl" />
          <div className="h-40 bg-stone-100 rounded-xl" />
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-stone-50">
        <header className="bg-white border-b border-stone-200 px-6 py-4">
          <button onClick={onBack} className="text-stone-400 hover:text-stone-600 text-sm">← Back</button>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-16 text-center text-stone-400">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-sm">{error ?? "Post not found."}</p>
          <button onClick={onBack} className="mt-4 text-sm underline text-stone-500">Go back</button>
        </main>
      </div>
    );
  }

  const visibleComments = comments.filter((c) => !c.is_removed);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center gap-3">
        <button onClick={onBack} className="text-stone-400 hover:text-stone-600 text-sm">← Back</button>
        <span className="text-stone-300">|</span>
        <span className="text-xs text-stone-400">Post #{post.id}</span>
        {canEditPost && (
          <>
            <span className="text-stone-300 ml-auto">|</span>
            <button className="text-xs text-stone-400 hover:text-stone-600">Edit</button>
          </>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Image */}
            <div className="bg-stone-100 rounded-xl h-64 flex items-center justify-center text-stone-300 text-5xl border border-stone-200 overflow-hidden">
              {post.image_url ? (
                <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
              ) : (
                "🖼"
              )}
            </div>

            {/* Title card */}
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  {post.category ?? post.category_name}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    post.is_active ? "text-green-600 bg-green-50" : "text-stone-400 bg-stone-100"
                  }`}
                >
                  {post.is_active ? "Active" : "Inactive"}
                </span>
                {post.is_blocked && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium text-red-500 bg-red-50">
                    Blocked
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-stone-800 mb-2">{post.title}</h1>
              <p className="text-sm text-stone-500 leading-relaxed">{post.description}</p>

              <div className="flex items-center justify-between mt-5 pt-5 border-t border-stone-100">
                <span className="text-2xl font-bold text-stone-800">
                  {post.price
                    ? `€${post.price}`
                    : <span className="text-base font-normal text-stone-400">Free</span>}
                </span>
                <div className="flex gap-2">
                  <button className="bg-stone-800 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors">
                    Contact seller
                  </button>
                  <button
                    onClick={toggleFavorite}
                    disabled={favLoading || !getToken()}
                    title={getToken() ? (favorited ? "Remove from favorites" : "Add to favorites") : "Log in to save"}
                    className={`border text-sm px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                      favorited
                        ? "border-red-200 text-red-400 bg-red-50 hover:bg-red-100"
                        : "border-stone-200 text-stone-400 hover:border-stone-300"
                    }`}
                  >
                    {favorited ? "❤️" : "🤍"}
                  </button>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-stone-700 mb-4">
                Comments{" "}
                <span className="text-stone-300 font-normal ml-1">{visibleComments.length}</span>
              </h2>

              {/* Comment input */}
              <div className="flex gap-2 mb-2">
                <input
                  className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm placeholder-stone-300 text-stone-700 outline-none focus:border-stone-400"
                  placeholder="Write a comment…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitComment()}
                  disabled={commentLoading}
                />
                <button
                  onClick={submitComment}
                  disabled={commentLoading || !commentText.trim()}
                  className="bg-stone-800 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-stone-700 transition-colors"
                >
                  {commentLoading ? "…" : "Post"}
                </button>
              </div>
              {commentError && (
                <p className="text-xs text-red-500 mb-3">{commentError}</p>
              )}

              <div className="space-y-3 mt-5">
                {comments.length === 0 && (
                  <p className="text-xs text-stone-400 text-center py-4">No comments yet. Be the first!</p>
                )}
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-lg border ${
                      c.is_removed
                        ? "border-stone-100 opacity-40"
                        : "border-stone-100 bg-stone-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-500 text-xs font-bold flex items-center justify-center">
                        {(c.username ?? "?")?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-stone-600">
                        {c.username ?? "Anonymous"}
                      </span>
                      <span className="text-xs text-stone-300 ml-auto">{c.created_at?.slice(0, 10)}</span>
                      {!c.is_removed && canDeleteComment(c) && (
                        <button
                          onClick={() => deleteComment(c.id)}
                          className="text-xs text-stone-300 hover:text-red-400 transition-colors ml-1"
                          title="Remove comment"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 pl-8">
                      {c.is_removed ? <em>Removed by moderator</em> : c.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="space-y-4">
            {/* Details */}
            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">Details</h2>
              <dl className="space-y-3 text-sm">
                {[
                  ["ID", `#${post.id}`],
                  ["Posted", post.created_at?.slice(0, 10)],
                  ["Updated", post.updated_at?.slice(0, 10)],
                  ["Category", post.category ?? post.category_name ?? "—"],
                  ["Status", post.is_active ? "Active" : "Inactive"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-stone-400">{label}</dt>
                    <dd className="text-stone-600 font-medium text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Author */}
            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">Seller</h2>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 text-stone-500 text-sm font-bold flex items-center justify-center">
                  {(post.username ?? "?")?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-700">{post.username ?? "Unknown"}</p>
                  <p className="text-xs text-stone-400">{post.is_admin ? "Admin" : "Member"}</p>
                </div>
              </div>
              {currentUser?.is_admin && post.user_id && (
                <button
                  className="mt-3 w-full text-xs text-red-400 border border-red-100 rounded-lg py-1.5 hover:bg-red-50 transition-colors"
                  onClick={async () => {
                    await fetch(`${API_BASE}/admin/users/${post.user_id}/block`, {
                      method: "POST",
                      headers: authHeaders(),
                    });
                  }}
                >
                  Block user
                </button>
              )}
              {currentUser?.is_admin && (
                <button
                  className="mt-2 w-full text-xs text-red-400 border border-red-100 rounded-lg py-1.5 hover:bg-red-50 transition-colors"
                  onClick={async () => {
                    await fetch(`${API_BASE}/admin/posts/${post.id}/block`, {
                      method: "POST",
                      headers: authHeaders(),
                    });
                  }}
                >
                  Block post
                </button>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
