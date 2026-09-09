import { precisaBuscar, buscarNaWeb } from '../../src/lib/websearch.js'

describe('precisaBuscar', () => {
  test('retorna false para texto vazio', () => {
    expect(precisaBuscar('')).toBe(false)
    expect(precisaBuscar(null)).toBe(false)
    expect(precisaBuscar(undefined)).toBe(false)
  })

  test('retorna true para perguntas com "?"', () => {
    expect(precisaBuscar('como vai?')).toBe(true)
    expect(precisaBuscar('o que é isso?')).toBe(true)
    expect(precisaBuscar('quem é você?')).toBe(true)
  })

  test('retorna true para gatilhos de busca', () => {
    expect(precisaBuscar('quem é o presidente')).toBe(true)
    expect(precisaBuscar('qual é o preço')).toBe(true)
    expect(precisaBuscar('quando foi descoberto')).toBe(true)
    expect(precisaBuscar('onde fica Paris')).toBe(true)
    expect(precisaBuscar('quanto custa')).toBe(true)
    expect(precisaBuscar('como fazer bolo')).toBe(true)
    expect(precisaBuscar('por que o céu é azul')).toBe(true)
    expect(precisaBuscar('o que é inteligência artificial')).toBe(true)
    expect(precisaBuscar('notícia sobre clima')).toBe(true)
    expect(precisaBuscar('cotação do dólar')).toBe(true)
    expect(precisaBuscar('população do Brasil')).toBe(true)
    expect(precisaBuscar('capital da França')).toBe(true)
    expect(precisaBuscar('presidente dos EUA')).toBe(true)
    expect(precisaBuscar('significa essa palavra')).toBe(true)
  })

  test('case insensitive', () => {
    expect(precisaBuscar('QUEM é')).toBe(true)
    expect(precisaBuscar('PREÇO')).toBe(true)
  })

  test('retorna false para texto sem gatilhos', () => {
    expect(precisaBuscar('oi')).toBe(false)
    expect(precisaBuscar('bom dia')).toBe(false)
    expect(precisaBuscar('legal')).toBe(false)
    expect(precisaBuscar('tudo bem')).toBe(false)
  })

  test('gatilho "hoje"', () => {
    expect(precisaBuscar('como está o tempo hoje')).toBe(true)
  })

  test('gatilho "atual"', () => {
    expect(precisaBuscar('situação atual')).toBe(true)
  })

  test('gatilho "recente"', () => {
    expect(precisaBuscar('notícias recentes')).toBe(true)
  })
})

describe('buscarNaWeb', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.IMPORT_META.env.VITE_TAVILY_KEY = 'test-key'
    globalThis.fetch = jest.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    delete globalThis.IMPORT_META.env.VITE_TAVILY_KEY
  })

  test('retorna string vazia se API key não definida', async () => {
    delete globalThis.IMPORT_META.env.VITE_TAVILY_KEY
    const resultado = await buscarNaWeb('teste')
    expect(resultado).toBe('')
  })

  test('faz requisição POST para Tavily', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ answer: 'Resposta de teste', results: [] }),
    })

    await buscarNaWeb('o que é IA')
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.tavily.com/search',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })

  test('retorna answer e results formatados', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        answer: 'IA é inteligência artificial',
        results: [
          { title: 'Artigo 1', content: 'Conteúdo 1' },
          { title: 'Artigo 2', content: 'Conteúdo 2' },
        ],
      }),
    })

    const resultado = await buscarNaWeb('o que é inteligencia artificial')
    expect(resultado).toContain('Resumo: IA é inteligência artificial')
    expect(resultado).toContain('Artigo 1')
    expect(resultado).toContain('Conteúdo 1')
  })

  test('retorna string vazia em erro HTTP', async () => {
    globalThis.fetch.mockResolvedValue({ ok: false, status: 500 })
    const resultado = await buscarNaWeb('teste erro')
    expect(resultado).toBe('')
  })

  test('retorna string vazia em erro de rede', async () => {
    globalThis.fetch.mockRejectedValue(new Error('Network error'))
    const resultado = await buscarNaWeb('teste rede')
    expect(resultado).toBe('')
  })

  test('usa cache em consultas repetidas', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ answer: 'cached', results: [] }),
    })

    await buscarNaWeb('pergunta cacheada')
    await buscarNaWeb('pergunta cacheada')
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  test('limita a 4 resultados', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        answer: 'test',
        results: [
          { title: 'A', content: 'a' },
          { title: 'B', content: 'b' },
          { title: 'C', content: 'c' },
          { title: 'D', content: 'd' },
          { title: 'E', content: 'e' },
          { title: 'F', content: 'f' },
        ],
      }),
    })

    const resultado = await buscarNaWeb('muitos resultados')
    const linhas = resultado.split('\n').filter(l => l.startsWith('- '))
    expect(linhas.length).toBeLessThanOrEqual(4)
  })
})
