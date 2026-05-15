import "dotenv/config";
import serverless from "serverless-http";

import { app } from "../server/src/app.js";
import { connectDatabase } from "../server/src/config/db.js";

const handler = serverless(app);

export default async function auraApi(req, res) {
  const isHealthCheck = req.url === "/api/health" || req.url === "/health";

  if (isHealthCheck) {
    return res.status(200).json({ status: "ok", service: "Aura Engine API" });
  }

  await connectDatabase();

  return handler(req, res);
}
