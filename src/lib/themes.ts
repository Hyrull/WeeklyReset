import { ThemeClasses } from '@/types'

const DEFAULT_THEME: ThemeClasses = {
  border: 'border-emerald-900',
  borderHover: 'hover:border-emerald-500/50',
  borderFocus: 'focus:border-emerald-500',
  text: 'text-emerald-400',
  bg: 'bg-emerald-900/10',
  btn: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
  badge: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
  fallback: 'bg-emerald-500/20',
  logo: '/logos/default.png'
}

const GAME_THEMES: Record<string, ThemeClasses> = {
  'World of Warcraft': {
    border: 'border-amber-800',
    borderFocus: 'focus:border-amber-500',
    borderHover: 'hover:border-amber-500/60',
    text: 'text-amber-300',
    bg: 'bg-amber-900/10',
    btn: 'bg-amber-600/10 text-amber-300 border-amber-600/30 hover:bg-amber-600/20',
    badge: 'bg-amber-800/40 text-amber-200 border-amber-700/50',
    fallback: 'bg-amber-700/20',
    logo: '/logos/wow.png'
  },
  'Diablo IV': {
    border: 'border-red-900',
    borderHover: 'hover:border-red-500/50',
    borderFocus: 'focus:border-red-500',
    text: 'text-red-400',
    bg: 'bg-red-900/10',
    btn: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20',
    badge: 'bg-red-900/40 text-red-300 border-red-700/50',
    fallback: 'bg-red-500/20',
    logo: '/logos/diabloiv.png'
  },
  'Fortnite': {
    border: 'border-cyan-900',
    borderHover: 'hover:border-cyan-500/50',
    borderFocus: 'focus:border-cyan-500',
    text: 'text-cyan-400',
    bg: 'bg-cyan-900/10',
    btn: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20',
    badge: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50',
    fallback: 'bg-cyan-500/20',
    logo: '/logos/fortnite.png'
  },
  'Marvel Rivals': {
    border: 'border-red-700',
    borderHover: 'hover:border-red-500',
    borderFocus: 'focus:border-red-500',
    text: 'text-red-400',
    bg: 'bg-red-950/20',
    btn: 'bg-red-600/20 text-red-300 border-red-500/40 hover:bg-red-600/30',
    badge: 'bg-red-800/50 text-red-200 border-red-600/50',
    fallback: 'bg-red-700/30',
    logo: '/logos/marvelrivals.png'
  }
}

export const getTheme = (gameName: string): ThemeClasses => {
  if (!gameName) return DEFAULT_THEME
  
  const normalizedInput = gameName.trim().toLowerCase()
  
  const matchedKey = Object.keys(GAME_THEMES).find(key => 
    key.toLowerCase() === normalizedInput
  )

  if (!matchedKey) {
    console.warn(`Theme missing for: "${gameName}" (Using Default)`)
    return DEFAULT_THEME
  }

  return GAME_THEMES[matchedKey]
}
