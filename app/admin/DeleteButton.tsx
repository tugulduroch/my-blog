"use client";

import { useFormStatus } from "react-dom";
import { removePost, removeProject } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn danger" disabled={pending}>
      {pending ? "Устгаж байна…" : "Устгах"}
    </button>
  );
}

type Props = { slug: string; title: string; kind?: "post" | "project" };

export default function DeleteButton({ slug, title, kind = "post" }: Props) {
  return (
    <form
      action={kind === "project" ? removeProject : removePost}
      onSubmit={(e) => {
        if (!confirm(`"${title}" ${kind === "project" ? "төслийг" : "бичвэрийг"} устгах уу?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <Submit />
    </form>
  );
}
