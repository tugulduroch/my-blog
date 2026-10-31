import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReadingProgress from "@/components/ReadingProgress";
import { getAdjacent, getPost, getPosts } from "@/lib/queries";
import { readingTime } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import { plainText, renderContent } from "@/lib/render";
import { site } from "@/lib/site";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: [site.name],
      images: post.cover ? [post.cover] : undefined,
    },
    twitter: { card: post.cover ? "summary_large_image" : "summary" },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const { newer, older } = await getAdjacent(slug);
  // Тайлбар нь эхний догол мөрийн давталт бол (Medium-ээс орсон бичвэр) дахин харуулахгүй.
  const showLead = post.description && !plainText(post.content).startsWith(post.description.replace(/…$/, ""));

  return (
    <>
      <ReadingProgress />
      <main className="container narrow">
        <article className="article">
          <div className="article-meta">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>·</span>
            <span>{readingTime(post.content)} мин унших</span>
          </div>
          <h1>{post.title}</h1>
          {showLead && <p className="lead">{post.description}</p>}
          {post.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="cover" src={post.cover} alt="" />
          )}
          <div className="prose" dangerouslySetInnerHTML={{ __html: renderContent(post.content) }} />
          {post.tags && post.tags.length > 0 && (
            <ul className="tags">
              {post.tags.map((t) => (
                <li key={t}>#{t}</li>
              ))}
            </ul>
          )}
        </article>

        <div className="author-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={site.avatar} alt={site.name} width={44} height={44} />
          <div>
            <strong>{site.name}</strong>
            <span>Зохиогч</span>
          </div>
        </div>

        {(newer || older) && (
          <nav className="pager">
            {older ? (
              <Link href={`/writing/${older.slug}`}>
                <span>← Өмнөх</span>
                {older.title}
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link href={`/writing/${newer.slug}`} className="next">
                <span>Дараах →</span>
                {newer.title}
              </Link>
            )}
          </nav>
        )}
      </main>
    </>
  );
}
