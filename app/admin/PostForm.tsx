"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import type { Post } from "@/lib/posts";
import { addPost, editPost, upload } from "./actions";

type Props = { post?: Post; today: string };

export default function PostForm({ post, today }: Props) {
  const [state, action, pending] = useActionState(post ? editPost : addPost, {});
  const [cover, setCover] = useState(post?.cover ?? "");
  const [uploading, setUploading] = useState<"cover" | "content" | null>(null);
  const [uploadError, setUploadError] = useState("");
  const content = useRef<HTMLTextAreaElement>(null);

  async function uploadFile(file: File | undefined, target: "cover" | "content") {
    if (!file) return;
    setUploading(target);
    setUploadError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await upload(fd);
    setUploading(null);
    if (!res.url) return setUploadError(res.error ?? "Алдаа гарлаа.");

    if (target === "cover") return setCover(res.url);
    const ta = content.current;
    if (!ta) return;
    const md = `\n\n![](${res.url})\n\n`;
    const at = ta.selectionStart ?? ta.value.length;
    ta.value = ta.value.slice(0, at) + md + ta.value.slice(at);
    ta.focus();
    ta.selectionStart = ta.selectionEnd = at + md.length;
  }

  return (
    <main className="container">
      <div className="admin-head">
        <h1>{post ? "Бичвэр засах" : "Шинэ бичвэр"}</h1>
      </div>
      <form action={action} className="form">
        {(state.error || uploadError) && <div className="error">{state.error || uploadError}</div>}
        {post && <input type="hidden" name="original" value={post.slug} />}

        <div className="field">
          <label htmlFor="title">Гарчиг</label>
          <input id="title" name="title" defaultValue={post?.title} required />
        </div>

        <div className="field">
          <label htmlFor="description">Товч тайлбар</label>
          <input id="description" name="description" defaultValue={post?.description} />
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="slug">Slug (URL)</label>
            <input id="slug" name="slug" defaultValue={post?.slug} placeholder="hooson-bol-garchgaas-uusgene" />
            <small>Хоосон орхивол гарчгаас автоматаар үүснэ.</small>
          </div>
          <div className="field">
            <label htmlFor="date">Огноо</label>
            <input id="date" name="date" type="date" defaultValue={post?.date ?? today} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="cover">Нүүр зураг</label>
          <div className="inline">
            <input id="cover" name="cover" value={cover} onChange={(e) => setCover(e.target.value)} placeholder="https://… эсвэл зураг оруулна уу" />
            <label className="btn">
              {uploading === "cover" ? "Оруулж байна…" : "Зураг сонгох"}
              <input type="file" accept="image/*" hidden onChange={(e) => uploadFile(e.target.files?.[0], "cover")} />
            </label>
          </div>
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="cover-preview" src={cover} alt="" />
          )}
        </div>

        <div className="field">
          <label htmlFor="tags">Шошго</label>
          <input id="tags" name="tags" defaultValue={post?.tags?.join(", ")} placeholder="амьдрал, тэмдэглэл" />
          <small>Таслалаар тусгаарлана.</small>
        </div>

        <div className="field">
          <div className="label-row">
            <label htmlFor="content">Агуулга (Markdown)</label>
            <label className="btn small">
              {uploading === "content" ? "Оруулж байна…" : "+ Зураг оруулах"}
              <input type="file" accept="image/*" hidden onChange={(e) => uploadFile(e.target.files?.[0], "content")} />
            </label>
          </div>
          <textarea
            ref={content}
            id="content"
            name="content"
            required
            defaultValue={post?.content}
            placeholder={"## Гарчиг\n\nЭнд бичвэрээ бичнэ үү. **Тод**, *налуу*, [холбоос](https://...)\n\nYouTube холбоосыг тусдаа мөрөнд бичвэл видео болж харагдана."}
          />
        </div>

        <div className="actions">
          <Link href="/admin" className="btn ghost">
            Болих
          </Link>
          <button className="btn primary" disabled={pending || uploading !== null}>
            {pending ? "Хадгалж байна…" : post ? "Хадгалах" : "Нийтлэх"}
          </button>
        </div>
      </form>
    </main>
  );
}
