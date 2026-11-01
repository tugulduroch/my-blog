import Link from "next/link";
import { logout } from "./actions";

const tabs = [
  { key: "posts", href: "/admin", label: "Бичвэрүүд" },
  { key: "projects", href: "/admin/projects", label: "Төслүүд" },
] as const;

type Props = { current: (typeof tabs)[number]["key"]; newHref: string; newLabel: string };

export default function AdminHeader({ current, newHref, newLabel }: Props) {
  return (
    <div className="admin-head">
      <nav className="admin-tabs">
        {tabs.map((t) => (
          <Link key={t.key} href={t.href} className={t.key === current ? "active" : undefined}>
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="actions">
        <form action={logout}>
          <button className="btn ghost">Гарах</button>
        </form>
        <Link href={newHref} className="btn primary">
          {newLabel}
        </Link>
      </div>
    </div>
  );
}
