import React from "react";
import { Button } from "@/components/ui/button";

export function Posts() {
   
    async function getPosts() {
  const url = "/api/posts";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(error.message);
  }
}
    const posts = getPosts();
    getPosts();
    return (
        <div className="max-w-md mx-auto p-4">
            <div className="bg-slate-200">
                <h1>Posts</h1>

                <div className="bg-slate-800 min-h-screen">
                    <div className="max-w-5xl mx-auto p-6">
                        <div className="bg-white rounded-xl shadow overflow-hidden">

                            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {post.image_url.map((image_url, i) => (
                                    <img
                                        key={i}
                                        src={image_url}
                                        className="w-full h-64 object-cover"
                                    />
                                ))}
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Posts;
