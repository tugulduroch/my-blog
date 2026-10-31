import { marked } from "marked";

const YT = /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})\S*$/;

const embed = (id: string) =>
  `<div class="embed"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="YouTube video" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;

export function plainText(content: string) {
  return marked
    .parse(content, { async: false })
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

// Markdown/HTML-ийг HTML болгоно. Ганцаараа мөрөнд байгаа YouTube холбоосыг видео болгож харуулна.
export function renderContent(content: string) {
  const html = marked.parse(content, { async: false });
  return html
    .replace(/<p>\s*<a href="([^"]+)">[^<]*<\/a>\s*<\/p>/g, (m, href: string) => {
      const id = href.replace(/&amp;/g, "&").match(YT)?.[1];
      return id ? embed(id) : m;
    })
    .replace(/<a href="(https?:\/\/[^"]+)"/g, (m, href: string) =>
      href.includes("youtube-nocookie") ? m : `<a href="${href}" target="_blank" rel="noopener noreferrer"`,
    );
}
