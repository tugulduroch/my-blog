"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { Project } from "@/lib/projects";
import { addProject, editProject, upload } from "../actions";

type Props = { project?: Project; today: string };

export default function ProjectForm({ project, today }: Props) {
  const [state, action, pending] = useActionState(project ? editProject : addProject, {});
  const [image, setImage] = useState(project?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function uploadFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await upload(fd);
    setUploading(false);
    if (!res.url) return setUploadError(res.error ?? "Алдаа гарлаа.");
    setImage(res.url);
  }

  return (
    <main className="container">
      <div className="admin-head">
        <h1>{project ? "Төсөл засах" : "Шинэ төсөл"}</h1>
      </div>
      <form action={action} className="form">
        {(state.error || uploadError) && <div className="error">{state.error || uploadError}</div>}
        {project && <input type="hidden" name="original" value={project.slug} />}

        <div className="field">
          <label htmlFor="title">Нэр</label>
          <input id="title" name="title" defaultValue={project?.title} required />
        </div>

        <div className="field">
          <label htmlFor="description">Тайлбар</label>
          <textarea id="description" name="description" className="short" defaultValue={project?.description} />
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="url">Холбоос</label>
            <input id="url" name="url" defaultValue={project?.url} placeholder="https://…" />
            <small>Карт дээр дарахад энэ холбоос нээгдэнэ.</small>
          </div>
          <div className="field">
            <label htmlFor="date">Огноо</label>
            <input id="date" name="date" type="date" defaultValue={project?.date ?? today} />
            <small>Карт дээр он нь харагдана.</small>
          </div>
        </div>

        <div className="field">
          <label htmlFor="image">Зураг</label>
          <div className="inline">
            <input id="image" name="image" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://… эсвэл зураг оруулна уу" />
            <label className="btn">
              {uploading ? "Оруулж байна…" : "Зураг сонгох"}
              <input type="file" accept="image/*" hidden onChange={(e) => uploadFile(e.target.files?.[0])} />
            </label>
          </div>
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="cover-preview" src={image} alt="" />
          )}
        </div>

        <div className="field">
          <label htmlFor="tags">Шошго</label>
          <input id="tags" name="tags" defaultValue={project?.tags?.join(", ")} placeholder="Next.js, дизайн" />
          <small>Таслалаар тусгаарлана.</small>
        </div>

        <div className="actions">
          <Link href="/admin/projects" className="btn ghost">
            Болих
          </Link>
          <button className="btn primary" disabled={pending || uploading}>
            {pending ? "Хадгалж байна…" : project ? "Хадгалах" : "Нэмэх"}
          </button>
        </div>
      </form>
    </main>
  );
}
