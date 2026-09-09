import { sendMessageToLLM } from '../../src/lib/llm.js'

jest.mock('../../src/lib/websearch.js', () => ({
  precisaBuscar: jest.fn(() => false),
  buscarNaWeb: jest.fn(() => Promise.resolve('')),
}))

const originalFetch = globalThis.fetch

describe('sendMessageToLLM', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    jest.restoreAllMocks()
    delete import.meta.env.VITE_GROQ_KEY
  })

  test('faz POST para a API do Groq', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'Olá!' } }],
      }),
    })

    const history = [{ sender: 'user', text: 'Oi' }]
    const resultado = await sendMessageToLLM(history)

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.groq.com/openai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: expect.any(String),
      })
    )
    expect(resultado).toBe('Olá!')
  })

  test('envia messages formatadas corretamente', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'ok' } }],
      }),
    })

    const history = [
      { sender: 'user', text: 'Oi' },
      { sender: 'bot', text: 'Tudo bem!' },
      { sender: 'user', text: 'Legal' },
    ]

    await sendMessageToLLM(history, 'Amigável', 'Bot', 'User')

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body)
    expect(body.model).toBe('qwen/qwen3.8-27b')
    expect(body.messages[0].role).toBe('system')
    expect(body.messages[1]).toEqual({ role: 'user', content: 'Oi' })
    expect(body.messages[2]).toEqual({ role: 'assistant', content: 'Tudo bem!' })
    expect(body.messages[3]).toEqual({ role: 'user', content: 'Legal' })
  })

  test('usa personalidade Amigável por padrão', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'ok' } }],
      }),
    })

    await sendMessageToLLM([{ sender: 'user', text: 'Oi' }])

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body)
    expect(body.messages[0].content).toContain('Seu tom é caloroso')
  })

  test('usa personalidade Sarcástico quando especificada', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'ok' } }],
      }),
    })

    await sendMessageToLLM([{ sender: 'user', text: 'Oi' }], 'Sarcástico')

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body)
    expect(body.messages[0].content).toContain('Seu tom é espirituoso e levemente irônico')
  })

  test('retorna mensagem de erro para status 401', async () => {
    globalThis.fetch.mockResolvedValue({ ok: false, status: 401 })
    const resultado = await sendMessageToLLM([{ sender: 'user', text: 'Oi' }])
    expect(resultado).toContain('Chave de API inválida')
  })

  test('retorna mensagem de erro para status 429', async () => {
    globalThis.fetch.mockResolvedValue({ ok: false, status: 429 })
    const resultado = await sendMessageToLLM([{ sender: 'user', text: 'Oi' }])
    expect(resultado).toContain('Limite de uso atingido')
  })

  test('retorna mensagem de erro para status 404', async () => {
    globalThis.fetch.mockResolvedValue({ ok: false, status: 404 })
    const resultado = await sendMessageToLLM([{ sender: 'user', text: 'Oi' }])
    expect(resultado).toContain('Modelo não encontrado')
  })

  test('retorna mensagem de erro genérica para outros status', async () => {
    globalThis.fetch.mockResolvedValue({ ok: false, status: 500 })
    const resultado = await sendMessageToLLM([{ sender: 'user', text: 'Oi' }])
    expect(resultado).toContain('erro 500')
  })

  test('retorna mensagem de erro em caso de exceção', async () => {
    globalThis.fetch.mockRejectedValue(new Error('Connection refused'))
    const resultado = await sendMessageToLLM([{ sender: 'user', text: 'Oi' }])
    expect(resultado).toContain('Não consegui me conectar')
  })

  test('retorna "Resposta vazia." se API retornar vazio', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [] }),
    })
    const resultado = await sendMessageToLLM([{ sender: 'user', text: 'Oi' }])
    expect(resultado).toBe('Resposta vazia.')
  })

  test('inclui nome do modelo no system prompt', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'ok' } }],
      }),
    })

    await sendMessageToLLM([{ sender: 'user', text: 'Oi' }], 'Amigável', 'MeuBot')

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body)
    expect(body.messages[0].content).toContain('MeuBot')
  })

  test('inclui nome do usuário no system prompt quando fornecido', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'ok' } }],
      }),
    })

    await sendMessageToLLM([{ sender: 'user', text: 'Oi' }], 'Amigável', 'Bot', 'Carlos')

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body)
    expect(body.messages[0].content).toContain('Carlos')
  })
})
