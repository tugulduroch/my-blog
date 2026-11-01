import Link from "next/link";
import PostTimeline from "@/components/PostTimeline";
import { getPosts } from "@/lib/queries";

export const revalidate = 3600;

export default async function Home() {
  const posts = await getPosts();
  return (
    <main className="container">
      <h2 className="section-title">Сүүлийн бичвэрүүд</h2>
      <PostTimeline posts={posts.slice(0, 5)} />
      {posts.length > 5 && (
        <Link href="/writing" className="see-all">
          Бүх {posts.length} бичвэрийг харах →
        </Link>
      )}
    </main>
  );
}
