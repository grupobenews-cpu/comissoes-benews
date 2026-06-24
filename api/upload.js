import { put } from "@vercel/blob";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-app-key");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (process.env.APP_PASSWORD && req.headers["x-app-key"] !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: "Não autorizado." });
  }

  try {
    const { filename, dataBase64 } = req.body || {};
    if (!filename || !dataBase64) return res.status(400).json({ error: "Arquivo ausente." });

    const buffer = Buffer.from(dataBase64, "base64");
    // Na Vercel, o store de Blob conectado autentica via OIDC (não precisa passar token).
    // Em ambiente local, usa BLOB_READ_WRITE_TOKEN se estiver definido.
    const opts = {
      access: "public",
      contentType: "application/pdf",
      addRandomSuffix: true,
    };
    if (process.env.BLOB_READ_WRITE_TOKEN) opts.token = process.env.BLOB_READ_WRITE_TOKEN;

    const blob = await put(`fechamentos/${filename}`, buffer, opts);

    return res.status(200).json({ url: blob.url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
