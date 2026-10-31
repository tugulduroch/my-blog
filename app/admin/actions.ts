"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, isAdmin, startSession } from "@/lib/auth";
import { createPost, deletePost, slugify, updatePost, uploadImage, type Post } from "@/lib/posts";
import { POSTS_TAG } from "@/lib/queries";

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

function refresh() {
  revalidateTag(POSTS_TAG);
  revalidatePath("/", "layout");
}

function parsePost(formData: FormData): Post | string {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const title = get("title");
  const content = get("content");
  const date = get("date") || new Date().toISOString().slice(0, 10);
  const slug = slugify(get("slug") || title);
  const cover = get("cover");
  const tags = get("tags")
    .split(",")
    .map((t) => t.trim().replace(/^#/, ""))
    .filter(Boolean);

  if (!title) return "Гарчиг оруулна уу.";
  if (!content) return "Агуулга оруулна уу.";
  if (!slug) return "Slug үүсгэж чадсангүй. Латин үсгээр slug оруулна уу.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Огноо буруу байна.";

  return { slug, title, description: get("description"), content, date, cover: cover || undefined, tags };
}

async function save(formData: FormData, write: (post: Post) => Promise<void>): Promise<FormState> {
  if (!(await isAdmin())) redirect("/admin/login");
  const post = parsePost(formData);
  if (typeof post === "string") return { error: post };

  try {
    await write(post);
  } catch (err) {
    if (err instanceof Error && err.message === "slug-exists") {
      return { error: `"${post.slug}" slug-тай бичвэр аль хэдийн байна. Өөр slug оруулна уу.` };
    }
    console.error(err);
    return { error: "Хадгалах үед алдаа гарлаа." };
  }

  refresh();
  redirect("/admin");
}

export async function addPost(_: FormState, formData: FormData) {
  return save(formData, createPost);
}

export async function editPost(_: FormState, formData: FormData) {
  const original = String(formData.get("original") ?? "");
  return save(formData, (post) => updatePost(original, post));
}

export async function removePost(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const slug = String(formData.get("slug") ?? "");
  if (slug) await deletePost(slug);
  refresh();
}

export async function upload(formData: FormData): Promise<{ url?: string; error?: string }> {
  if (!(await isAdmin())) return { error: "Нэвтрэх шаардлагатай." };
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Файл сонгоно уу." };
  if (!file.type.startsWith("image/")) return { error: "Зөвхөн зураг оруулна уу." };
  if (file.size > 4 * 1024 * 1024) return { error: "Зураг 4MB-аас бага байх ёстой." };
  try {
    return { url: await uploadImage(file) };
  } catch (err) {
    console.error(err);
    return { error: "Зураг оруулахад алдаа гарлаа." };
  }
}
