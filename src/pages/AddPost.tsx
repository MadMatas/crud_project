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

const FALLBACK_CATEGORIES = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Clothing" },
  { id: 3, name: "Books" },
  { id: 4, name: "Furniture" },
  { id: 5, name: "Sports" },
  { id: 6, name: "Other" },
];

export default function AddPost({ user, onBack, onPublished }) {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    price: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Try to fetch real categories from the API
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/categories`, {
          headers: authHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          const cats = data.categories ?? data ?? [];
          if (Array.isArray(cats) && cats.length > 0) setCategories(cats);
        }
      } catch (_) {
        // fallback already set
      }
    })();
  }, []);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required.";
    if (!form.category_id) errs.category_id = "Please choose a category.";
    if (form.price && (isNaN(Number(form.price)) || Number(form.price) < 0))
      errs.price = "Price must be a positive number.";
    return errs;
  }

  async function handlePublish() {
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        category_id: Number(form.category_id),
        price: form.price ? Number(form.price) : undefined,
        image_url: form.image_url.trim() || undefined,
      };

      const res = await fetch(`${API_BASE}/posts`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? data.error ?? `Error ${res.status}`);
      }

      const data = await res.json();
      const newPost = data.post ?? data;
      onPublished?.(newPost);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center gap-3">
        <button onClick={onBack} className="text-stone-400 hover:text-stone-600 text-sm">← Back</button>
        <span className="text-stone-300">|</span>
        <span className="text-sm font-semibold text-stone-800">New Post</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-stone-800 mb-1">Create a listing</h1>
        <p className="text-sm text-stone-400 mb-8">Fill in the details and publish when ready.</p>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Basic info */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Basic info</h2>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                className={`w-full border rounded-lg px-3 py-2.5 text-sm text-stone-700 placeholder-stone-300 outline-none focus:border-stone-400 ${
                  fieldErrors.title ? "border-red-300 bg-red-50" : "border-stone-200"
                }`}
                placeholder="e.g. Vintage Leather Jacket"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
              {fieldErrors.title && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
              <textarea
                className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 placeholder-stone-300 outline-none focus:border-stone-400 resize-none h-24"
                placeholder="Describe your item…"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                className={`w-full border rounded-lg px-3 py-2.5 text-sm text-stone-700 outline-none focus:border-stone-400 bg-white ${
                  fieldErrors.category_id ? "border-red-300 bg-red-50" : "border-stone-200"
                }`}
                value={form.category_id}
                onChange={(e) => set("category_id", e.target.value)}
              >
                <option value="">Select a category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {fieldErrors.category_id && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.category_id}</p>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">Pricing</h2>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Price <span className="text-stone-400 font-normal">— leave empty for free</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">€</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`w-full border rounded-lg pl-7 pr-3 py-2.5 text-sm text-stone-700 placeholder-stone-300 outline-none focus:border-stone-400 ${
                  fieldErrors.price ? "border-red-300 bg-red-50" : "border-stone-200"
                }`}
                placeholder="0.00"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </div>
            {fieldErrors.price && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.price}</p>
            )}
          </div>

          {/* Image */}
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">Image</h2>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Image URL</label>
            <input
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 placeholder-stone-300 outline-none focus:border-stone-400 mb-3"
              placeholder="https://…"
              value={form.image_url}
              onChange={(e) => set("image_url", e.target.value)}
            />
            {form.image_url ? (
              <div className="rounded-lg overflow-hidden h-28 border border-stone-200">
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-stone-200 rounded-lg h-28 flex flex-col items-center justify-center text-stone-300 text-sm gap-1">
                <span className="text-xl">🖼</span>
                <span>Paste an image URL above to preview</span>
              </div>
            )}
          </div>


        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handlePublish}
            disabled={loading}
            className="flex-1 bg-stone-800 text-white font-semibold text-sm py-3 rounded-xl disabled:opacity-60 hover:bg-stone-700 transition-colors"
          >
            {loading ? "Publishing…" : "Publish Post"}
          </button>
          <button
            onClick={onBack}
            className="px-6 border border-stone-200 text-stone-500 text-sm font-medium rounded-xl hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </main>
    </div>
  );
}
