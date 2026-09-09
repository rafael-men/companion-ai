Object.defineProperty(globalThis, 'IMPORT_META', {
  value: { env: { VITE_GROQ_KEY: 'test-groq-key', VITE_TAVILY_KEY: 'test-tavily-key' } },
  writable: true,
  configurable: true,
})

globalThis.IS_REACT_ACT_ENVIRONMENT = true

globalThis.localStorage = (() => {
  const store = {}
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { Object.keys(store).forEach(k => delete store[k]) },
  }
})()
