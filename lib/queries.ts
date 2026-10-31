import "server-only";
import { unstable_cache } from "next/cache";
import { readPosts, type Post } from "./posts";

export const POSTS_TAG = "posts";

// Бичвэрүүдийг кэшилнэ; админаас өөрчлөх бүрт revalidateTag(POSTS_TAG) дуудагдана.
export const getPosts = unstable_cache(readPosts, ["posts-v2"], {
  tags: [POSTS_TAG],
  revalidate: 3600,
});

export async function getPost(slug: string): Promise<Post | null> {
  return (await getPosts()).find((p) => p.slug === slug) ?? null;
}

export async function getAdjacent(slug: string) {
  const posts = await getPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  return { newer: i > 0 ? posts[i - 1] : null, older: i >= 0 ? (posts[i + 1] ?? null) : null };
}
