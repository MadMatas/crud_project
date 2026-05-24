export default function AddPost({ user, onLogout }: { user: any; onLogout?: () => void }) {
  const categories = ["Electronics", "Clothing", "Books", "Furniture", "Sports", "Other"];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center gap-3">
        <button className="text-stone-400 hover:text-stone-600 text-sm">← Back</button>
        <span className="text-stone-300">|</span>
        <span className="text-sm font-semibold text-stone-800">New Post</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-stone-800 mb-1">Create a listing</h1>
        <p className="text-sm text-stone-400 mb-8">Fill in the details and publish when ready.</p>

        <div className="space-y-6">
          {/* Basic info */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Basic info</h2>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Title <span className="text-red-400">*</span></label>
              <input className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 placeholder-stone-300 outline-none focus:border-stone-400" placeholder="e.g. Vintage Leather Jacket" />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
              <textarea className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 placeholder-stone-300 outline-none focus:border-stone-400 resize-none h-24" placeholder="Describe your item…" />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
              <select className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 outline-none focus:border-stone-400 bg-white">
                <option value="">Select a category…</option>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
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
              <input type="number" min="0" step="0.01" className="w-full border border-stone-200 rounded-lg pl-7 pr-3 py-2.5 text-sm text-stone-700 placeholder-stone-300 outline-none focus:border-stone-400" placeholder="0.00" />
            </div>
          </div>

          {/* Image */}
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">Image</h2>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Image URL</label>
            <input className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 placeholder-stone-300 outline-none focus:border-stone-400 mb-3" placeholder="https://…" />
            <div className="border-2 border-dashed border-stone-200 rounded-lg h-28 flex flex-col items-center justify-center text-stone-300 text-sm gap-1 cursor-pointer hover:border-stone-300 transition-colors">
              <span className="text-xl">🖼</span>
              <span>Drop an image or click to upload</span>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">Settings</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-700">Active</p>
                <p className="text-xs text-stone-400 mt-0.5">Visible to all users when enabled.</p>
              </div>
              <div className="w-10 h-6 bg-stone-800 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button className="flex-1 bg-stone-800 text-white font-semibold text-sm py-3 rounded-xl">
            Publish Post
          </button>
          <button className="px-6 border border-stone-200 text-stone-500 text-sm font-medium rounded-xl hover:bg-stone-50">
            Cancel
          </button>
        </div>
      </main>
    </div>
  );
}
