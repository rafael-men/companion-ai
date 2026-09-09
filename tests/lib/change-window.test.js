/**
 * @jest-environment jsdom
 */
import {
  CHAVE_MODO_TRANSPARENTE,
  lerModoTransparente,
  aplicarModoTransparente,
  setModoTransparente,
  alternarModoTransparente,
} from '../../src/lib/change-window.js'

function criarStorageFake() {
  const dados = new Map()
  return {
    getItem: jest.fn((chave) => dados.get(chave) ?? null),
    setItem: jest.fn((chave, valor) => dados.set(chave, String(valor))),
  }
}

describe('change-window', () => {
  let storage
  let electronAPI

  beforeEach(() => {
    document.documentElement.classList.remove('transparent-mode')
    document.body.classList.remove('transparent-mode')
    localStorage.clear()
    storage = criarStorageFake()
    electronAPI = { setTransparent: jest.fn() }
  })

  test('lerModoTransparente retorna false sem chave salva', () => {
    expect(lerModoTransparente(storage)).toBe(false)
  })

  test('lerModoTransparente retorna true quando salvo como "true"', () => {
    storage.setItem(CHAVE_MODO_TRANSPARENTE, 'true')
    expect(lerModoTransparente(storage)).toBe(true)
  })

  test('aplicarModoTransparente adiciona classe no DOM e notifica o Electron', () => {
    aplicarModoTransparente(true, { electronAPI })

    expect(document.documentElement.classList.contains('transparent-mode')).toBe(true)
    expect(document.body.classList.contains('transparent-mode')).toBe(true)
    expect(electronAPI.setTransparent).toHaveBeenCalledWith(true)
  })

  test('aplicarModoTransparente(false) remove a classe do DOM', () => {
    aplicarModoTransparente(true, { electronAPI })
    aplicarModoTransparente(false, { electronAPI })

    expect(document.documentElement.classList.contains('transparent-mode')).toBe(false)
    expect(document.body.classList.contains('transparent-mode')).toBe(false)
    expect(electronAPI.setTransparent).toHaveBeenLastCalledWith(false)
  })

  test('aplicarModoTransparente não quebra na ausência do Electron', () => {
    aplicarModoTransparente(true)

    expect(document.body.classList.contains('transparent-mode')).toBe(true)
  })

  test('setModoTransparente persiste o estado e aplica', () => {
    setModoTransparente(true, { storage, electronAPI })

    expect(storage.setItem).toHaveBeenCalledWith(CHAVE_MODO_TRANSPARENTE, 'true')
    expect(document.body.classList.contains('transparent-mode')).toBe(true)
    expect(electronAPI.setTransparent).toHaveBeenCalledWith(true)
  })

  test('alternarModoTransparente vai de false para true', () => {
    const resultado = alternarModoTransparente({ storage, electronAPI })

    expect(resultado).toBe(true)
    expect(storage.setItem).toHaveBeenCalledWith(CHAVE_MODO_TRANSPARENTE, 'true')
    expect(document.body.classList.contains('transparent-mode')).toBe(true)
  })

  test('alternarModoTransparente usa localStorage por padrão no navegador', () => {
    const resultado = alternarModoTransparente()

    expect(resultado).toBe(true)
    expect(localStorage.getItem(CHAVE_MODO_TRANSPARENTE)).toBe('true')
  })
})