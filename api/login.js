export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const APP_PASSWORD = process.env.APP_PASSWORD;

  // Sem senha configurada: app fica aberto (até o Roberto definir APP_PASSWORD na Vercel)
  if (!APP_PASSWORD) return res.status(200).json({ ok: true, configured: false });

  const { key } = req.body || {};
  if (key === APP_PASSWORD) return res.status(200).json({ ok: true, configured: true });

  return res.status(401).json({ error: "Palavra-chave incorreta." });
}
