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
            { type: "text", text: "Extraia SOMENTE os valores líquidos recebidos em conta neste extrato de marketplace brasileiro. Ignore receita bruta, comissão da plataforma e outros descontos.\n\nREGRA DE TOTALIZAÇÃO (muito importante):\n1. Se o extrato tiver uma linha de TOTAL (ex.: \"Total\", \"Total geral\", \"Valor total\", \"Total líquido\"), use APENAS esse valor único. NÃO some nem liste as linhas individuais (bandeiras como Mastercard/Visa, ciclos, etc.) que já estão somadas nesse total. Use a data de pagamento mais recente do extrato para esse repasse único.\n2. Se NÃO houver linha de Total, agrupe os valores por data de pagamento: gere um repasse por data, somando todas as linhas individuais que pertencem àquela data.\n3. Nunca conte um valor duas vezes (não inclua ao mesmo tempo o total e as linhas que o compõem).\n\nResponda SOMENTE JSON válido: {\"repasses\": [{\"data\": \"DD/MM/AAAA\", \"valor\": 1234.56, \"nota\": \"descrição curta\"}]}" }
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
