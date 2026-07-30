const TAVILY_URL = "https://api.tavily.com/search"


const GATILHOS = [
  "quem", "qual", "quais", "quando", "onde", "quanto", "quantos", "como",
  "por que", "porque", "o que é", "notícia", "noticia", "preço", "preco",
  "cotação", "cotacao", "hoje", "agora", "atual", "última", "ultima",
  "recente", "população", "populacao", "capital", "presidente", "significa",
]

/**
 * @param {string} texto
 * @returns {boolean}
 */
export function precisaBuscar(texto) {
  if (!texto) return false
  const t = texto.toLowerCase()
  if (t.includes("?")) return true
  return GATILHOS.some((g) => t.includes(g))
}

/**
 * @param {string} query 
 * @returns {Promise<string>} 
 */
const webSearchCache = new Map()

export async function buscarNaWeb(query) {
  const API_KEY = import.meta.env.VITE_TAVILY_KEY
  if (!API_KEY) return ""

  const cacheKey = query.trim().toLowerCase()
  if (webSearchCache.has(cacheKey)) {
    return webSearchCache.get(cacheKey)
  }

  try {
    const response = await fetch(TAVILY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: API_KEY,
        query,
        search_depth: "basic",
        max_results: 4,
        include_answer: true,
      }),
    })

    if (!response.ok) {
      console.error("Erro na busca web:", response.status)
      return ""
    }

    const data = await response.json()

    const partes = []
    if (data.answer) partes.push(`Resumo: ${data.answer}`)
    if (Array.isArray(data.results)) {
      data.results.slice(0, 4).forEach((r) => {
        if (r.content) partes.push(`- ${r.title}: ${r.content}`)
      })
    }
    const resultado = partes.join("\n")
    webSearchCache.set(cacheKey, resultado)
    return resultado
  } catch (error) {
    console.error("Erro ao buscar na web:", error)
    return ""
  }
}
