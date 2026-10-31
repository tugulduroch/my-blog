import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container narrow">
      <div className="hero">
        <h1>Хуудас олдсонгүй</h1>
        <p>Таны хайсан бичвэр устгагдсан эсвэл байхгүй байна.</p>
      </div>
      <Link href="/" className="back">
        ← Нүүр хуудас руу
      </Link>
    </main>
  );
}
