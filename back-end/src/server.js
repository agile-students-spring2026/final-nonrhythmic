import http from "node:http";

import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const app = createApp();
const server = http.createServer(app);

server.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`api listening on http://${HOST}:${PORT}`);
});

function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`received ${signal}, shutting down...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

