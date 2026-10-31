"use client";

import { useFormStatus } from "react-dom";
import { removePost } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn danger" disabled={pending}>
      {pending ? "Устгаж байна…" : "Устгах"}
    </button>
  );
}

export default function DeleteButton({ slug, title }: { slug: string; title: string }) {
  return (
    <form
      action={removePost}
      onSubmit={(e) => {
        if (!confirm(`"${title}" бичвэрийг устгах уу?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <Submit />
    </form>
  );
}
