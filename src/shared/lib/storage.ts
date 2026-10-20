// localStorage e sessionStorage podem lançar erro em navegação privada ou com cookies bloqueados
function read(storage: () => Storage, key: string) {
  try {
    return storage().getItem(key)
  } catch {
    return null
  }
}

function write(storage: () => Storage, key: string, value: string) {
  try {
    storage().setItem(key, value)
  } catch {
    /* segue sem persistir */
  }
}

export const readStorage = (key: string) => read(() => localStorage, key)
export const writeStorage = (key: string, value: string) => write(() => localStorage, key, value)
export const readSessionStorage = (key: string) => read(() => sessionStorage, key)
export const writeSessionStorage = (key: string, value: string) => write(() => sessionStorage, key, value)
