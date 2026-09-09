import { MODELOS } from '../../src/lib/models.js'

describe('MODELOS', () => {
  test('é um array não vazio', () => {
    expect(Array.isArray(MODELOS)).toBe(true)
    expect(MODELOS.length).toBeGreaterThan(0)
  })

  test('cada modelo tem file e label', () => {
    for (const modelo of MODELOS) {
      expect(modelo).toHaveProperty('file')
      expect(modelo).toHaveProperty('label')
      expect(typeof modelo.file).toBe('string')
      expect(typeof modelo.label).toBe('string')
    }
  })

  test('todos os arquivos terminam com .vrm', () => {
    for (const modelo of MODELOS) {
      expect(modelo.file).toMatch(/\.vrm$/)
    }
  })

  test('labels são strings não vazias', () => {
    for (const modelo of MODELOS) {
      expect(modelo.label.length).toBeGreaterThan(0)
    }
  })

  test('contém ao menos 5 modelos', () => {
    expect(MODELOS.length).toBeGreaterThanOrEqual(5)
  })
})
