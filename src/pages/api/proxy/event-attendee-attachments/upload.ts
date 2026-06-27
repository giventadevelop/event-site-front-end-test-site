import type { NextApiRequest, NextApiResponse } from "next";
import { getCachedApiJwt, generateApiJwt } from "@/lib/api/jwt";
import { getApiBaseUrl } from "@/lib/env";

const API_BASE_URL = getApiBaseUrl();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!API_BASE_URL) {
      res.status(500).json({ error: "API base URL not configured" });
      return;
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    let token = await getCachedApiJwt();
    if (!token) {
      token = await generateApiJwt();
    }

    const params = new URLSearchParams();
    for (const key in req.query) {
      const value = req.query[key];
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else if (typeof value !== "undefined") {
        params.append(key, value);
      }
    }

    const qs = params.toString();
    const apiUrl = `${API_BASE_URL}/api/event-attendee-attachments/upload${qs ? `?${qs}` : ""}`;

    const fetch = (await import("node-fetch")).default;
    const headers = { ...req.headers, authorization: `Bearer ${token}` };
    delete headers.host;
    delete headers.connection;

    const sanitizedHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (Array.isArray(value)) sanitizedHeaders[key] = value.join("; ");
      else if (typeof value === "string") sanitizedHeaders[key] = value;
    }

    const apiRes = await fetch(apiUrl, {
      method: "POST",
      headers: sanitizedHeaders,
      body: req,
      duplex: "half",
    });

    if (apiRes.status >= 200 && apiRes.status < 300) {
      res.status(apiRes.status);
      for (const [key, value] of Object.entries(apiRes.headers.raw())) {
        if (key.toLowerCase() !== "content-encoding" && key.toLowerCase() !== "transfer-encoding") {
          res.setHeader(key, value);
        }
      }
      apiRes.body.pipe(res);
      return;
    }

    res.status(apiRes.status >= 400 ? apiRes.status : 500).json({
      error: "Upload failed",
      status: apiRes.status,
      message: `Upload operation failed with HTTP status ${apiRes.status}`,
      success: false,
    });
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Internal server error", details: String(err) });
  }
}
