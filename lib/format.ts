export function formatDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const then = Date.UTC(y, m - 1, d);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((today - then) / 86_400_000);

  if (days === 0) return "Өнөөдөр";
  if (days === 1) return "Өчигдөр";
  if (days > 1 && days < 7) return `${days} өдрийн өмнө`;
  return `${y} оны ${m}-р сарын ${d}`;
}
