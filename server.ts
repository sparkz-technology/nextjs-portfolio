import express, { Request, Response } from "express";
import next from "next";
import compression from "compression";
import path from "path";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // ✅ Apply compression for all responses (prioritizing Gzip)
  server.use(
    compression({
      filter: (req, res) => {
        // Only compress responses that should be compressed
        if (req.headers["accept-encoding"]?.includes("gzip")) {
          res.setHeader("Content-Encoding", "gzip"); // Force Gzip
          return true;
        }
        return false;
      },
      threshold: 0, // Compress all files, even small ones
    })
  );

  // ✅ Serve Next.js static assets with compression
  server.use(
    "/_next/static",
    express.static(path.join(__dirname, ".next/static"), {
      immutable: true,
      maxAge: "365d",
    })
  );

  // ✅ Handle all other Next.js requests
  server.all("*", (req: Request, res: Response) => {
    return handle(req, res);
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
