import Link from "next/link";
import type { Post } from "@/lib/posts";

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
                <h3>
                  <Link href={`/writing/${p.slug}`}>{p.title}</Link>
                </h3>
                {p.description && <p>{p.description}</p>}
                <Link href={`/writing/${p.slug}`} className="more">
                  Унших
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
