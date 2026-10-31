import type { Metadata } from "next";
import PostTimeline from "@/components/PostTimeline";
import { getPosts } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = { title: "Бичвэрүүд" };

export default async function Writing() {
  const posts = await getPosts();
  return (
    <main className="container">
      <div className="hero">
        <h1>Бүх бичвэрүүд</h1>
        <p>Он оноор нь эрэмбэлсэн {posts.length} тэмдэглэл, эргэцүүлэл.</p>
      </div>
      <PostTimeline posts={posts} />
    </main>
  );
}
