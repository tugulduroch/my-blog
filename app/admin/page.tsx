import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getPosts } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import { logout } from "./actions";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Админ", robots: { index: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const posts = await getPosts();

  return (
    <main className="container">
      <div className="admin-head">
        <h1>Бичвэрүүд</h1>
        <div className="actions">
          <form action={logout}>
            <button className="btn ghost">Гарах</button>
          </form>
          <Link href="/admin/new" className="btn primary">
            + Шинэ бичвэр
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="empty">Одоогоор бичвэр алга. «Шинэ бичвэр» дээр дарж эхний бичвэрээ нэмээрэй.</p>
      ) : (
        <ul className="admin-list">
          {posts.map((p) => (
            <li key={p.slug}>
              <div className="meta">
                <Link href={`/writing/${p.slug}`}>{p.title}</Link>
                <span>
                  {formatDate(p.date)} · /{p.slug}
                </span>
              </div>
              <DeleteButton slug={p.slug} title={p.title} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
