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
            height: 160,
            width: 160,
            borderRadius: "50%",
            backgroundColor: "#1c1650",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 44,
          }}
        >
          <svg width="88" height="88" viewBox="0 0 24 24" fill="none">
            <path
              d="M2.5,13 C4.2,6.5 7.3,6.5 9,13 C10.7,19.5 13.8,19.5 15.5,13 C17.2,6.5 20.3,6.5 21.5,13"
              stroke="#8b7cf6"
              strokeWidth="2.3"
              strokeLinecap="round"
            />
          </svg>
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
    { ...size },
  );
}
