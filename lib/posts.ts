// Хадгалалтын давхарга. Next-ээс хамааралгүй тул scripts/ дотроос ч ашиглаж болно.
import { promises as fs } from "fs";
import path from "path";
import { put, list, del } from "@vercel/blob";

export type Post = {
  slug: string;
  title: string;
  description: string;
  content: string; // Markdown (HTML ч зөвшөөрнө)
  date: string; // YYYY-MM-DD
  cover?: string;
  tags?: string[];
};

// BLOB_READ_WRITE_TOKEN байвал Vercel Blob, байхгүй бол локал JSON файл ашиглана.
const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
// Blob дээр бичвэр бүр posts/<slug>/<санамсаргүй>.json хэлбэрээр хадгалагдана.
// URL бүр давтагдашгүй тул засах үед CDN-ийн хуучин кэш асуудал үүсгэхгүй.
const PREFIX = "posts/";
const LOCAL_FILE = path.join(process.cwd(), "data", "posts.json");

const byDateDesc = (a: Post, b: Post) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title);

async function readLocal(): Promise<Post[]> {
  try {
    return JSON.parse(await fs.readFile(LOCAL_FILE, "utf8"));
  } catch {
    return [];
  }
}

async function writeLocal(posts: Post[]) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(posts.sort(byDateDesc), null, 2) + "\n");
}

async function listBlobs(prefix: string) {
  const blobs = [];
  let cursor: string | undefined;
  do {
    const res = await list({ prefix, cursor, limit: 1000 });
    blobs.push(...res.blobs);
    cursor = res.hasMore ? res.cursor : undefined;
  } while (cursor);
  return blobs;
}

export async function readPosts(): Promise<Post[]> {
  if (!useBlob()) return (await readLocal()).sort(byDateDesc);

  const blobs = await listBlobs(PREFIX);
  // Нэг slug дор олон файл үлдсэн бол хамгийн сүүлийнхийг авна.
  const latest = new Map<string, (typeof blobs)[number]>();
  for (const b of blobs) {
    const slug = b.pathname.slice(PREFIX.length).split("/")[0];
    const prev = latest.get(slug);
    if (!prev || b.uploadedAt > prev.uploadedAt) latest.set(slug, b);
  }
  const posts = await Promise.all(
    [...latest.values()].map(async (b) => {
      const res = await fetch(b.url);
      return res.ok ? ((await res.json()) as Post) : null;
    }),
  );
  return posts.filter((p): p is Post => p !== null).sort(byDateDesc);
}

async function slugExists(slug: string) {
  if (!useBlob()) return (await readLocal()).some((p) => p.slug === slug);
  return (await list({ prefix: `${PREFIX}${slug}/`, limit: 1 })).blobs.length > 0;
}

async function writeBlob(post: Post) {
  return put(`${PREFIX}${post.slug}/post.json`, JSON.stringify(post), {
    access: "public",
    addRandomSuffix: true,
    contentType: "application/json",
  });
}

export async function createPost(post: Post) {
  if (await slugExists(post.slug)) throw new Error("slug-exists");
  if (!useBlob()) return writeLocal([...(await readLocal()), post]);
  await writeBlob(post);
}

export async function updatePost(oldSlug: string, post: Post) {
  if (post.slug !== oldSlug && (await slugExists(post.slug))) throw new Error("slug-exists");

  if (!useBlob()) {
    const posts = (await readLocal()).filter((p) => p.slug !== oldSlug);
    return writeLocal([...posts, post]);
  }
  const old = await listBlobs(`${PREFIX}${oldSlug}/`);
  const created = await writeBlob(post);
  const stale = old.filter((b) => b.url !== created.url).map((b) => b.url);
  if (stale.length) await del(stale);
}

export async function deletePost(slug: string) {
  if (!useBlob()) return writeLocal((await readLocal()).filter((p) => p.slug !== slug));
  const blobs = await listBlobs(`${PREFIX}${slug}/`);
  if (blobs.length) await del(blobs.map((b) => b.url));
}

export async function uploadImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `${Date.now().toString(36)}.${ext}`;
  if (useBlob()) {
    const blob = await put(`images/${name}`, file, { access: "public", addRandomSuffix: true });
    return blob.url;
  }
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

// Кирилл үсгийг латин болгож URL-д тохирох slug үүсгэнэ.
const CYR: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "i",
  к: "k", л: "l", м: "m", н: "n", о: "o", ө: "u", п: "p", р: "r", с: "s", т: "t", у: "u",
  ү: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "y", ь: "", э: "e",
  ю: "yu", я: "ya",
};

export function slugify(input: string) {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => CYR[ch] ?? ch)
    .join("")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function readingTime(content: string) {
  const words = content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
