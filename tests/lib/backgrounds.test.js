import { BACKGROUNDS } from '../../src/lib/backgrounds.js'

describe('BACKGROUNDS', () => {
  test('é um array não vazio', () => {
    expect(Array.isArray(BACKGROUNDS)).toBe(true)
    expect(BACKGROUNDS.length).toBeGreaterThan(0)
  })

  test('cada background tem file (string ou null) e label', () => {
    for (const bg of BACKGROUNDS) {
      expect(bg).toHaveProperty('label')
      expect(typeof bg.label).toBe('string')
    }
  })

  test('primeiro background é "Nenhum" com file null', () => {
    expect(BACKGROUNDS[0]).toEqual({ file: null, label: 'Nenhum' })
  })

  test('backgrounds com imagem têm extensão de imagem', () => {
    const comImagem = BACKGROUNDS.filter((bg) => bg.file !== null)
    for (const bg of comImagem) {
      expect(bg.file).toMatch(/\.(jpg|jpeg|png|webp)$/i)
    }
  })
})
