import { describe, expect, it } from 'vitest'
import { generateRoomCode, normalizeRoomCode, roomLink } from './roomCode'

describe('generateRoomCode', () => {
  it('gera 4 letras sem I nem O, fáceis de digitar no celular', () => {
    for (let i = 0; i < 200; i++) expect(generateRoomCode()).toMatch(/^[A-HJ-NP-Z]{4}$/)
  })
})

describe('normalizeRoomCode', () => {
  it('ignora espaços, caixa, números e o que passar de 4 letras', () => {
    expect(normalizeRoomCode('  br-u x9z ')).toBe('BRUX')
  })
})

describe('roomLink', () => {
  it('monta o link da sala', () => {
    expect(roomLink('sala', 'BRUX', 'https://site.com')).toBe('https://site.com/sala/BRUX')
    expect(roomLink('concurso', 'BRUX', 'https://site.com')).toBe('https://site.com/concurso/BRUX')
  })
})
