import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import PostForm from "../PostForm";

export const metadata: Metadata = { title: "Шинэ бичвэр", robots: { index: false } };

export default async function NewPostPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <PostForm today={new Date().toISOString().slice(0, 10)} />;
}
