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
          <svg width="88" height="88" viewBox="0 0 24 24">
            <path
              fill="#8b7cf6"
              d="M12 2C10.2 4.3 8.7 6.4 8.7 8.6c0 2.3 1.4 3.4 3.3 3.4s3.3-1.1 3.3-3.4c0-1.4-.7-2.6-1.6-3.7-.1 1.1-.6 1.9-1.3 2.6.1-1.4.1-3.2-.4-5.5Z"
            />
            <path fill="#ffffff" d="M9.3 12h5.4l-1.1 2h-3.2Z" />
            <path fill="#ffffff" d="M10.4 14h3.2v5.5L12 21.5l-1.6-2Z" />
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
