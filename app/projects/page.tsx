import type { Metadata } from "next";
import { getProjects } from "@/lib/queries";
import type { Project } from "@/lib/projects";

export const revalidate = 3600;

export const metadata: Metadata = { title: "Төслүүд" };

function ProjectCard({ project: p }: { project: Project }) {
  const body = (
    <>
      {p.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="project-image" src={p.image} alt="" loading="lazy" />
      )}
      <div className="project-body">
        <div className="project-title">
          <h2>{p.title}</h2>
          <time dateTime={p.date}>{p.date.slice(0, 4)}</time>
        </div>
        {p.description && <p>{p.description}</p>}
        {p.tags && p.tags.length > 0 && (
          <ul className="project-tags">
            {p.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
        {p.url && <span className="project-link">{new URL(p.url).host.replace(/^www\./, "")} ↗</span>}
      </div>
    </>
  );

  return p.url ? (
    <a className="project" href={p.url} target="_blank" rel="noopener noreferrer">
      {body}
    </a>
  ) : (
    <div className="project">{body}</div>
  );
}

export default async function Projects() {
  const projects = await getProjects();
  return (
    <main className="container">
      <div className="hero">
        <h1>Төслүүд</h1>
      </div>
      {projects.length === 0 ? (
        <p className="empty-state">Одоогоор төсөл нэмэгдээгүй байна.</p>
      ) : (
        <div className="projects">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      )}
    </main>
  );
}
