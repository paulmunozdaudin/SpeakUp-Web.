import { ImageResponse } from "next/og";

export const alt = "Eloq AI — Practice presentations with AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Site-wide link-preview image (WhatsApp/iMessage/Telegram/Twitter all read
 * this when the URL is shared). Next.js serves this at /opengraph-image and
 * wires the og:image meta tag automatically — no image file to upload.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 30% 20%, #241d5c 0%, #161042 55%, #0c0930 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            height: 160,
            width: 160,
            borderRadius: "50%",
            backgroundColor: "#0f0a1f",
            border: "2px solid #2a2440",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 44,
          }}
        >
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: -70,
              marginLeft: -70,
              height: 140,
              width: 140,
              borderRadius: "50%",
              border: "6px solid rgba(255,255,255,0.85)",
            }}
          />
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: -53,
              marginLeft: -53,
              height: 106,
              width: 106,
              borderRadius: "50%",
              border: "6px solid rgba(255,255,255,0.85)",
            }}
          />
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: -35,
              marginLeft: -35,
              height: 70,
              width: 70,
              borderRadius: "50%",
              border: "6px solid rgba(255,255,255,0.85)",
            }}
          />
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: -17,
              marginLeft: -17,
              height: 34,
              width: 34,
              borderRadius: "50%",
              border: "7px solid #a996fb",
            }}
          />
          <div
            style={{
              display: "flex",
              height: 13,
              width: 13,
              borderRadius: "50%",
              backgroundColor: "#a996fb",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
          Eloq AI
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            color: "#c9c2ff",
            marginTop: 18,
          }}
        >
          Practice presentations with AI
        </div>
      </div>
    ),
    size,
  );
}
