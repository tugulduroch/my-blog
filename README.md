# Tuguldur Ochsaikhan — блог

Next.js 15 дээр хийсэн хувийн блог. Админ хэсгээс бичвэр нэмж, засаж, устгах боломжтой.

## Боломжууд

- `/` — нүүр хуудас, сүүлийн бичвэрүүд
- `/writing` — бүх бичвэр, он оноор
- `/writing/[slug]` — бичвэр (Markdown / HTML), нүүр зураг, унших хугацаа, шошго, өмнөх/дараах
- `/admin` — нууц үгээр нэвтэрч бичвэр нэмэх / засах / устгах, зураг оруулах
- YouTube холбоосыг тусдаа мөрөнд бичвэл видео болж харагдана
- Харанхуй / цайвар горим, RSS (`/feed.xml`), `sitemap.xml`, Open Graph

## Локал дээр ажиллуулах

```bash
cp .env.example .env.local   # ADMIN_PASSWORD-оо тохируулна
npm install
npm run dev
```

`BLOB_READ_WRITE_TOKEN` байхгүй үед бичвэрүүд `data/posts.json` файлд хадгалагдана.

## Medium-ээс бичвэр оруулах

```bash
npm run import:medium -- tugulduroch    # локал data/posts.json руу
vercel env pull && npm run import:medium:prod   # production (Vercel Blob) руу
```

Байгаа бичвэрийг алгасах тул дахин ажиллуулахад аюулгүй. Medium-ийн RSS сүүлийн 10 бичвэрийг л өгдөг.

## Vercel дээр

1. Vercel төсөл дээр **Storage → Blob** store холбоно (`BLOB_READ_WRITE_TOKEN` автоматаар нэмэгдэнэ).
2. **Settings → Environment Variables** хэсэгт `ADMIN_PASSWORD` нэмнэ.
3. `main` салбар руу push хийхэд автоматаар deploy болно.

Сайтын нэр, тайлбар, холбоосыг `lib/site.ts` файлаас өөрчилнө.
