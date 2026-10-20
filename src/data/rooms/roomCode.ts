const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ'

export const ROOM_CODE_LENGTH = 4

export function generateRoomCode(length = ROOM_CODE_LENGTH) {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('')
}

export function normalizeRoomCode(code: string) {
  return code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, ROOM_CODE_LENGTH)
}

export function roomLink(code: string, origin = window.location.origin) {
  return `${origin}/sala/${code}`
}
