import PostTimeline from "@/components/PostTimeline";
import { getPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getPosts();
  return (
    <main className="container">
      <div className="hero">
        <h1>{site.title}</h1>
        <p>{site.description}</p>
      </div>
      <PostTimeline posts={posts.slice(0, 5)} />
    </main>
  );
}
