import { detectarGesto, detectarEmocao, DURACAO_GESTO } from '../../src/lib/gesto.js'

describe('detectarGesto', () => {
  test('retorna null para texto vazio', () => {
    expect(detectarGesto('')).toBeNull()
    expect(detectarGesto(null)).toBeNull()
    expect(detectarGesto(undefined)).toBeNull()
  })

  test('retorna "nod" para frases afirmativas', () => {
    expect(detectarGesto('sim')).toBe('nod')
    expect(detectarGesto('claro')).toBe('nod')
    expect(detectarGesto('com certeza')).toBe('nod')
    expect(detectarGesto('certamente')).toBe('nod')
    expect(detectarGesto('exato')).toBe('nod')
    expect(detectarGesto('isso')).toBe('nod')
    expect(detectarGesto('perfeito')).toBe('nod')
    expect(detectarGesto('pode deixar')).toBe('nod')
    expect(detectarGesto('concordo')).toBe('nod')
    expect(detectarGesto('verdade')).toBe('nod')
    expect(detectarGesto('aham')).toBe('nod')
  })

  test('retorna "shake" para frases negativas', () => {
    expect(detectarGesto('não')).toBe('shake')
    expect(detectarGesto('nao')).toBe('shake')
    expect(detectarGesto('nunca')).toBe('shake')
    expect(detectarGesto('jamais')).toBe('shake')
    expect(detectarGesto('de jeito nenhum')).toBe('shake')
    expect(detectarGesto('negativo')).toBe('shake')
    expect(detectarGesto('discordo')).toBe('shake')
  })

  test('case insensitive', () => {
    expect(detectarGesto('SIM')).toBe('nod')
    expect(detectarGesto('Não')).toBe('shake')
    expect(detectarGesto('CLARO')).toBe('nod')
  })

  test('detecta palavras dentro de frases maiores', () => {
    expect(detectarGesto('eu acho que sim, concordo')).toBe('nod')
    expect(detectarGesto('não acho isso nunca')).toBe('shake')
  })

  test('prioridade: negativas antes de afirmativas', () => {
    expect(detectarGesto('não concordo')).toBe('shake')
  })

  test('retorna null para texto sem palavras-chave', () => {
    expect(detectarGesto('oi, tudo bem?')).toBeNull()
    expect(detectarGesto('olá')).toBeNull()
    expect(detectarGesto('legal')).toBeNull()
  })
})

describe('detectarEmocao', () => {
  test('retorna "neutral" para texto vazio', () => {
    expect(detectarEmocao('')).toBe('neutral')
    expect(detectarEmocao(null)).toBe('neutral')
  })

  test('retorna "happy" para palavras positivas', () => {
    expect(detectarEmocao('estou feliz')).toBe('happy')
    expect(detectarEmocao('isso é ótimo')).toBe('happy')
    expect(detectarEmocao('que legal')).toBe('happy')
    expect(detectarEmocao('adoro isso')).toBe('happy')
    expect(detectarEmocao('amo demais')).toBe('happy')
    expect(detectarEmocao('boa ideia')).toBe('happy')
    expect(detectarEmocao('animado')).toBe('happy')
    expect(detectarEmocao('alegre')).toBe('happy')
  })

  test('retorna "sad" para palavras tristes', () => {
    expect(detectarEmocao('estou triste')).toBe('sad')
    expect(detectarEmocao('muito chateado')).toBe('sad')
    expect(detectarEmocao('deprimido')).toBe('sad')
    expect(detectarEmocao('infeliz')).toBe('sad')
    expect(detectarEmocao('sinto muito')).toBe('sad')
    expect(detectarEmocao('que pena')).toBe('sad')
  })

  test('desanimado contém "animado" mas é detectado como sad por TRISTES', () => {
    expect(detectarEmocao('desanimado')).toBe('sad')
  })

  test('retorna "playful" para palavras irônicas', () => {
    expect(detectarEmocao('sarcástico')).toBe('playful')
    expect(detectarEmocao('ironia pura')).toBe('playful')
    expect(detectarEmocao('na zueira')).toBe('playful')
    expect(detectarEmocao('zoando')).toBe('playful')
  })

  test('retorna "angry" para palavras negativas', () => {
    expect(detectarEmocao('não')).toBe('angry')
    expect(detectarEmocao('nunca')).toBe('angry')
    expect(detectarEmocao('discordo totalmente')).toBe('angry')
  })

  test('retorna "neutral" para texto sem emoção detectável', () => {
    expect(detectarEmocao('oi')).toBe('neutral')
    expect(detectarEmocao('bom dia')).toBe('neutral')
  })

  test('case insensitive', () => {
    expect(detectarEmocao('FELIZ')).toBe('happy')
    expect(detectarEmocao('TRISTE')).toBe('sad')
  })
})

describe('DURACAO_GESTO', () => {
  test('nod tem duração de 1500ms', () => {
    expect(DURACAO_GESTO.nod).toBe(1500)
  })

  test('shake tem duração de 1500ms', () => {
    expect(DURACAO_GESTO.shake).toBe(1500)
  })
})
