import "dotenv/config";
import serverless from "serverless-http";
import { handleFallbackApi } from "../server/src/demo/fallbackApi.js";

let cachedHandler;
let cachedConnectDatabase;

const loadServer = async () => {
  if (!cachedHandler || !cachedConnectDatabase) {
    const [{ app }, { connectDatabase }] = await Promise.all([
      import("../server/src/app.js"),
      import("../server/src/config/db.js"),
    ]);

    cachedHandler = serverless(app);
    cachedConnectDatabase = connectDatabase;
  }
};

export default async function auraApi(req, res) {
  const isHealthCheck = req.url === "/api/health" || req.url === "/health";

  if (!process.env.MONGO_URI) {
    return handleFallbackApi(req, res);
  }

  if (isHealthCheck) {
    return res.status(200).json({ status: "ok", service: "Aura Engine API" });
  }

  await loadServer();
  await cachedConnectDatabase();

  return cachedHandler(req, res);
}
