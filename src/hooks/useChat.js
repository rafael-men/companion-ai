import { useCallback, useRef, useState } from "react"
import { sendMessageToLLM } from "@/lib/llm"
import { detectarGesto, detectarEmocao, DURACAO_GESTO } from "@/lib/gesto"


function duracaoDaFala(texto) {
  return Math.min(8000, Math.max(1500, texto.length * 50))
}


export function useChat(personalidade, nomeModelo, nomeUsuario) {
  const [chat, setChat] = useState([])
  const [loading, setLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [speechText, setSpeechText] = useState("")
  const [gesture, setGesture] = useState(null)
  const [emotion, setEmotion] = useState("neutral")
  const speakTimer = useRef(null)
  const gestureTimer = useRef(null)

  const gesticular = useCallback((gesto) => {
    if (!gesto) return
    setGesture(gesto)
    clearTimeout(gestureTimer.current)
    gestureTimer.current = setTimeout(() => setGesture(null), DURACAO_GESTO[gesto] ?? 1500)
  }, [])


  const falarComoBot = useCallback(
    (texto, gestoForcado) => {
      setChat((prev) => [...prev, { sender: "bot", text: texto }])

      setSpeechText(texto)
      setSpeaking(true)
      clearTimeout(speakTimer.current)
      speakTimer.current = setTimeout(() => setSpeaking(false), duracaoDaFala(texto))

      gesticular(gestoForcado ?? detectarGesto(texto))
      setEmotion(detectarEmocao(texto))
    },
    [gesticular]
  )

  const sendMessage = useCallback(
    async (msg) => {
      const updatedChat = [...chat, { sender: "user", text: msg }]
      setChat(updatedChat)
      setEmotion("neutral")
      setLoading(true)
      try {
        const resposta = await sendMessageToLLM(updatedChat, personalidade, nomeModelo, nomeUsuario)
        falarComoBot(resposta)
      } finally {
        setLoading(false)
      }
    },
    [chat, personalidade, nomeModelo, nomeUsuario, falarComoBot]
  )

  return { chat, loading, speaking, speechText, gesture, emotion, sendMessage, falarComoBot, gesticular }
}
