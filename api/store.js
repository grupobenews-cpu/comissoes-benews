export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-app-key");

  // Proteção por palavra-chave (ativa só quando APP_PASSWORD está definido)
  if (process.env.APP_PASSWORD && req.headers["x-app-key"] !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: "Não autorizado." });
  }

  const URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!URL || !TOKEN) {
    return res.status(500).json({ error: "Banco de dados não configurado (defina KV_REST_API_URL e KV_REST_API_TOKEN)." });
  }

  // Executa um comando Redis via REST do Upstash
  async function cmd(...args) {
    const r = await fetch(URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    const j = await r.json();
    if (j.error) throw new Error(j.error);
    return j.result;
  }

  // Apenas chaves conhecidas, prefixadas
  const ALLOWED = ["clientes", "fechamentos", "canais", "prompts"];

  try {
    if (req.method === "GET") {
      const key = String(req.query.key || "");
      if (!ALLOWED.includes(key)) return res.status(400).json({ error: "Chave inválida." });
      const raw = await cmd("GET", `benews:${key}`);
      const value = raw ? JSON.parse(raw) : [];
      return res.status(200).json({ value });
    }

    if (req.method === "POST") {
      const { key, value } = req.body || {};
      if (!ALLOWED.includes(key)) return res.status(400).json({ error: "Chave inválida." });
      if (!Array.isArray(value)) return res.status(400).json({ error: "Valor deve ser uma lista." });
      await cmd("SET", `benews:${key}`, JSON.stringify(value));
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
