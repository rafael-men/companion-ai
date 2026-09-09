export const CHAVE_MODO_TRANSPARENTE = "companion-transparent-mode"

function obterDependencias(deps = {}) {
  return {
    doc: deps.doc ?? globalThis.document ?? null,
    storage: deps.storage ?? globalThis.localStorage ?? null,
    electronAPI: deps.electronAPI ?? globalThis.window?.electronAPI ?? null,
  }
}

function aplicarNoDom(doc, ativo) {
  doc?.documentElement?.classList.toggle("transparent-mode", ativo)
  doc?.body?.classList.toggle("transparent-mode", ativo)
}

/**
 * @param {Storage} [storage]
 * @returns {boolean}
 */
export function lerModoTransparente(storage = globalThis.localStorage) {
  return storage?.getItem(CHAVE_MODO_TRANSPARENTE) === "true"
}

/**
 * @param {boolean} ativo
 * @param {{doc?: Document, storage?: Storage, electronAPI?: {setTransparent?: Function}}} [deps]
 * @returns {boolean}
 */
export function aplicarModoTransparente(ativo, deps = {}) {
  const { doc, electronAPI } = obterDependencias(deps)
  aplicarNoDom(doc, ativo)
  electronAPI?.setTransparent?.(ativo)
  return ativo
}

/**
 * @param {boolean} ativo
 * @param {{doc?: Document, storage?: Storage, electronAPI?: {setTransparent?: Function}}} [deps]
 * @returns {boolean}
 */
export function setModoTransparente(ativo, deps = {}) {
  const { storage } = obterDependencias(deps)
  storage?.setItem(CHAVE_MODO_TRANSPARENTE, String(ativo))
  return aplicarModoTransparente(ativo, deps)
}

/**
 * @param {{doc?: Document, storage?: Storage, electronAPI?: {setTransparent?: Function}}} [deps]
 * @returns {boolean}
 */
export function alternarModoTransparente(deps = {}) {
  const { storage } = obterDependencias(deps)
  const ativo = !lerModoTransparente(storage)
  return setModoTransparente(ativo, deps)
}