import { precisaBuscar, buscarNaWeb } from "@/lib/websearch"

const createBasePrompt = (nomeModelo, nomeUsuario) => {
  const saudacaoUsuario = nomeUsuario ? `\n- Chame ${nomeUsuario} pelo nome de vez em quando para soar mais pessoal e caloroso.` : ''
  return `Você é ${nomeModelo}, conversando por mensagem com um amigo.
Fale como uma pessoa real num bate-papo casual:
- Respostas curtas: 1 ou 2 frases, direto ao ponto. Pode ser bem breve.
- Linguagem natural e coloquial do dia a dia. Use contrações ("tá", "pra", "tô") quando soar natural — mas NÃO force gírias nem encha de interjeições. Soe espontâneo, não caricato.
- Responda de verdade ao que a pessoa disse, sem encher linguiça nem desviar do assunto.
- NÃO cumprimente em toda resposta (nem "Oi!", nem "Olá!") e evite clichês de assistente tipo "Que legal!", "Entendi.", "Isso mesmo!". Na maioria das vezes, entre direto no assunto.
- Não ecoe o que a pessoa disse nem repita as palavras dela de volta.
- Varie o tamanho das frases e o padrão das respostas: às vezes uma frase curtinha, às vezes um comentário pessoal ou opinião.
- NUNCA use listas, tópicos, títulos, markdown, emojis ou tom de manual/robô.
- Quando perguntarem seu nome, diga naturalmente que é ${nomeModelo}.${saudacaoUsuario}`
}

const TOM = {
  'Amigável': 'Seu tom é caloroso, próximo e genuinamente carinhoso, como um amigo que se importa e quer conhecer melhor quem tá ouvindo.',
  'Profissional': 'Seu tom é claro, educado e útil, mas mantém leveza e humanidade, conversível, nunca seco.',
  'Engraçado': 'Seu tom é bem-humorado, descontraído e divertido; solte piadas, trocadilhos e se divirta na conversa.',
  'Sarcástico': 'Seu tom é espirituoso e levemente irônico, com humor afiado mas sempre divertido, nunca maldoso.',
}

const createPersonalidadePrompts = (nomeModelo, nomeUsuario) => Object.fromEntries(
  Object.entries(TOM).map(([nome, tom]) => [nome, `${createBasePrompt(nomeModelo, nomeUsuario)}\n${tom}`])
)

const API_URL = "https://api.groq.com/openai/v1/chat/completions"
const MODEL = "qwen/qwen3.8-27b"


function mensagemDeErro(status) {
  switch (status) {
    case 401: return "Chave de API inválida. Confira a VITE_GROQ_KEY no .env."
    case 404: return "Modelo não encontrado. O nome do modelo pode ter mudado."
    case 429: return "Limite de uso atingido. Aguarde um momento e tente de novo."
    default: return `Não consegui responder agora (erro ${status}).`
  }
}

/**
 * @param {Array<{sender: 'user'|'bot', text: string}>} history 
 * @param {string} [personalidade]
 * @param {string} [nomeModelo]
 * @param {string} [nomeUsuario]
 * @returns {Promise<string>} 
 */
export async function sendMessageToLLM(history, personalidade, nomeModelo = 'Companheiro', nomeUsuario = '') {
  const API_KEY = import.meta.env.VITE_GROQ_KEY

  const PERSONALIDADE_PROMPTS = createPersonalidadePrompts(nomeModelo, nomeUsuario)
  const PERSONALIDADE_PADRAO = PERSONALIDADE_PROMPTS['Amigável']
  let systemPrompt = PERSONALIDADE_PROMPTS[personalidade] || PERSONALIDADE_PADRAO

  
  const ultimaMsg = [...history].reverse().find((m) => m.sender === 'user')?.text
  if (ultimaMsg && precisaBuscar(ultimaMsg)) {
    const contexto = await buscarNaWeb(ultimaMsg)
    if (contexto) {
      systemPrompt += `\n\nInformações da web sobre a pergunta atual (use para responder com precisão, mas continue falando de forma natural e curta, sem citar URLs nem soar robótico):\n${contexto}`
    }
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    })),
  ]

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.9,   
        max_tokens: 150,    
      }),
    })

    if (!response.ok) {
      console.error("Erro na API:", response.status)
      return mensagemDeErro(response.status)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || "Resposta vazia."
  } catch (error) {
    console.error("Erro ao chamar LLM:", error)
    return "Ops! Não consegui me conectar ao servidor."
  }
}
