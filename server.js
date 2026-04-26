const http = require("http");
const fs = require("fs");
const path = require("path");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 6080);
const ROOT_DIR = __dirname;
const REMOTE_API_URL =
  "https://lordsmobile.igg.com/project/game_tool/ajax.php?action=get_migration_scroll&lang=ja";

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(requestUrl.pathname);

  if (pathname === "/api/migration" && req.method === "POST") {
    await handleMigrationProxy(req, res);
    return;
  }

  const safePath = pathname === "/" ? "/index.html" : pathname;
  const resolvedPath = path.resolve(ROOT_DIR, `.${safePath}`);

  if (!resolvedPath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.readFile(resolvedPath, (error, data) => {
    if (error) {
      const statusCode = error.code === "ENOENT" ? 404 : 500;
      res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(statusCode === 404 ? "Not Found" : "Internal Server Error");
      return;
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
    res.end(data);
  });
});

async function handleMigrationProxy(req, res) {
  try {
    const body = await readJsonBody(req);
    const params = normalizeMigrationParams(body);
    const form = new FormData();

    form.append("power", String(params.power));
    form.append("num", String(params.num));
    form.append("status", String(params.status));
    form.append("order", String(params.order));

    const upstream = await fetch(REMOTE_API_URL, {
      method: "POST",
      body: form,
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });

    const text = await upstream.text();
    res.writeHead(upstream.ok ? 200 : upstream.status, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(text);
  } catch (error) {
    console.error("proxy error", error);
    res.writeHead(500, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(
      JSON.stringify({
        code: 5000,
        data: [],
        msg: error && error.message ? error.message : "Proxy request failed",
      })
    );
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", reject);
  });
}

function normalizeMigrationParams(body) {
  return {
    power: readFiniteNumber(body.power, 100),
    num: readFiniteNumber(body.num, 90),
    status: readFiniteNumber(body.status, 0),
    order: readFiniteNumber(body.order, 1),
  };
}

function readFiniteNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

server.listen(PORT, HOST, () => {
  console.log(`Local server running at http://${HOST}:${PORT}`);
});
