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
    bg: 'bg-amber-900/30',
    btn: 'bg-amber-600/10 text-amber-300 border-amber-600/30 hover:bg-amber-600/20',
    badge: 'bg-amber-800/40 text-amber-200 border-amber-700/50',
    fallback: 'bg-amber-700/20',
    logo: '/logos/worldofwarcraft.png'
  },

  'Diablo III': {
    // Reaper of Souls color scheme to differentiate with Diablo IV
    border: 'border-cyan-900',
    borderHover: 'hover:border-cyan-500/50',
    borderFocus: 'focus:border-cyan-400',
    text: 'text-cyan-300',
    bg: 'bg-cyan-950/30',
    btn: 'bg-cyan-950/50 text-cyan-400 border-cyan-900 hover:bg-cyan-900/80 hover:text-cyan-200 hover:border-cyan-500/30',
    badge: 'bg-zinc-900 text-cyan-400 border-cyan-900/60',
    fallback: 'bg-zinc-900',
    logo: '/logos/diabloiii.png'
  },
  
  'Diablo IV': {
    border: 'border-red-700',
    borderHover: 'hover:border-red-500/50',
    borderFocus: 'focus:border-red-500',
    text: 'text-red-400',
    bg: 'bg-red-900/20',
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
    bg: 'bg-cyan-900/30',
    btn: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20',
    badge: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50',
    fallback: 'bg-cyan-500/20',
    logo: '/logos/fortnite.png'
  },

  'Marvel Rivals': {
    border: 'border-yellow-600',
    borderHover: 'hover:border-yellow-400/50',
    borderFocus: 'focus:border-yellow-400',
    text: 'text-yellow-400',
    bg: 'bg-yellow-900/20',
    btn: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20 hover:bg-yellow-500/20',
    badge: 'bg-yellow-900/40 text-yellow-200 border-yellow-700/50',
    fallback: 'bg-yellow-600/20',
    logo: '/logos/marvelrivals.png',
  },

  'Rocket League': {
    border: 'border-cyan-500',
    borderHover: 'hover:border-cyan-300/50',
    borderFocus: 'focus:border-cyan-300',
    text: 'text-cyan-400',
    bg: 'bg-cyan-900/20',
    btn: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20',
    badge: 'bg-cyan-900/40 text-cyan-200 border-cyan-700/50',
    fallback: 'bg-cyan-500/20',
    logo: '/logos/rocketleague.png',
  },

  'Valorant': {
    border: 'border-rose-600',
    borderHover: 'hover:border-rose-400/50',
    borderFocus: 'focus:border-rose-500',
    text: 'text-rose-400',
    bg: 'bg-rose-900/20',
    btn: 'bg-rose-600 text-white border-rose-700 hover:bg-rose-500',
    badge: 'bg-rose-950 text-rose-300 border-rose-800',
    fallback: 'bg-zinc-900',
    logo: '/logos/valorant.png'
  },

  'Teamfight Tactics': {
    border: 'border-amber-400',
    borderHover: 'hover:border-amber-200',
    borderFocus: 'focus:border-amber-300',
    text: 'text-amber-200',
    bg: 'bg-slate-900',
    btn: 'bg-amber-600/20 text-amber-200 border-amber-500/50 hover:bg-amber-600/40',
    badge: 'bg-amber-950 text-amber-300 border-amber-800',
    fallback: 'bg-slate-900',
    logo: '/logos/teamfighttactics.png'
  },

  'Sea of Thieves': {
    border: 'border-emerald-500',
    borderHover: 'hover:border-emerald-300/50',
    borderFocus: 'focus:border-emerald-300',
    text: 'text-emerald-400',
    bg: 'bg-emerald-900/40',
    btn: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20',
    badge: 'bg-emerald-900/40 text-emerald-200 border-emerald-700/50',
    fallback: 'bg-emerald-600/20',
    logo: '/logos/seaofthieves.png',
  },

  'Hearthstone': {
    border: 'border-amber-700',
    borderHover: 'hover:border-amber-500/50',
    borderFocus: 'focus:border-amber-500',
    text: 'text-amber-500',
    bg: 'bg-amber-900/30',
    btn: 'bg-amber-600/10 text-amber-400 border-amber-600/20 hover:bg-amber-600/20',
    badge: 'bg-amber-950/60 text-amber-200 border-amber-800/50',
    fallback: 'bg-amber-700/20',
    logo: '/logos/hearthstone.png'
  },

  'Pokémon TCG Pocket': {
    border: 'border-cyan-700',
    borderHover: 'hover:border-cyan-500',
    borderFocus: 'focus:border-cyan-400',
    text: 'text-cyan-100',
    bg: 'bg-slate-950',
    btn: 'bg-cyan-900/40 text-cyan-200 border-cyan-800 hover:bg-cyan-800/60',
    badge: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    fallback: 'bg-slate-900',
    logo: '/logos/pokemontcgpocket.png'
  },

  'Pokémon GO': {
    border: 'border-emerald-600',
    borderHover: 'hover:border-emerald-400',
    borderFocus: 'focus:border-emerald-500',
    text: 'text-emerald-100',
    bg: 'bg-zinc-900',
    btn: 'bg-emerald-900/40 text-emerald-200 border-emerald-800 hover:bg-emerald-800/60',
    badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    fallback: 'bg-emerald-950',
    logo: '/logos/pokémongo.png'
  },

  'Honkai: Star Rail': {
    border: 'border-indigo-500',
    borderHover: 'hover:border-amber-400',
    borderFocus: 'focus:border-indigo-400',
    text: 'text-amber-100',
    bg: 'bg-[#0f1016]',
    btn: 'bg-indigo-900/40 text-amber-200 border-indigo-700 hover:bg-indigo-800/60',
    badge: 'bg-indigo-950 text-amber-300 border-indigo-800',
    fallback: 'bg-slate-950',
    logo: '/logos/honkaistarrail.png'
  },

  'Hatsune Miku: Colorful Stage!': {
    border: 'border-teal-400',
    borderHover: 'hover:border-pink-400',
    borderFocus: 'focus:border-teal-300',
    text: 'text-teal-100',
    bg: 'bg-zinc-900',
    btn: 'bg-teal-900/40 text-teal-200 border-teal-700 hover:bg-teal-800/60',
    badge: 'bg-teal-950 text-teal-300 border-teal-800',
    fallback: 'bg-zinc-900',
    logo: '/logos/hatsu,nemikucolorfulstage.png'
  },

  // Neutral
  'General Gaming': {
    border: 'border-zinc-600',
    borderHover: 'hover:border-zinc-400',
    borderFocus: 'focus:border-zinc-300',
    text: 'text-zinc-200',
    bg: 'bg-zinc-900/50',
    btn: 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700 hover:text-white',
    badge: 'bg-zinc-950 text-zinc-400 border-zinc-800',
    fallback: 'bg-zinc-800',
    logo: '/logos/generalgaming.png'
  },
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

// Yes, the list of supported games is based off what game has a theme. What are you gonna do about it
export const SUPPORTED_GAMES = Object.keys(GAME_THEMES)