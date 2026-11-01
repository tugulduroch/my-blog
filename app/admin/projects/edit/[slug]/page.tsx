import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { readProjects } from "@/lib/projects";
import ProjectForm from "../../ProjectForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Төсөл засах", robots: { index: false } };

export default async function EditProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { slug } = await params;
  const project = (await readProjects()).find((p) => p.slug === slug);
  if (!project) notFound();
  return <ProjectForm project={project} today={new Date().toISOString().slice(0, 10)} />;
}
