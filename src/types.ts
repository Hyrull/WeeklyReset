export interface ThemeClasses {
  border: string
  borderHover: string
  borderFocus: string
  text: string
  bg: string
  btn: string
  badge: string
  fallback: string
  logo: string
}

export interface GameEvent {
  id: string
  game: string
  type: 'season' | 'battlepass' | 'event' | 'info'
  title: string
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'skipped'
  notes?: string
}

export type SortOption = 'urgency' | 'game' | 'startDate'
