/**
 * @jest-environment jsdom
 */
import { useChat } from '../../src/hooks/useChat.js'
import { DURACAO_GESTO } from '../../src/lib/gesto.js'
import { act } from 'react'

jest.mock('../../src/lib/llm.js', () => ({
  sendMessageToLLM: jest.fn(() => Promise.resolve('Resposta do bot')),
}))

jest.mock('../../src/lib/gesto.js', () => ({
  ...jest.requireActual('../../src/lib/gesto.js'),
  detectarGesto: jest.fn(() => null),
  detectarEmocao: jest.fn(() => 'neutral'),
}))

async function makeHook(personalidade = 'Amigável', nomeModelo = 'Bot', nomeUsuario = '') {
  let result
  function TestComponent() {
    result = useChat(personalidade, nomeModelo, nomeUsuario)
    return null
  }

  const React = require('react')
  const { createRoot } = require('react-dom/client')

  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(React.createElement(TestComponent))
  })

  return {
    result: () => result,
    cleanup: async () => {
      await act(async () => {
        root.unmount()
      })
      document.body.removeChild(container)
    },
  }
}

describe('useChat', () => {
  test('retorna objeto com propriedades esperadas', async () => {
    const { result, cleanup } = await makeHook()
    const chat = result()
    expect(chat).toHaveProperty('chat')
    expect(chat).toHaveProperty('loading')
    expect(chat).toHaveProperty('speaking')
    expect(chat).toHaveProperty('speechText')
    expect(chat).toHaveProperty('gesture')
    expect(chat).toHaveProperty('emotion')
    expect(chat).toHaveProperty('sendMessage')
    expect(chat).toHaveProperty('falarComoBot')
    expect(chat).toHaveProperty('gesticular')
    await cleanup()
  })

  test('chat começa vazio', async () => {
    const { result, cleanup } = await makeHook()
    expect(result().chat).toEqual([])
    await cleanup()
  })

  test('loading começa como false', async () => {
    const { result, cleanup } = await makeHook()
    expect(result().loading).toBe(false)
    await cleanup()
  })

  test('speaking começa como false', async () => {
    const { result, cleanup } = await makeHook()
    expect(result().speaking).toBe(false)
    await cleanup()
  })

  test('emotion começa como "neutral"', async () => {
    const { result, cleanup } = await makeHook()
    expect(result().emotion).toBe('neutral')
    await cleanup()
  })

  test('gestural é função', async () => {
    const { result, cleanup } = await makeHook()
    expect(typeof result().gesticular).toBe('function')
    await cleanup()
  })

  test('falarComoBot é função', async () => {
    const { result, cleanup } = await makeHook()
    expect(typeof result().falarComoBot).toBe('function')
    await cleanup()
  })

  test('sendMessage é função', async () => {
    const { result, cleanup } = await makeHook()
    expect(typeof result().sendMessage).toBe('function')
    await cleanup()
  })
})