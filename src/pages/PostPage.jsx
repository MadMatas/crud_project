export default function PostPage() {
  const post = {
    id: 3,
    title: "Canon EOS 90D Body",
    description: "Low shutter count (~8k), sensor in perfect condition. Comes with original box, strap, and battery charger. No lens included. Selling because I switched to mirrorless.",
    price: 850,
    category: "Electronics",
    username: "Tomas",
    is_admin: false,
    is_active: true,
    is_blocked: false,
    created_at: "2026-05-15",
    updated_at: "2026-05-16",
    image_url: null,
  };

  const comments = [
    { id: 1, username: "Eglė", content: "Is this still available? Can I pick it up in Kaunas?", created_at: "2026-05-16", is_removed: false },
    { id: 2, username: "Rokas", content: "What's the lowest you'd go?", created_at: "2026-05-17", is_removed: false },
    { id: 3, username: "Admin", content: "spam removed", created_at: "2026-05-17", is_removed: true },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center gap-3">
        <button className="text-stone-400 hover:text-stone-600 text-sm">← Back</button>
        <span className="text-stone-300">|</span>
        <span className="text-xs text-stone-400">Post #{post.id}</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Image */}
            <div className="bg-stone-100 rounded-xl h-64 flex items-center justify-center text-stone-300 text-5xl border border-stone-200">
              🖼
            </div>

            {/* Title card */}
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{post.category}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.is_active ? "text-green-600 bg-green-50" : "text-stone-400 bg-stone-100"}`}>
                  {post.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <h1 className="text-xl font-bold text-stone-800 mb-2">{post.title}</h1>
              <p className="text-sm text-stone-500 leading-relaxed">{post.description}</p>

              <div className="flex items-center justify-between mt-5 pt-5 border-t border-stone-100">
                <span className="text-2xl font-bold text-stone-800">
                  {post.price ? `€${post.price}` : <span className="text-base font-normal text-stone-400">Free</span>}
                </span>
                <div className="flex gap-2">
                  <button className="bg-stone-800 text-white text-sm font-medium px-4 py-2 rounded-lg">
                    Contact seller
                  </button>
                  <button className="border border-stone-200 text-stone-400 text-sm px-3 py-2 rounded-lg">
                    🤍
                  </button>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-stone-700 mb-4">
                Comments <span className="text-stone-300 font-normal ml-1">{comments.filter(c => !c.is_removed).length}</span>
              </h2>

              {/* Comment input */}
              <div className="flex gap-2 mb-5">
                <input className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm placeholder-stone-300 text-stone-700 outline-none focus:border-stone-400" placeholder="Write a comment…" />
                <button className="bg-stone-800 text-white text-sm font-medium px-4 py-2 rounded-lg">Post</button>
              </div>

              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className={`p-3 rounded-lg border ${c.is_removed ? "border-stone-100 opacity-40" : "border-stone-100 bg-stone-50"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-500 text-xs font-bold flex items-center justify-center">
                        {c.username[0]}
                      </div>
                      <span className="text-xs font-semibold text-stone-600">{c.username}</span>
                      <span className="text-xs text-stone-300 ml-auto">{c.created_at}</span>
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
                  ["Posted", post.created_at],
                  ["Updated", post.updated_at],
                  ["Category", post.category],
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
                  {post.username[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-700">{post.username}</p>
                  <p className="text-xs text-stone-400">{post.is_admin ? "Admin" : "Member"}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
