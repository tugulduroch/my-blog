"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";

const links = [
  { href: "/", label: "Нүүр" },
  { href: "/writing", label: "Бичвэрүүд" },
  { href: "/projects", label: "Төслүүд" },
];

// Hover хийсэн (эсвэл идэвхтэй) холбоосын ард зөөлөн "pill" гулсаж очно.
export default function Nav() {
  const pathname = usePathname();
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  const active = links.findIndex((l) => (l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)));
  const target = hovered ?? active;

  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[target];
      if (!el) return;
      const x = el.offsetLeft;
      const w = el.offsetWidth;
      setPill((p) => (p && p.x === x && p.w === w ? p : { x, w }));
    };
    measure();
    // Фонт ачаалагдах, цонх өөрчлөгдөхөд байрлалыг дахин хэмжинэ.
    const ro = new ResizeObserver(measure);
    refs.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, [target]);

  return (
    <nav className="nav" data-ready={pill ? "" : undefined} onPointerLeave={() => setHovered(null)}>
      {pill && (
        <span
          className="nav-pill"
          aria-hidden
          style={{ transform: `translateX(${pill.x}px)`, width: pill.w, opacity: target === -1 ? 0 : 1 }}
        />
      )}
      {links.map((l, i) => (
        <Link
          key={l.href}
          href={l.href}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={i === active ? "active" : undefined}
          aria-current={i === active ? "page" : undefined}
          onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(i)}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
