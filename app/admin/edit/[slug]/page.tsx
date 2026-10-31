import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { readPosts } from "@/lib/posts";
import PostForm from "../../PostForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Бичвэр засах", robots: { index: false } };

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { slug } = await params;
  // Засвар хийхдээ кэшгүйгээр шууд уншина.
  const post = (await readPosts()).find((p) => p.slug === slug);
  if (!post) notFound();
  return <PostForm post={post} today={new Date().toISOString().slice(0, 10)} />;
}
