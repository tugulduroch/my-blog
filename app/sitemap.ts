import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/queries";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/writing`, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((p) => ({ url: `${siteUrl}/writing/${p.slug}`, lastModified: p.date, priority: 0.6 })),
  ];
}
