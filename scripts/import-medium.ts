// Medium-ийн RSS-ээс бичвэрүүдийг татаж блог руу оруулна.
//
//   npm run import:medium -- tugulduroch           → data/posts.json (локал)
//   vercel env pull && npm run import:medium:prod  → Vercel Blob (production)
//
// Аль хэдийн байгаа slug-тай бичвэрийг алгасна. Тэмдэглэл: Medium-ийн RSS сүүлийн 10 бичвэрийг л өгдөг.
import { createPost, readPosts, slugify, type Post } from "../lib/posts.ts";

const username = (process.argv[2] || "tugulduroch").replace(/^@/, "");

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

const tag = (xml: string, name: string) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`));
  return m ? m[1].trim() : "";
};

function youtubeId(src: string) {
  const m = decode(src).match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{11})/);
  return m?.[1];
}

function cleanHtml(html: string) {
  let cover: string | undefined;

  html = html
    // Medium-ийн статистикийн пиксел
    .replace(/<img[^>]+medium\.com\/_\/stat[^>]*>/g, "")
    // Embedly iframe → энгийн холбоос (YouTube холбоосыг сайт өөрөө embed болгож харуулна)
    .replace(/<iframe[^>]*src="([^"]+)"[^>]*>[\s\S]*?<\/iframe>/g, (_, src: string) => {
      const id = youtubeId(src);
      if (id) return `<p><a href="https://www.youtube.com/watch?v=${id}">https://www.youtube.com/watch?v=${id}</a></p>`;
      const url = decode(src).match(/[?&]url=([^&]+)/)?.[1];
      return url ? `<p><a href="${decodeURIComponent(url)}">${decodeURIComponent(url)}</a></p>` : "";
    })
    // Medium-ийн гарчгийн түвшинг блогийнхтой тааруулна
    .replace(/<(\/?)h3>/g, "<$1h2>")
    .replace(/<(\/?)h4>/g, "<$1h3>")
    .replace(/<img /g, '<img loading="lazy" ');

  // Эхний зургийг нүүр зураг болгоно
  const first = html.match(/^\s*<figure>\s*<img[^>]*src="([^"]+)"[^>]*\/?>\s*(?:<figcaption>[\s\S]*?<\/figcaption>)?\s*<\/figure>/);
  if (first) {
    cover = first[1];
    html = html.slice(first[0].length);
  }

  // Блок бүрийг хоосон мөрөөр тусгаарлавал засварлахад амар
  html = html.replace(/<\/(p|figure|h2|h3|blockquote|ul|ol|pre|div)>\s*(?=<)/g, "</$1>\n\n").replace(/<hr\s*\/?>/g, "\n<hr>\n").trim();

  return { html, cover };
}

function excerpt(html: string, max = 180) {
  const text = decode((html.match(/<p>([\s\S]*?)<\/p>/)?.[1] ?? "").replace(/<[^>]+>/g, "")).trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

async function main() {
  const res = await fetch(`https://medium.com/feed/@${username}`, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`RSS татаж чадсангүй: ${res.status}`);
  const xml = await res.text();
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

  const existing = new Set((await readPosts()).map((p) => p.slug));
  const target = process.env.BLOB_READ_WRITE_TOKEN ? "Vercel Blob" : "data/posts.json";
  console.log(`@${username}: ${items.length} бичвэр олдлоо → ${target}`);

  for (const item of items) {
    const title = decode(tag(item, "title"));
    const { html, cover } = cleanHtml(tag(item, "content:encoded"));
    const post: Post = {
      slug: slugify(title),
      title,
      description: excerpt(html),
      content: html,
      date: new Date(tag(item, "pubDate")).toISOString().slice(0, 10),
      cover,
      tags: [...item.matchAll(/<category><!\[CDATA\[(.*?)\]\]><\/category>/g)].map((m) => m[1]),
    };

    if (existing.has(post.slug)) {
      console.log(`  – алгаслаа (байгаа): ${title}`);
      continue;
    }
    await createPost(post);
    existing.add(post.slug);
    console.log(`  + ${post.date}  ${title}  →  /writing/${post.slug}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
