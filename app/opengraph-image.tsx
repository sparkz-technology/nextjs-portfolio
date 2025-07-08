import { ImageResponse } from "next/og";
import { getSiteMetadata } from "./layout";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OgImage() {
  const siteData = await getSiteMetadata();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          fontSize: 32,
          fontWeight: 600,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 120px",
          }}
        >
          {siteData?.avatarUrl && (
            <img
              src={siteData.avatarUrl}
              alt={siteData.name || ""}
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                marginBottom: "30px",
                objectFit: "cover",
              }}
            />
          )}
          <h1
            style={{
              fontSize: "60px",
              fontWeight: "bold",
              color: "#000000",
              marginBottom: "20px",
              lineHeight: "1.2",
            }}
          >
            {siteData?.name || "Portfolio"}
          </h1>
          <p
            style={{
              fontSize: "28px",
              color: "#666666",
              lineHeight: "1.4",
              maxWidth: "800px",
            }}
          >
            {siteData?.description || "Personal portfolio and blog"}
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}