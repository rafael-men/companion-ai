import { readdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const ANIMATIONS_DIR = join(process.cwd(), "public", "assets", "animations")
const OUT = join(process.cwd(), "src", "lib", "animations.js")

function toLabel(file) {
  return file.replace(/\.vrma$/i, "").replace(/[_-]+/g, " ").trim()
}

const files = readdirSync(ANIMATIONS_DIR).filter((f) => f.toLowerCase().endsWith(".vrma"))
const entries = files.map((f) => `  { file: ${JSON.stringify(f)}, label: ${JSON.stringify(toLabel(f))} },`)

const content = `// GERADO por scripts/gen-animations.mjs — rode \`npm run animations\` para atualizar.
// Lista de animações VRMA disponíveis na pasta public/assets/animations/.
export const ANIMACOES = [
${entries.join("\n")}
]
`

writeFileSync(OUT, content)
console.log(`Gerado ${OUT} com ${files.length} animação(ões):`, files.join(", "))