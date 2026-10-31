import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { getPost } from "@/lib/posts";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post ? { title: post.title, description: post.description } : {};
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  const html = marked.parse(post.content, { async: false });

  return (
    <main className="container narrow">
      <article className="article">
        <time className="article-date" dateTime={post.date}>
          {formatDate(post.date)}
        </time>
        <h1>{post.title}</h1>
        {post.description && <p className="lead">{post.description}</p>}
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
      <Link href="/writing" className="back">
        ← Бүх бичвэр рүү буцах
      </Link>
    </main>
  );
}
