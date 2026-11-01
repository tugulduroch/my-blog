import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { readPosts } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import AdminHeader from "./AdminHeader";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Админ", robots: { index: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const posts = await readPosts();

  return (
    <main className="container">
      <AdminHeader current="posts" newHref="/admin/new" newLabel="+ Шинэ бичвэр" />

      {posts.length === 0 ? (
        <p className="empty">Одоогоор бичвэр алга. «Шинэ бичвэр» дээр дарж эхний бичвэрээ нэмээрэй.</p>
      ) : (
        <ul className="admin-list">
          {posts.map((p) => (
            <li key={p.slug}>
              {p.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.cover} alt="" className="admin-thumb" loading="lazy" />
              ) : (
                <div className="admin-thumb" />
              )}
              <div className="meta">
                <Link href={`/writing/${p.slug}`}>{p.title}</Link>
                <span>
                  {formatDate(p.date)} · /{p.slug}
                </span>
              </div>
              <div className="actions">
                <Link href={`/admin/edit/${p.slug}`} className="btn ghost">
                  Засах
                </Link>
                <DeleteButton slug={p.slug} title={p.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
