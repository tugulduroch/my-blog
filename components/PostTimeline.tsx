import Link from "next/link";
import { readingTime, type Post } from "@/lib/posts";
import { formatDate } from "@/lib/format";

export default function PostTimeline({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return <p className="empty">Одоогоор бичвэр алга.</p>;

  const years = new Map<string, Post[]>();
  for (const p of posts) {
    const y = p.date.slice(0, 4);
    years.set(y, [...(years.get(y) ?? []), p]);
  }

  return (
    <div className="timeline">
      {[...years].map(([year, items]) => (
        <section key={year} className="year-group">
          <div className="year">{year}</div>
          <div>
            {items.map((p) => (
              <article key={p.slug} className="post-item">
                <Link href={`/writing/${p.slug}`} className="post-link">
                  <div className="post-text">
                    <h3>{p.title}</h3>
                    {p.description && <p>{p.description}</p>}
                    <div className="post-meta">
                      <time dateTime={p.date}>{formatDate(p.date)}</time>
                      <span>·</span>
                      <span>{readingTime(p.content)} мин унших</span>
                    </div>
                  </div>
                  {p.cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="post-thumb" src={p.cover} alt="" loading="lazy" />
                  )}
                </Link>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
