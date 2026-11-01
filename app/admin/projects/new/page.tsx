import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import ProjectForm from "../ProjectForm";

export const metadata: Metadata = { title: "Шинэ төсөл", robots: { index: false } };

export default async function NewProjectPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <ProjectForm today={new Date().toISOString().slice(0, 10)} />;
}
