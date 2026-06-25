import { put, del } from "@vercel/blob";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-app-key");

  if (process.env.APP_PASSWORD && req.headers["x-app-key"] !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: "Não autorizado." });
  }

  const blobOpts = process.env.BLOB_READ_WRITE_TOKEN ? { token: process.env.BLOB_READ_WRITE_TOKEN } : {};

  // DELETE: apaga o PDF do Blob pela URL
  if (req.method === "DELETE") {
    try {
      const { url } = req.body || {};
      if (!url) return res.status(400).json({ error: "URL ausente." });
      await del(url, blobOpts);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { filename, dataBase64, contentType, folder } = req.body || {};
    if (!filename || !dataBase64) return res.status(400).json({ error: "Arquivo ausente." });

    const buffer = Buffer.from(dataBase64, "base64");
    // Pasta e tipo são opcionais: por padrão sobe PDF de fechamento (compatível com o uso antigo);
    // a biblioteca de prompts passa folder:"prompts" e contentType de imagem (ex.: image/jpeg).
    const safeFolder = String(folder || "fechamentos").replace(/[^a-zA-Z0-9/_-]/g, "") || "fechamentos";
    // Na Vercel, o store de Blob conectado autentica via OIDC (não precisa passar token).
    // Em ambiente local, usa BLOB_READ_WRITE_TOKEN se estiver definido.
    const blob = await put(`${safeFolder}/${filename}`, buffer, {
      access: "public",
      contentType: contentType || "application/pdf",
      addRandomSuffix: true,
      ...blobOpts,
    });

    return res.status(200).json({ url: blob.url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
