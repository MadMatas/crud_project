import React from "react";
import { Button } from "@/components/ui/button";

export function AddPost({ user, onLogout }: { user: any; onLogout?: () => void }) {
  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-semibold">User Area</h2>
      <p className="mt-2">Welcome, <strong>{user?.username ?? "user"}</strong>!</p>
      <div className="bg-slate-200">
        <h3>Add post</h3>
        <form action="">
            <label htmlFor="postTitle">Post Title</label><br />
            <input type="text" id="postTitle" name="postTitle"/><br />
            <label htmlFor="postDescription">Post Description</label><br />
            <input type="text" id="postDescription" name="postDescription"/>
            <input type="button" value="Post"/>
        </form>
      </div>
      
    </div>
  );
}

export default AddPost;
