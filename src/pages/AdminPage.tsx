import { useState, useEffect, useCallback } from "react";

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

// ── Small reusable badge ──────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: "green" | "red" | "stone" | "amber" }) {
  const styles = {
    green: "text-green-600 bg-green-50",
    red: "text-red-500 bg-red-50",
    stone: "text-stone-400 bg-stone-100",
    amber: "text-amber-600 bg-amber-50",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[color]}`}>{label}</span>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <p className="text-sm text-stone-700 mb-5">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white text-sm font-semibold py-2 rounded-xl hover:bg-red-600 transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-stone-200 text-stone-500 text-sm py-2 rounded-xl hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Posts tab ─────────────────────────────────────────────────────────────────
function PostsTab({ onViewPost }: { onViewPost?: (id: number) => void }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState<{ message: string; action: () => Promise<void> } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("q", search);
      const res = await fetch(`${API_BASE}/posts?${params}`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to load posts (${res.status})`);
      const data = await res.json();
      setPosts(data.posts ?? data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(fetchPosts, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [fetchPosts]);

  async function blockPost(id: number) {
    setBusyId(id);
    try {
      await fetch(`${API_BASE}/admin/posts/${id}/block`, { method: "POST", headers: authHeaders() });
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, is_blocked: true } : p));
    } finally {
      setBusyId(null);
      setConfirm(null);
    }
  }

  async function deletePost(id: number) {
    setBusyId(id);
    try {
      const res = await fetch(`${API_BASE}/posts/${id}`, { method: "DELETE", headers: authHeaders() });
      if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setBusyId(null);
      setConfirm(null);
    }
  }

  return (
    <div>
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.action}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="flex gap-3 mb-4">
        <input
          className="flex-1 bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 placeholder-stone-400 outline-none focus:border-stone-400"
          placeholder="Search posts…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {error} — <button onClick={fetchPosts} className="underline">retry</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-sm text-stone-400 text-center py-12">No posts found.</p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center gap-3">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-stone-400">#{post.id}</span>
                  {post.is_blocked && <Badge label="Blocked" color="red" />}
                  {!post.is_active && <Badge label="Inactive" color="stone" />}
                  {post.category && <Badge label={post.category} color="amber" />}
                </div>
                <p
                  onClick={() => onViewPost?.(post.id)}
                  className="text-sm font-medium text-stone-800 truncate cursor-pointer hover:underline"
                >
                  {post.title}
                </p>
                <p className="text-xs text-stone-400">
                  by {post.username} · {post.price ? `€${post.price}` : "Free"} · {post.created_at?.slice(0, 10)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                {!post.is_blocked && (
                  <button
                    disabled={busyId === post.id}
                    onClick={() => setConfirm({
                      message: `Block "${post.title}"? It will be hidden from users.`,
                      action: () => blockPost(post.id),
                    })}
                    className="text-xs px-3 py-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
                  >
                    Block
                  </button>
                )}
                <button
                  disabled={busyId === post.id}
                  onClick={() => setConfirm({
                    message: `Permanently delete "${post.title}"? This cannot be undone.`,
                    action: () => deletePost(post.id),
                  })}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && posts.length > 0 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm rounded-lg border border-stone-200 text-stone-500 disabled:opacity-40 hover:border-stone-400 transition-colors"
          >
            ← Prev
          </button>
          <span className="px-4 py-2 text-sm text-stone-400">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={posts.length < 20}
            className="px-4 py-2 text-sm rounded-lg border border-stone-200 text-stone-500 disabled:opacity-40 hover:border-stone-400 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Users tab ─────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ message: string; action: () => Promise<void> } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Could not load users (${res.status}). The endpoint may not be implemented yet.`);
      const data = await res.json();
      setUsers(data.users ?? data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  async function blockUser(id: number) {
    setBusyId(id);
    try {
      await fetch(`${API_BASE}/admin/users/${id}/block`, { method: "POST", headers: authHeaders() });
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_blocked: true } : u));
    } finally {
      setBusyId(null);
      setConfirm(null);
    }
  }

  return (
    <div>
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.action}
          onCancel={() => setConfirm(null)}
        />
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {error} — <button onClick={fetchUsers} className="underline">retry</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 && !error ? (
        <p className="text-sm text-stone-400 text-center py-12">No users found.</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center gap-3">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 text-stone-500 text-sm font-bold flex items-center justify-center shrink-0">
                {u.username?.[0]?.toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-stone-800">{u.username}</p>
                  {u.is_admin && <Badge label="Admin" color="amber" />}
                  {u.is_blocked && <Badge label="Blocked" color="red" />}
                </div>
                <p className="text-xs text-stone-400">{u.email} · joined {u.created_at?.slice(0, 10)}</p>
              </div>

              {/* Actions */}
              {!u.is_admin && (
                <div className="shrink-0">
                  {u.is_blocked ? (
                    <span className="text-xs text-stone-400">Blocked</span>
                  ) : (
                    <button
                      disabled={busyId === u.id}
                      onClick={() => setConfirm({
                        message: `Block user "${u.username}"? They will no longer be able to log in.`,
                        action: () => blockUser(u.id),
                      })}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Block
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main AdminPage ────────────────────────────────────────────────────────────
export default function AdminPage({ user, onLogout, onViewPost }: {
  user: any;
  onLogout?: () => void;
  onViewPost?: (id: number) => void;
}) {
  const [tab, setTab] = useState<"posts" | "users">("posts");

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center text-stone-400">
          <p className="text-4xl mb-3">🔒</p>
          <p className="text-sm">Admins only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-stone-800">Admin panel</h1>
          <p className="text-xs text-stone-400 mt-0.5">Logged in as <strong>{user.username}</strong></p>
        </div>
        <button
          onClick={onLogout}
          className="text-xs px-3 py-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors"
        >
          Logout
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-xl w-fit">
          {(["posts", "users"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t
                  ? "bg-white text-stone-800 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "posts" && <PostsTab onViewPost={onViewPost} />}
        {tab === "users" && <UsersTab />}
      </main>
    </div>
  );
}
