import { put } from "@vercel/blob";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: "Armazenamento de PDF não configurado (crie um Blob na Vercel)." });
  }

  try {
    const { filename, dataBase64 } = req.body || {};
    if (!filename || !dataBase64) return res.status(400).json({ error: "Arquivo ausente." });

    const buffer = Buffer.from(dataBase64, "base64");
    const blob = await put(`fechamentos/${filename}`, buffer, {
      access: "public",
      contentType: "application/pdf",
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json({ url: blob.url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
