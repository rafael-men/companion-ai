

const AFIRMATIVAS = [
  "sim", "claro", "com certeza", "certamente", "exato", "isso", "isso mesmo",
  "perfeito", "pode deixar", "concordo", "verdade", "aham",
]

const NEGATIVAS = [
  "não", "nao", "nunca", "jamais", "de jeito nenhum", "negativo", "discordo",
]

const POSITIVAS = [
  "feliz", "ótimo", "otimo", "legal", "adoro", "amo", "boa ideia", "animado", "alegre",
]

const TRISTES = [
  "triste", "chateado", "deprimido", "desanimado", "infeliz", "sinto muito", "pena",
]

const IRONICAS = [
  "sarcástico", "irônico", "ironia", "irônico", "zueira", "zoando",
]

export const DURACAO_GESTO = {
  nod: 1500,
  shake: 1500,
}

function normalizar(texto) {
  return texto.trim().toLowerCase()
}

/**
 * @param {string} texto 
 * @returns {'nod'|'shake'|null} 
 */
export function detectarGesto(texto) {
  if (!texto) return null
  const t = normalizar(texto)
  const contem = (lista) => lista.some((p) => t.includes(p))
  const comeca = (lista) => lista.some((p) => t.startsWith(p))

 
  if (comeca(NEGATIVAS) || contem(NEGATIVAS)) return "shake"
  if (comeca(AFIRMATIVAS) || contem(AFIRMATIVAS)) return "nod"
  return null
}

/**
 * @param {string} texto 
 * @returns {'happy'|'sad'|'angry'|'playful'|'neutral'}
 */
export function detectarEmocao(texto) {
  if (!texto) return "neutral"
  const t = normalizar(texto)
  if (POSITIVAS.some((p) => t.includes(p))) return "happy"
  if (TRISTES.some((p) => t.includes(p))) return "sad"
  if (IRONICAS.some((p) => t.includes(p))) return "playful"
  if (NEGATIVAS.some((p) => t.includes(p))) return "angry"
  return "neutral"
}
