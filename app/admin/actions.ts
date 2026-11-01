"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, isAdmin, startSession } from "@/lib/auth";
import { createPost, deletePost, slugify, updatePost, type Post } from "@/lib/posts";
import { createProject, deleteProject, updateProject, type Project } from "@/lib/projects";
import { POSTS_TAG, PROJECTS_TAG } from "@/lib/queries";
import { uploadImage } from "@/lib/store";

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
  revalidateTag(PROJECTS_TAG);
  revalidatePath("/", "layout");
}

const today = () => new Date().toISOString().slice(0, 10);

const parseTags = (value: string) =>
  value
    .split(",")
    .map((t) => t.trim().replace(/^#/, ""))
    .filter(Boolean);

function parsePost(formData: FormData): Post | string {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const title = get("title");
  const content = get("content");
  const date = get("date") || today();
  const slug = slugify(get("slug") || title);
  const cover = get("cover");
  const tags = parseTags(get("tags"));

  if (!title) return "Гарчиг оруулна уу.";
  if (!content) return "Агуулга оруулна уу.";
  if (!slug) return "Slug үүсгэж чадсангүй. Латин үсгээр slug оруулна уу.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Огноо буруу байна.";

  return { slug, title, description: get("description"), content, date, cover: cover || undefined, tags };
}

function parseProject(formData: FormData): Project | string {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const title = get("title");
  const date = get("date") || today();
  const image = get("image");
  let url = get("url");
  if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;

  if (!title) return "Нэр оруулна уу.";
  if (url && !URL.canParse(url)) return "Холбоос буруу байна.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Огноо буруу байна.";

  return {
    // Төслийн slug зөвхөн хадгалахад хэрэглэгдэх тул нэрээс автоматаар үүсгэнэ.
    slug: slugify(title) || `project-${Date.now().toString(36)}`,
    title,
    description: get("description"),
    date,
    url: url || undefined,
    image: image || undefined,
    tags: parseTags(get("tags")),
  };
}

async function save<T extends { slug: string }>(
  item: T | string,
  write: (item: T) => Promise<void>,
  existsError: (slug: string) => string,
  back: string,
): Promise<FormState> {
  if (!(await isAdmin())) redirect("/admin/login");
  if (typeof item === "string") return { error: item };

  try {
    await write(item);
  } catch (err) {
    if (err instanceof Error && err.message === "slug-exists") return { error: existsError(item.slug) };
    console.error(err);
    return { error: "Хадгалах үед алдаа гарлаа." };
  }

  refresh();
  redirect(back);
}

const postExists = (slug: string) => `"${slug}" slug-тай бичвэр аль хэдийн байна. Өөр slug оруулна уу.`;
const projectExists = () => "Ийм нэртэй төсөл аль хэдийн байна. Өөр нэр оруулна уу.";

export async function addPost(_: FormState, formData: FormData) {
  return save(parsePost(formData), createPost, postExists, "/admin");
}

export async function editPost(_: FormState, formData: FormData) {
  const original = String(formData.get("original") ?? "");
  return save(parsePost(formData), (post) => updatePost(original, post), postExists, "/admin");
}

export async function removePost(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const slug = String(formData.get("slug") ?? "");
  if (slug) await deletePost(slug);
  refresh();
}

export async function addProject(_: FormState, formData: FormData) {
  return save(parseProject(formData), createProject, projectExists, "/admin/projects");
}

export async function editProject(_: FormState, formData: FormData) {
  const original = String(formData.get("original") ?? "");
  return save(parseProject(formData), (project) => updateProject(original, project), projectExists, "/admin/projects");
}

export async function removeProject(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const slug = String(formData.get("slug") ?? "");
  if (slug) await deleteProject(slug);
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
