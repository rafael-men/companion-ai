import { User, Sparkles, Smile, Image, Palette, Waves, Drama } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { MODELOS } from "@/lib/models"
import { ANIMACOES } from "@/lib/animations"
import { PERSONALIDADES } from "@/lib/personalidades"
import { Field, FieldLabel } from "./Field"
import BackgroundPicker from "./BackgroundPicker"

const PANEL_THEMES = [
  { value: "default", label: "Padrão", swatchClass: "theme-swatch-default" },
  { value: "cool", label: "Cool", swatchClass: "theme-swatch-cool" },
  { value: "warm", label: "Quente", swatchClass: "theme-swatch-warm" },
  { value: "neon", label: "Neon", swatchClass: "theme-swatch-neon" },
]

const EMOTE_NENHUM = "nenhum"

export default function SidebarContent({
  avatar,
  onAvatarChange,
  personalidade,
  onPersonalidadeChange,
  armAngle,
  onArmAngleChange,
  background,
  onBackgroundChange,
  nomeUsuario,
  onNomeUsuarioChange,
  lipSyncIntensity,
  onLipSyncIntensityChange,
  panelTheme,
  onPanelThemeChange,
  animation,
  onAnimationChange,
}) {
  return (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
      <Field>
        <FieldLabel icon={User}>Seu nome</FieldLabel>
        <Input
          type="text"
          value={nomeUsuario}
          onChange={(e) => onNomeUsuarioChange(e.target.value)}
          placeholder="Como você quer ser chamado?"
          className="text-sm"
        />
      </Field>

      <Field>
        <FieldLabel icon={User}>Avatar</FieldLabel>
        <Select value={avatar} onValueChange={onAvatarChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Escolha um modelo" />
          </SelectTrigger>
          <SelectContent>
            {MODELOS.map((m) => (
              <SelectItem key={m.file} value={m.file}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel icon={Sparkles}>Personalidade</FieldLabel>
        <Select value={personalidade} onValueChange={onPersonalidadeChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERSONALIDADES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel icon={Image}>Fundo de tela</FieldLabel>
        <BackgroundPicker value={background} onChange={onBackgroundChange} />
      </Field>

      <Field>
        <FieldLabel icon={Smile} value={armAngle.toFixed(2)}>
          Pose dos braços
        </FieldLabel>
        <Slider
          min={0}
          max={1.6}
          step={0.05}
          value={[armAngle]}
          onValueChange={(v) => onArmAngleChange(v[0])}
        />
        <span className="text-xs text-muted-foreground">
          Ajuste a posição dos braços.
        </span>
      </Field>

      <Field>
        <FieldLabel icon={Waves} value={lipSyncIntensity.toFixed(2)}>
          Intensidade do lip-sync
        </FieldLabel>
        <Slider
          min={0}
          max={2}
          step={0.05}
          value={[lipSyncIntensity]}
          onValueChange={(v) => onLipSyncIntensityChange(v[0])}
        />
        <span className="text-xs text-muted-foreground">
          Ajuste o quão preciso o avatar move a boca ao falar.
        </span>
      </Field>

      <Field>
        <FieldLabel icon={Drama}>Emote</FieldLabel>
        <Select
          value={animation ?? EMOTE_NENHUM}
          onValueChange={(v) => onAnimationChange(v === EMOTE_NENHUM ? null : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Escolha um emote" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EMOTE_NENHUM}>Nenhum</SelectItem>
            {ANIMACOES.map((a) => (
              <SelectItem key={a.file} value={a.file}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          Toca a animação uma vez e volta ao movimento padrão.
        </span>
      </Field>

      <Field>
        <FieldLabel icon={Palette}>Tema do painel</FieldLabel>
        <div className="grid grid-cols-4 gap-3">
          {PANEL_THEMES.map((theme) => (
            <button
              key={theme.value}
              type="button"
              onClick={() => onPanelThemeChange(theme.value)}
              className={`theme-swatch ${theme.swatchClass} rounded-full border transition-all focus-visible:ring-2 focus-visible:ring-ring ${panelTheme === theme.value ? "border-primary shadow-[0_0_0_3px_rgba(139,92,246,0.25)]" : "border-border"}`}
              aria-pressed={panelTheme === theme.value}
              aria-label={theme.label}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          Escolha o estilo de cor da sidebar para o tema.
        </span>
      </Field>
    </nav>
  )
}
