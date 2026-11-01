import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { readProjects } from "@/lib/projects";
import AdminHeader from "../AdminHeader";
import DeleteButton from "../DeleteButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Төслүүд — Админ", robots: { index: false } };

export default async function AdminProjectsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const projects = await readProjects();

  return (
    <main className="container">
      <AdminHeader current="projects" newHref="/admin/projects/new" newLabel="+ Шинэ төсөл" />

      {projects.length === 0 ? (
        <p className="empty">Одоогоор төсөл алга. «Шинэ төсөл» дээр дарж эхний төслөө нэмээрэй.</p>
      ) : (
        <ul className="admin-list">
          {projects.map((p) => (
            <li key={p.slug}>
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt="" className="admin-thumb" loading="lazy" />
              ) : (
                <div className="admin-thumb" />
              )}
              <div className="meta">
                <Link href={`/admin/projects/edit/${p.slug}`}>{p.title}</Link>
                <span>
                  {p.date.slice(0, 4)}
                  {p.url && ` · ${new URL(p.url).host}`}
                </span>
              </div>
              <div className="actions">
                <Link href={`/admin/projects/edit/${p.slug}`} className="btn ghost">
                  Засах
                </Link>
                <DeleteButton slug={p.slug} title={p.title} kind="project" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
