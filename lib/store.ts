// Хадгалалтын давхарга. Next-ээс хамааралгүй тул scripts/ дотроос ч ашиглаж болно.
import { promises as fs } from "fs";
import path from "path";
import { put, list, del } from "@vercel/blob";

type Item = { slug: string; title: string; date: string };

// BLOB_READ_WRITE_TOKEN байвал Vercel Blob, байхгүй бол локал JSON файл ашиглана.
const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const byDateDesc = (a: Item, b: Item) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title);

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

// Blob дээр бичлэг бүр <name>/<slug>/<санамсаргүй>.json хэлбэрээр хадгалагдана.
// URL бүр давтагдашгүй тул засах үед CDN-ийн хуучин кэш асуудал үүсгэхгүй.
// Локал дээр data/<name>.json файлд хадгална.
export function collection<T extends Item>(name: string) {
  const PREFIX = `${name}/`;
  const LOCAL_FILE = path.join(process.cwd(), "data", `${name}.json`);

  async function readLocal(): Promise<T[]> {
    try {
      return JSON.parse(await fs.readFile(LOCAL_FILE, "utf8"));
    } catch {
      return [];
    }
  }

  async function writeLocal(items: T[]) {
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(LOCAL_FILE, JSON.stringify(items.sort(byDateDesc), null, 2) + "\n");
  }

  async function slugExists(slug: string) {
    if (!useBlob()) return (await readLocal()).some((p) => p.slug === slug);
    return (await list({ prefix: `${PREFIX}${slug}/`, limit: 1 })).blobs.length > 0;
  }

  async function writeBlob(item: T) {
    return put(`${PREFIX}${item.slug}/item.json`, JSON.stringify(item), {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/json",
    });
  }

  async function read(): Promise<T[]> {
    if (!useBlob()) return (await readLocal()).sort(byDateDesc);

    const blobs = await listBlobs(PREFIX);
    // Нэг slug дор олон файл үлдсэн бол хамгийн сүүлийнхийг авна.
    const latest = new Map<string, (typeof blobs)[number]>();
    for (const b of blobs) {
      const slug = b.pathname.slice(PREFIX.length).split("/")[0];
      const prev = latest.get(slug);
      if (!prev || b.uploadedAt > prev.uploadedAt) latest.set(slug, b);
    }
    const items = (await Promise.all(
      [...latest.values()].map(async (b) => {
        const res = await fetch(b.url);
        return res.ok ? await res.json() : null;
      }),
    )) as (T | null)[];
    return items.filter((p): p is T => p !== null).sort(byDateDesc);
  }

  async function create(item: T) {
    if (await slugExists(item.slug)) throw new Error("slug-exists");
    if (!useBlob()) return writeLocal([...(await readLocal()), item]);
    await writeBlob(item);
  }

  async function update(oldSlug: string, item: T) {
    if (item.slug !== oldSlug && (await slugExists(item.slug))) throw new Error("slug-exists");

    if (!useBlob()) {
      const items = (await readLocal()).filter((p) => p.slug !== oldSlug);
      return writeLocal([...items, item]);
    }
    const old = await listBlobs(`${PREFIX}${oldSlug}/`);
    const created = await writeBlob(item);
    const stale = old.filter((b) => b.url !== created.url).map((b) => b.url);
    if (stale.length) await del(stale);
  }

  async function remove(slug: string) {
    if (!useBlob()) return writeLocal((await readLocal()).filter((p) => p.slug !== slug));
    const blobs = await listBlobs(`${PREFIX}${slug}/`);
    if (blobs.length) await del(blobs.map((b) => b.url));
  }

  return { read, create, update, remove };
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
