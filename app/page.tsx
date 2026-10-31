import Link from "next/link";
import PostTimeline from "@/components/PostTimeline";
import { getPosts } from "@/lib/queries";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function Home() {
  const posts = await getPosts();
  return (
    <main className="container">
      <div className="hero">
        <div className="profile">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={site.avatar} alt={site.name} width={56} height={56} />
          <div>
            <strong>{site.name}</strong>
            <span>{posts.length} бичвэр</span>
          </div>
        </div>
        <h1>{site.title}</h1>
        <p>{site.description}</p>
      </div>

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
