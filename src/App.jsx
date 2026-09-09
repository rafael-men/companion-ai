import { useState, useCallback, useRef, useEffect } from 'react'
import { MonitorX } from 'lucide-react'
import ThreeViewer from './components/ThreeViewer'
import ChatBox from './components/ChatBox'
import ChatHistory from './components/ChatHistory'
import SidePanel from './components/SidePanel'
import { useChat } from '@/hooks/useChat'
import { useDarkMode } from '@/hooks/useDarkMode'
import { lerModoTransparente, aplicarModoTransparente, alternarModoTransparente } from '@/lib/change-window'
import { MODELOS } from '@/lib/models'
import { ANIMACOES } from '@/lib/animations'
import { PERSONALIDADE_PADRAO, gerarRespostaRosto } from '@/lib/personalidades'
import { montarSaudacao } from '@/lib/saudacao'
import './index.css'

const ANIMACAO_GREETING = ANIMACOES[0]?.file ?? null

export default function App() {
  const [personalidade, setPersonalidade] = useState(PERSONALIDADE_PADRAO)
  const [avatar, setAvatar] = useState(MODELOS[0]?.file)
  const [armAngle, setArmAngle] = useState(1.35)
  const [background, setBackground] = useState(null)
  const [lipSyncIntensity, setLipSyncIntensity] = useState(1)
  const [panelTheme, setPanelTheme] = useState('default')
  const [eyesClosed, setEyesClosed] = useState(false)
  const [nomeUsuario, setNomeUsuario] = useState('')
  const [animation, setAnimation] = useState(null)
  const timeoutRef = useRef(null)

  const [dark, toggleDark] = useDarkMode()

  const [transparente, setTransparente] = useState(() => lerModoTransparente())

  useEffect(() => {
    aplicarModoTransparente(lerModoTransparente())
  }, [])

  const toggleTransparencia = useCallback(() => {
    setTransparente(alternarModoTransparente())
  }, [])

  const nomeModelo = MODELOS.find((m) => m.file === avatar)?.label || 'Companheiro'

  const handleAnimationEnd = useCallback(() => {
    setAnimation(null)
  }, [])

  const { chat, loading, speaking, speechText, gesture, emotion, sendMessage, falarComoBot } =
    useChat(personalidade, nomeModelo, nomeUsuario)

  const cumprimentar = useCallback((nome) => {
    setAnimation(ANIMACAO_GREETING)
    falarComoBot(montarSaudacao({ nomeUsuario, nomeModelo: nome }))
  }, [falarComoBot, nomeUsuario])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])


  const saudouRef = useRef(false)
  useEffect(() => {
    if (saudouRef.current) return
    saudouRef.current = true
    cumprimentar(nomeModelo)
  }, [])

  const trocarAvatar = (file) => {
    setAvatar(file)
    const nome = MODELOS.find((m) => m.file === file)?.label
    cumprimentar(nome)
  }

  const handleFaceClick = useCallback(() => {
    if (timeoutRef.current) return 
    
    setEyesClosed(true)
    const resposta = gerarRespostaRosto(personalidade)
    falarComoBot(resposta)

    timeoutRef.current = setTimeout(() => {
      setEyesClosed(false)
      timeoutRef.current = null
    }, 2000)
  }, [personalidade, falarComoBot])

  
  const appStyle = background
    ? { backgroundImage: `url(/assets/${background})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined

  return (
    <div className="app pl-0 sm:pl-16" style={appStyle}>
      {transparente && (
        <button
          onClick={toggleTransparencia}
          aria-label="Sair do modo transparente"
          title="Sair do modo transparente"
          className="fixed right-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg"
        >
          <MonitorX className="h-5 w-5" />
        </button>
      )}
      <ThreeViewer speaking={speaking} speechText={speechText} avatar={avatar} animation={animation} animationLoop={false} onAnimationEnd={handleAnimationEnd} armAngle={armAngle} gesture={gesture} emotion={emotion} lipSyncIntensity={lipSyncIntensity} onFaceClick={handleFaceClick} eyesClosed={eyesClosed} />
      <ChatHistory messages={chat} loading={loading} />
      <ChatBox onSend={sendMessage} transparente={transparente} />
      <SidePanel
        avatar={avatar}
        onAvatarChange={trocarAvatar}
        personalidade={personalidade}
        onPersonalidadeChange={setPersonalidade}
        armAngle={armAngle}
        onArmAngleChange={setArmAngle}
        background={background}
        onBackgroundChange={setBackground}
        nomeUsuario={nomeUsuario}
        onNomeUsuarioChange={setNomeUsuario}
        lipSyncIntensity={lipSyncIntensity}
        onLipSyncIntensityChange={setLipSyncIntensity}
        panelTheme={panelTheme}
        onPanelThemeChange={setPanelTheme}
        animation={animation}
        onAnimationChange={setAnimation}
        dark={dark}
        onToggleDark={toggleDark}
        transparente={transparente}
        onToggleTransparencia={toggleTransparencia}
      />
    </div>
  )
}
