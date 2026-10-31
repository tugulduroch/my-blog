"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addPost } from "../actions";

export default function NewPostForm({ today }: { today: string }) {
  const [state, action, pending] = useActionState(addPost, {});

  return (
    <main className="container">
      <div className="admin-head">
        <h1>Шинэ бичвэр</h1>
      </div>
      <form action={action} className="form">
        {state.error && <div className="error">{state.error}</div>}

        <div className="field">
          <label htmlFor="title">Гарчиг</label>
          <input id="title" name="title" required />
        </div>

        <div className="field">
          <label htmlFor="description">Товч тайлбар</label>
          <input id="description" name="description" />
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="slug">Slug (URL)</label>
            <input id="slug" name="slug" placeholder="hooson-bol-garchgaas-uusgene" />
            <small>Хоосон орхивол гарчгаас автоматаар үүснэ.</small>
          </div>
          <div className="field">
            <label htmlFor="date">Огноо</label>
            <input id="date" name="date" type="date" defaultValue={today} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="content">Агуулга (Markdown)</label>
          <textarea
            id="content"
            name="content"
            required
            placeholder={"## Гарчиг\n\nЭнд бичвэрээ бичнэ үү. **Тод**, *налуу*, [холбоос](https://...), ![зураг](https://...)"}
          />
        </div>

        <div className="actions">
          <Link href="/admin" className="btn ghost">
            Болих
          </Link>
          <button className="btn primary" disabled={pending}>
            {pending ? "Хадгалж байна…" : "Нийтлэх"}
          </button>
        </div>
      </form>
    </main>
  );
}
