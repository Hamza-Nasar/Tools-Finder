import { ImageResponse } from "next/og";

export const alt = "AI Tools Finder";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: 56,
          background:
            "linear-gradient(135deg, rgba(255,244,226,1) 0%, rgba(247,250,250,1) 55%, rgba(209,238,240,1) 100%)",
          color: "#11222A",
          fontFamily: "sans-serif"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            borderRadius: 32,
            border: "2px solid rgba(17,34,42,0.08)",
            background: "rgba(255,255,255,0.72)",
            padding: 48
          }}
        >
          <div
            style={{
              display: "flex",
              width: 92,
              height: 92,
              borderRadius: 24,
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #0B8B96, #195E62)",
              color: "white",
              fontSize: 36,
              fontWeight: 700
            }}
          >
            AI
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05 }}>AI Tools Finder</div>
            <div style={{ fontSize: 30, color: "#3E4D57", maxWidth: 900 }}>
              Premium discovery, featured listings, and launch-ready monetization for modern AI products.
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
