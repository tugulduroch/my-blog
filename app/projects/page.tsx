import type { Metadata } from "next";

export const metadata: Metadata = { title: "Төслүүд" };

export default function Projects() {
  return (
    <main className="container">
      <div className="hero">
        <h1>Төслүүд</h1>
      </div>
      <p className="empty-state">Одоогоор төсөл нэмэгдээгүй байна.</p>
    </main>
  );
}
