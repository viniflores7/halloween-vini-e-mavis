const DYNAMIC_ROUTES: [RegExp, string][] = [
  [/^\/sala\/[^/]+\/?$/, '/sala/[codigo]'],
  [/^\/concurso\/[^/]+\/?$/, '/concurso/[codigo]'],
]

// Nos relatórios da Vercel, todas as salas contam como a mesma página em vez de uma linha por código
export function routePattern(pathname: string) {
  return DYNAMIC_ROUTES.find(([pattern]) => pattern.test(pathname))?.[1] ?? pathname
}
