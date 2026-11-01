import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Энгийн "T" үсэгтэй favicon.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#18181b",
          borderRadius: 16,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 28, height: 7, borderRadius: 2, background: "#fafafa" }} />
          <div style={{ width: 7, height: 21, borderRadius: "0 0 2px 2px", background: "#fafafa" }} />
        </div>
      </div>
    ),
    size,
  );
}
