import { getPosts } from "@/lib/queries";
import { renderContent } from "@/lib/render";
import { site, siteUrl } from "@/lib/site";

export const revalidate = 3600;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function GET() {
  const posts = await getPosts();
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${siteUrl}/writing/${p.slug}</link>
      <guid>${siteUrl}/writing/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>
      <content:encoded><![CDATA[${renderContent(p.content).replace(/]]>/g, "]]]]><![CDATA[>")}]]></content:encoded>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${esc(site.name)}</title>
    <link>${siteUrl}</link>
    <description>${esc(site.description)}</description>
    <language>mn</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
