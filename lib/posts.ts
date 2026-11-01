// Next-ээс хамааралгүй тул scripts/ дотроос ч ашиглаж болно.
import { collection } from "./store.ts";

export type Post = {
  slug: string;
  title: string;
  description: string;
  content: string; // Markdown (HTML ч зөвшөөрнө)
  date: string; // YYYY-MM-DD
  cover?: string;
  tags?: string[];
};

const posts = collection<Post>("posts");

export const readPosts = posts.read;
export const createPost = posts.create;
export const updatePost = posts.update;
export const deletePost = posts.remove;

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
