# Миний блог

Next.js 15 дээр хийсэн хувийн блог. Админ хэсгээс бичвэр нэмж, устгах боломжтой.

## Боломжууд

- `/` — нүүр хуудас, сүүлийн бичвэрүүд
- `/writing` — бүх бичвэр, он оноор
- `/writing/[slug]` — бичвэр (Markdown)
- `/admin` — нууц үгээр нэвтэрч бичвэр нэмэх / устгах
- Харанхуй / цайвар горим

## Локал дээр ажиллуулах

```bash
cp .env.example .env.local   # ADMIN_PASSWORD-оо тохируулна
npm install
npm run dev
```

`BLOB_READ_WRITE_TOKEN` байхгүй үед бичвэрүүд `data/posts.json` файлд хадгалагдана.

## Vercel дээр

1. Vercel төсөл дээр **Storage → Blob** store үүсгээд төсөлтэйгээ холбоно (`BLOB_READ_WRITE_TOKEN` автоматаар нэмэгдэнэ).
2. **Settings → Environment Variables** хэсэгт `ADMIN_PASSWORD` нэмнэ.
3. Redeploy хийнэ.

Сайтын нэр, тайлбарыг `lib/site.ts` файлаас өөрчилнө.
