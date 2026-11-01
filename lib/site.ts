// Сайтын үндсэн мэдээлэл — эндээс нэр, тайлбар, холбоосоо өөрчилнө.
export const site = {
  name: "Tuguldur Ochsaikhan",
  shortName: "Төгөлдөр",
  avatar: "/avatar.jpg",
  // Хайлтын систем, RSS, сошиал preview-д харагдана.
  description: "Амьдрал, утга учир, өдөр тутмын бодлын тухай тэмдэглэлүүд.",
  links: [{ label: "Medium", href: "https://medium.com/@tugulduroch" }],
};

export const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";
