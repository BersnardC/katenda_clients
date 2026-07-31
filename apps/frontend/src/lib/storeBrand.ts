const palette = [
  '#7BD3A8',
  '#F7B267',
  '#F4978E',
  '#A0C4FF',
  '#BDB2FF',
  '#FFC8DD',
  '#90E0EF',
  '#FFD6A5',
]
const emojis = [
  '🛍️',
  '👟',
  '👕',
  '📱',
  '🎧',
  '💄',
  '🍞',
  '☕',
  '🌿',
  '🪴',
  '📚',
  '🍩',
]

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function storeBrand(slug: string) {
  const h = hash(slug || 'katenda')
  return {
    color: palette[h % palette.length],
    emoji: emojis[h % emojis.length],
  }
}
