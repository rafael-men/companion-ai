import { useState, useCallback, useRef, useEffect } from 'react'
import ThreeViewer from './components/ThreeViewer'
import ChatBox from './components/ChatBox'
import ChatHistory from './components/ChatHistory'
import SidePanel from './components/SidePanel'
import { useChat } from '@/hooks/useChat'
import { useDarkMode } from '@/hooks/useDarkMode'
import { MODELOS } from '@/lib/models'
import { PERSONALIDADE_PADRAO, gerarRespostaRosto } from '@/lib/personalidades'
import { montarSaudacao } from '@/lib/saudacao'
import './index.css'

export default function App() {
  const [personalidade, setPersonalidade] = useState(PERSONALIDADE_PADRAO)
  const [avatar, setAvatar] = useState(MODELOS[0]?.file)
  const [armAngle, setArmAngle] = useState(1.35)
  const [background, setBackground] = useState(null)
  const [lipSyncIntensity, setLipSyncIntensity] = useState(1)
  const [panelTheme, setPanelTheme] = useState('default')
  const [eyesClosed, setEyesClosed] = useState(false)
  const [nomeUsuario, setNomeUsuario] = useState('')
  const timeoutRef = useRef(null)

  const [dark, toggleDark] = useDarkMode()

  const nomeModelo = MODELOS.find((m) => m.file === avatar)?.label || 'Companheiro'

  const { chat, loading, speaking, speechText, gesture, emotion, sendMessage, falarComoBot } =
    useChat(personalidade, nomeModelo, nomeUsuario)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])


  const saudouRef = useRef(false)
  useEffect(() => {
    if (saudouRef.current) return
    saudouRef.current = true
    falarComoBot(montarSaudacao({ nomeUsuario, nomeModelo }))
  }, [])

  const trocarAvatar = (file) => {
    setAvatar(file)
    const nome = MODELOS.find((m) => m.file === file)?.label
    falarComoBot(montarSaudacao({ nomeUsuario, nomeModelo: nome }))
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
      <ThreeViewer speaking={speaking} speechText={speechText} avatar={avatar} armAngle={armAngle} gesture={gesture} emotion={emotion} lipSyncIntensity={lipSyncIntensity} onFaceClick={handleFaceClick} eyesClosed={eyesClosed} />
      <ChatHistory messages={chat} loading={loading} />
      <ChatBox onSend={sendMessage} />
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
        dark={dark}
        onToggleDark={toggleDark}
      />
    </div>
  )
}
