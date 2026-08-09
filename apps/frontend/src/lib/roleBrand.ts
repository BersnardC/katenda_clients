const palette = [
  '#2dd4bf',
  '#fb7185',
  '#a78bfa',
  '#f59e0b',
  '#38bdf8',
  '#4ade80',
  '#f472b6',
  '#fbbf24',
]

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function roleColor(name: string) {
  return palette[hash(name || 'role') % palette.length]
}
