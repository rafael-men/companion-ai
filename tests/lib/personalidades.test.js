import { PERSONALIDADES, PERSONALIDADE_PADRAO, gerarRespostaRosto } from '../../src/lib/personalidades.js'

describe('PERSONALIDADES', () => {
  test('contém 4 personalidades', () => {
    expect(PERSONALIDADES).toHaveLength(4)
  })

  test('contém Amigável, Profissional, Engraçado, Sarcástico', () => {
    expect(PERSONALIDADES).toContain('Amigável')
    expect(PERSONALIDADES).toContain('Profissional')
    expect(PERSONALIDADES).toContain('Engraçado')
    expect(PERSONALIDADES).toContain('Sarcástico')
  })
})

describe('PERSONALIDADE_PADRAO', () => {
  test('é Amigável', () => {
    expect(PERSONALIDADE_PADRAO).toBe('Amigável')
  })

  test('é a primeira da lista', () => {
    expect(PERSONALIDADE_PADRAO).toBe(PERSONALIDADES[0])
  })
})

describe('gerarRespostaRosto', () => {
  test('retorna string para cada personalidade', () => {
    for (const p of PERSONALIDADES) {
      const resultado = gerarRespostaRosto(p)
      expect(typeof resultado).toBe('string')
      expect(resultado.length).toBeGreaterThan(0)
    }
  })

  test('Amigável retorna resposta amigável', () => {
    const resultado = gerarRespostaRosto('Amigável')
    expect(typeof resultado).toBe('string')
  })

  test('Profissional retorna resposta profissional', () => {
    const resultado = gerarRespostaRosto('Profissional')
    expect(typeof resultado).toBe('string')
  })

  test('Engraçado retorna resposta engraçada', () => {
    const resultado = gerarRespostaRosto('Engraçado')
    expect(typeof resultado).toBe('string')
  })

  test('Sarcástico retorna resposta sarcástica', () => {
    const resultado = gerarRespostaRosto('Sarcástico')
    expect(typeof resultado).toBe('string')
  })

  test('personalidade desconhecida usa resposta padrão (Amigável)', () => {
    const resultadoDesconhecido = gerarRespostaRosto('Desconhecida')
    const resultadoPadrao = gerarRespostaRosto(PERSONALIDADE_PADRAO)
    expect(typeof resultadoDesconhecido).toBe('string')
    expect(typeof resultadoPadrao).toBe('string')
  })

  test('gera respostas variadas (não determinística)', () => {
    const resultados = new Set()
    for (let i = 0; i < 20; i++) {
      resultados.add(gerarRespostaRosto('Amigável'))
    }
    expect(resultados.size).toBeGreaterThan(1)
  })
})
