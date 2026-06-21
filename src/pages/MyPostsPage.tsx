import { useState, useEffect } from "react";

const API_BASE = "http://localhost:3000/api";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

const CATEGORIES = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Clothing" },
  { id: 3, name: "Books" },
  { id: 4, name: "Furniture" },
  { id: 5, name: "Sports" },
  { id: 6, name: "Other" },
];

function EditModal({ post, onClose, onSaved }: { post: any; onClose: () => void; onSaved: (updated: any) => void }) {
  const [form, setForm] = useState({
    title: post.title ?? "",
    description: post.description ?? "",
    category_id: post.category_id ?? "",
    price: post.price ?? "",
    image_url: post.image_url ?? "",
    is_active: post.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function save() {
    if (!form.title.trim()) { setError("Title is required."); return; }
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, any> = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category_id: form.category_id ? Number(form.category_id) : null,
        price: form.price !== "" ? Number(form.price) : null,
        image_url: form.image_url.trim() || null,
        is_active: form.is_active,
      };
      const res = await fetch(`${API_BASE}/posts/${post.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Error ${res.status}`);
      }
      const data = await res.json();
      onSaved(data.post ?? data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-800">Edit listing</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-lg leading-none">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2">{error}</div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Title *</label>
            <input
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 outline-none focus:border-stone-400"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Description</label>
            <textarea
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 outline-none focus:border-stone-400 resize-none h-20"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Category</label>
              <select
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 outline-none focus:border-stone-400 bg-white"
                value={form.category_id}
                onChange={(e) => set("category_id", e.target.value)}
              >
                <option value="">No category</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Price (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Free"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 outline-none focus:border-stone-400"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Image URL</label>
            <input
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 outline-none focus:border-stone-400"
              placeholder="https://…"
              value={form.image_url}
              onChange={(e) => set("image_url", e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-stone-700">Active</p>
              <p className="text-xs text-stone-400">Visible to other users</p>
            </div>
            <button
              type="button"
              onClick={() => set("is_active", !form.is_active)}
              className={`w-10 h-6 rounded-full relative transition-colors ${form.is_active ? "bg-stone-800" : "bg-stone-200"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${form.is_active ? "right-1" : "left-1"}`} />
            </button>
          </div>
        </div>

        <div className="flex gap-2 px-6 py-4 border-t border-stone-100">
          <button
            onClick={save}
            disabled={loading}
            className="flex-1 bg-stone-800 text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-60 hover:bg-stone-700 transition-colors"
          >
            {loading ? "Saving…" : "Save changes"}
          </button>
          <button
            onClick={onClose}
            className="px-5 border border-stone-200 text-stone-500 text-sm rounded-xl hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyPostsPage({ user, onPostClick }: { user: any; onPostClick?: (id: number) => void }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function fetchPosts() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/users/posts`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to load your posts (${res.status})`);
      const data = await res.json();
      setPosts(data.posts ?? data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPosts(); }, []);

  async function deletePost(id: number) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/posts/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  function handleSaved(updated: any) {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditing(null);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {editing && (
        <EditModal post={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />
      )}

      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-stone-800">My listings</h1>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {error} — <button onClick={fetchPosts} className="underline">retry</button>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-xl p-4 animate-pulse flex gap-4">
                <div className="w-20 h-20 bg-stone-100 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-stone-100 rounded w-1/3" />
                  <div className="h-4 bg-stone-100 rounded w-2/3" />
                  <div className="h-3 bg-stone-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-20 text-stone-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm">You haven't posted anything yet.</p>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-stone-200 rounded-xl p-4 flex gap-4 items-start"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => onPostClick?.(post.id)}
                  className="w-20 h-20 bg-stone-100 rounded-lg flex items-center justify-center text-stone-300 text-2xl shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {post.image_url
                    ? <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                    : "🖼"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      {post.category ?? post.category_name ?? "—"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      post.is_active ? "text-green-600 bg-green-50" : "text-stone-400 bg-stone-100"
                    }`}>
                      {post.is_active ? "Active" : "Inactive"}
                    </span>
                    {post.is_blocked && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium text-red-500 bg-red-50">Blocked</span>
                    )}
                  </div>
                  <h3
                    onClick={() => onPostClick?.(post.id)}
                    className="text-sm font-semibold text-stone-800 truncate cursor-pointer hover:underline"
                  >
                    {post.title}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {post.price ? `€${post.price}` : "Free"} · {post.created_at?.slice(0, 10)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setEditing(post)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    disabled={deletingId === post.id}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deletingId === post.id ? "…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
