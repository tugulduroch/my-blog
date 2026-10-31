"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, {});

  return (
    <main className="container" style={{ maxWidth: 400 }}>
      <div className="admin-head">
        <h1>Админ нэвтрэх</h1>
      </div>
      <form action={action} className="form">
        {state.error && <div className="error">{state.error}</div>}
        <div className="field">
          <label htmlFor="password">Нууц үг</label>
          <input id="password" name="password" type="password" autoFocus required />
        </div>
        <button className="btn primary" disabled={pending}>
          {pending ? "Шалгаж байна…" : "Нэвтрэх"}
        </button>
      </form>
    </main>
  );
}
