import "server-only";
import { unstable_cache } from "next/cache";
import { readPosts, type Post } from "./posts";
import { readProjects } from "./projects";

export const POSTS_TAG = "posts";
export const PROJECTS_TAG = "projects";

// Бичвэр, төслүүдийг кэшилнэ; админаас өөрчлөх бүрт revalidateTag дуудагдана.
export const getPosts = unstable_cache(readPosts, ["posts-v2"], {
  tags: [POSTS_TAG],
  revalidate: 3600,
});

export const getProjects = unstable_cache(readProjects, ["projects-v1"], {
  tags: [PROJECTS_TAG],
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
