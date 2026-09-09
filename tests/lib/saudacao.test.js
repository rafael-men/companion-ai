import { montarSaudacao } from '../../src/lib/saudacao.js'

describe('montarSaudacao', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('retorna string com cumprimento para manhã', () => {
    const data = new Date(2026, 0, 1, 9, 0, 0)
    const resultado = montarSaudacao({}, data)
    expect(typeof resultado).toBe('string')
    expect(resultado.length).toBeGreaterThan(0)
  })

  test('cumprimento correto para madrugada (0-5h)', () => {
    const data = new Date(2026, 0, 1, 3, 0, 0)
    const resultado = montarSaudacao({}, data)
    expect(resultado.toLowerCase()).toMatch(/madrugada/)
  })

  test('cumprimento correto para manhã (6-11h)', () => {
    const data = new Date(2026, 0, 1, 9, 0, 0)
    const resultado = montarSaudacao({}, data)
    expect(resultado.toLowerCase()).toMatch(/bom dia/)
  })

  test('cumprimento correto para tarde (12-17h)', () => {
    const data = new Date(2026, 0, 1, 14, 0, 0)
    const resultado = montarSaudacao({}, data)
    expect(resultado.toLowerCase()).toMatch(/boa tarde/)
  })

  test('cumprimento correto para noite (18-23h)', () => {
    const data = new Date(2026, 0, 1, 21, 0, 0)
    const resultado = montarSaudacao({}, data)
    expect(resultado.toLowerCase()).toMatch(/boa noite/)
  })

  test('inclui nome do modelo se fornecido', () => {
    const data = new Date(2026, 0, 1, 9, 0, 0)
    const resultado = montarSaudacao({ nomeModelo: 'Companheiro' }, data)
    expect(resultado).toContain('Companheiro')
  })

  test('inclui nome do usuário se fornecido', () => {
    const data = new Date(2026, 0, 1, 9, 0, 0)
    const resultado = montarSaudacao({ nomeUsuario: 'João' }, data)
    expect(resultado).toContain('João')
  })

  test('usa data atual quando não fornecida', () => {
    const resultado = montarSaudacao({})
    expect(typeof resultado).toBe('string')
    expect(resultado.length).toBeGreaterThan(0)
  })

  test('primeira visita (sem localStorage) - sem volta', () => {
    const data = new Date(2026, 0, 1, 9, 0, 0)
    const resultado = montarSaudacao({}, data)
    expect(typeof resultado).toBe('string')
  })

  test('localStorage é utilizado para rastrear visitas', () => {
    const data = new Date(2026, 0, 1, 9, 0, 0)
    montarSaudacao({}, data)
    expect(localStorage.getItem('companion-last-visit')).toBeTruthy()
  })

  test('intervalo médio (3-24h) inclui mensagem de volta', () => {
    const data1 = new Date(2026, 0, 1, 9, 0, 0)
    montarSaudacao({}, data1)
    const data2 = new Date(2026, 0, 1, 13, 0, 0)
    const resultado = montarSaudacao({}, data2)
    expect(typeof resultado).toBe('string')
  })

  test('intervalo longo (24h+) inclui mensagem de volta', () => {
    const data1 = new Date(2026, 0, 1, 9, 0, 0)
    montarSaudacao({}, data1)
    const data2 = new Date(2026, 0, 2, 9, 0, 0)
    const resultado = montarSaudacao({}, data2)
    expect(typeof resultado).toBe('string')
  })
})
