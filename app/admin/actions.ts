"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, isAdmin, startSession } from "@/lib/auth";
import { createPost, deletePost, slugify } from "@/lib/posts";

export type FormState = { error?: string };

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  if (!process.env.ADMIN_PASSWORD) return { error: "ADMIN_PASSWORD орчны хувьсагч тохируулаагүй байна." };
  if (!checkPassword(String(formData.get("password") ?? ""))) return { error: "Нууц үг буруу байна." };
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/");
}

export async function addPost(_: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) redirect("/admin/login");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim() || new Date().toISOString().slice(0, 10);
  const slug = slugify(String(formData.get("slug") ?? "").trim() || title);

  if (!title) return { error: "Гарчиг оруулна уу." };
  if (!content) return { error: "Агуулга оруулна уу." };
  if (!slug) return { error: "Slug үүсгэж чадсангүй. Латин үсгээр slug оруулна уу." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Огноо буруу байна." };

  try {
    await createPost({ slug, title, description, content, date });
  } catch (err) {
    if (err instanceof Error && err.message === "slug-exists") {
      return { error: `"${slug}" slug-тай бичвэр аль хэдийн байна. Өөр slug оруулна уу.` };
    }
    console.error(err);
    return { error: "Хадгалах үед алдаа гарлаа." };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function removePost(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const slug = String(formData.get("slug") ?? "");
  if (slug) await deletePost(slug);
  revalidatePath("/", "layout");
}
