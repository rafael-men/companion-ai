import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const ASSETS_DIR = join(process.cwd(), "public", "assets")
const OUT = join(process.cwd(), "src", "lib", "backgrounds.js")

const EXT = /\.(png|jpe?g|webp|gif)$/i


function toLabel(file) {
  const nome = file.replace(EXT, "").replace(/[_-]+/g, " ").trim()
  return nome.charAt(0).toUpperCase() + nome.slice(1)
}

if (!existsSync(ASSETS_DIR)) mkdirSync(ASSETS_DIR, { recursive: true })

const files = readdirSync(ASSETS_DIR).filter((f) => EXT.test(f))
const entries = files.map(
  (f) => `  { file: ${JSON.stringify(f)}, label: ${JSON.stringify(toLabel(f))} },`
)

const content = `// GERADO por utils/gen-backgrounds.mjs — rode \`npm run backgrounds\` para atualizar.
// Fundos de tela disponíveis na pasta public/assets/.
export const BACKGROUNDS = [
  { file: null, label: "Nenhum" },
${entries.join("\n")}
]
`

writeFileSync(OUT, content)
console.log(`Gerado ${OUT} com ${files.length} fundo(s):`, files.join(", ") || "(nenhum)")
