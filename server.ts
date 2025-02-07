import express, { type Request, type Response } from "express"
import next from "next"
import { parse } from "url"
import compression from "compression"

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  // Apply compression middleware
  server.use(compression())

  server.all("*", (req: Request, res: Response) => {
    const parsedUrl = parse(req.url!, true)
    return handle(req, res, parsedUrl)
  })

  const port = process.env.PORT || 3000
  server.listen(port, (err?: Error) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})

