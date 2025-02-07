const express = require("express")
const next = require("next")
const shrinkRay = require("shrink-ray-current")

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  // Apply Brotli compression middleware with fallback to gzip
  server.use(
    shrinkRay({
      filter: (req, res) => {
        // Don't compress responses with this request header
        if (req.headers["x-no-compression"]) return false
        // Use compression filter function
        return shrinkRay.filter(req, res)
      },
      brotli: {
        quality: 11,
      },
      zlib: {
        level: 9,
      },
    }),
  )

  server.all("*", (req, res) => {
    return handle(req, res)
  })

  const port = process.env.PORT || 3000
  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})

