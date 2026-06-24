export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  try {
    const { imageBase64, mediaType } = req.body;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
            { type: "text", text: "Extraia SOMENTE os valores líquidos recebidos em conta neste extrato de marketplace brasileiro. Ignore receita bruta, comissão da plataforma e outros descontos. Responda SOMENTE JSON válido: {\"repasses\": [{\"data\": \"DD/MM/AAAA\", \"valor\": 1234.56, \"nota\": \"descrição curta\"}]}" }
          ]
        }]
      })
    });
    const data = await response.json();
    const txt = data.content?.find(b => b.type === "text")?.text || "";
    const clean = txt.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
