const PHOTO_SIZE = 320
const PHOTO_QUALITY = 0.8

// Recorta o centro em quadrado e comprime: a foto vai direto no Firestore, que aceita até 1 MB por documento
export function squarePhoto(source: CanvasImageSource, width: number, height: number, mirror = false) {
  const side = Math.min(width, height)
  const canvas = document.createElement('canvas')
  canvas.width = PHOTO_SIZE
  canvas.height = PHOTO_SIZE
  const context = canvas.getContext('2d')!
  if (mirror) {
    context.translate(PHOTO_SIZE, 0)
    context.scale(-1, 1)
  }
  context.drawImage(source, (width - side) / 2, (height - side) / 2, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE)
  return canvas.toDataURL('image/jpeg', PHOTO_QUALITY)
}

export function photoFromFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      resolve(squarePhoto(image, image.naturalWidth, image.naturalHeight))
      URL.revokeObjectURL(url)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não deu para ler a imagem'))
    }
    image.src = url
  })
}
