import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { put, list, del } from "@vercel/blob";

export type Post = {
  slug: string;
  title: string;
  description: string;
  content: string; // Markdown
  date: string; // YYYY-MM-DD
};

// BLOB_READ_WRITE_TOKEN байвал Vercel Blob, байхгүй бол локал JSON файл ашиглана.
const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const PREFIX = "posts/";
const LOCAL_FILE = path.join(process.cwd(), "data", "posts.json");

const byDateDesc = (a: Post, b: Post) => b.date.localeCompare(a.date);

async function readLocal(): Promise<Post[]> {
  try {
    return JSON.parse(await fs.readFile(LOCAL_FILE, "utf8"));
  } catch {
    return [];
  }
}

async function writeLocal(posts: Post[]) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(posts, null, 2));
}

export async function getPosts(): Promise<Post[]> {
  if (!useBlob()) return (await readLocal()).sort(byDateDesc);

  const { blobs } = await list({ prefix: PREFIX });
  const posts = await Promise.all(
    blobs.map(async (b) => {
      const res = await fetch(b.url, { cache: "no-store" });
      return res.ok ? ((await res.json()) as Post) : null;
    }),
  );
  return posts.filter((p): p is Post => p !== null).sort(byDateDesc);
}

export async function getPost(slug: string): Promise<Post | null> {
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function createPost(post: Post) {
  if (!useBlob()) {
    const posts = await readLocal();
    if (posts.some((p) => p.slug === post.slug)) throw new Error("slug-exists");
    await writeLocal([...posts, post]);
    return;
  }
  try {
    await put(`${PREFIX}${post.slug}.json`, JSON.stringify(post), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: "application/json",
    });
  } catch (err) {
    if (err instanceof Error && /already exists/i.test(err.message)) throw new Error("slug-exists");
    throw err;
  }
}

export async function deletePost(slug: string) {
  if (!useBlob()) {
    await writeLocal((await readLocal()).filter((p) => p.slug !== slug));
    return;
  }
  const { blobs } = await list({ prefix: `${PREFIX}${slug}.json` });
  if (blobs.length) await del(blobs.map((b) => b.url));
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
