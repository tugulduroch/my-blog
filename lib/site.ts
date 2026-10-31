// Сайтын үндсэн мэдээлэл — эндээс нэр, тайлбар, холбоосоо өөрчилнө.
export const site = {
  name: "Tuguldur Ochsaikhan",
  shortName: "Төгөлдөр",
  avatar: "/avatar.jpg",
  title: "Амьдрал, утга учир, өдөр тутмын бодлын тухай тэмдэглэлүүд.",
  description:
    "Ажигласан, мэдэрсэн, бодож явсан зүйлсээ энд бичиж үлдээдэг. Заримдаа эргэцүүлэл, заримдаа зүгээр л нэг өдрийн тэмдэглэл — бичиж үлдээмээр санагдсан бүхэн.",
  links: [
    { label: "Medium", href: "https://medium.com/@tugulduroch" },
    { label: "GitHub", href: "https://github.com/tugulduroch" },
  ],
};

export const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";
