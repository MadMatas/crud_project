export default function PostsPage() {
  const posts = [
    { id: 1, title: "Vintage Leather Jacket", description: "Genuine leather, barely worn. Size M.", price: 65, category: "Clothing", username: "Marius", is_active: true, created_at: "2026-05-20" },
    { id: 2, title: "Standing Desk 140cm", description: "IKEA Bekant, good condition, pick up only.", price: 120, category: "Furniture", username: "Eglė", is_active: true, created_at: "2026-05-18" },
    { id: 3, title: "Canon EOS 90D Body", description: "Low shutter count, comes with original box.", price: 850, category: "Electronics", username: "Tomas", is_active: true, created_at: "2026-05-15" },
    { id: 4, title: "Free sofa — pickup only", description: "Grey 3-seater, minor wear. You haul.", price: null, category: "Furniture", username: "Laura", is_active: true, created_at: "2026-05-10" },
    { id: 5, title: "JavaScript: The Good Parts", description: "Douglas Crockford, paperback, highlights inside.", price: 8, category: "Books", username: "Rokas", is_active: false, created_at: "2026-05-08" },
    { id: 6, title: "Road Bike Trek FX3", description: "2022 model, 54cm frame, disc brakes.", price: 490, category: "Sports", username: "Marius", is_active: true, created_at: "2026-05-05" },
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Nav */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold text-stone-800 tracking-tight">Listings</span>
        <button className="bg-stone-800 text-white text-sm font-medium px-4 py-2 rounded-lg">
          + New post
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            className="flex-1 bg-white border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-700 placeholder-stone-400 outline-none focus:border-stone-400"
            placeholder="Search posts..."
          />
          <div className="flex gap-2">
            {["All", "Active", "Free", "Paid"].map((f) => (
              <button key={f} className={`px-3 py-2 rounded-lg text-sm font-medium border ${f === "All" ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              {/* Image placeholder */}
              <div className="h-40 bg-stone-100 flex items-center justify-center text-stone-300 text-3xl">
                🖼
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {post.category}
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
      </main>
    </div>
  );
}
