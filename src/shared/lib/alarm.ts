let context: AudioContext | undefined

// Navegadores só liberam som depois de um toque na tela; chame no primeiro toque
export function unlockAudio() {
  context ??= new AudioContext()
  if (context.state === 'suspended') context.resume().catch(() => undefined)
}

export function vibrate(pattern: number[]) {
  if ('vibrate' in navigator) navigator.vibrate(pattern)
}

export function playAlarm() {
  if (!context || context.state !== 'running') return
  const start = context.currentTime
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'square'
  for (let i = 0; i < 6; i++) oscillator.frequency.setValueAtTime(i % 2 ? 520 : 780, start + i * 0.22)
  gain.gain.setValueAtTime(0.08, start)
  gain.gain.exponentialRampToValueAtTime(0.001, start + 1.4)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start(start)
  oscillator.stop(start + 1.4)
}
