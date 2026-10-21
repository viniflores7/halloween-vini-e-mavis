import { describe, expect, it } from 'vitest'
import { routePattern } from './routePattern'

describe('routePattern', () => {
  it.each([
    ['/sala/BRUX', '/sala/[codigo]'],
    ['/concurso/FANT/', '/concurso/[codigo]'],
    ['/concurso', '/concurso'],
    ['/jogatina', '/jogatina'],
    ['/', '/'],
  ])('agrupa %s como %s', (pathname, expected) => {
    expect(routePattern(pathname)).toBe(expected)
  })
})
