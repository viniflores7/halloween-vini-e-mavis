import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { playerSetupContent as copy } from '@/content/playerSetup'
import { CameraIcon, SwitchCameraIcon } from '@/shared/components/Icons'
import { photoFromFile, squarePhoto } from '@/shared/lib/photo'

interface CameraCaptureProps {
  photo: string
  onChange: (photo: string) => void
}

type CameraState = 'starting' | 'live' | 'unavailable'
type Facing = 'user' | 'environment'

export function CameraCapture({ photo, onChange }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [facing, setFacing] = useState<Facing>('user')
  const [state, setState] = useState<CameraState>('starting')
  const [attempt, setAttempt] = useState(0)
  const showingPhoto = Boolean(photo)

  useEffect(() => {
    if (showingPhoto) return
    if (!navigator.mediaDevices?.getUserMedia) return setState('unavailable')

    let stream: MediaStream | undefined
    let cancelled = false
    setState('starting')
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: facing, width: { ideal: 720 }, height: { ideal: 720 } }, audio: false })
      .then(async (media) => {
        stream = media
        if (cancelled || !videoRef.current) return
        videoRef.current.srcObject = media
        await videoRef.current.play()
        if (!cancelled) setState('live')
      })
      .catch(() => !cancelled && setState('unavailable'))

    return () => {
      cancelled = true
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [showingPhoto, facing, attempt])

  function capture() {
    const video = videoRef.current
    if (!video?.videoWidth) return
    onChange(squarePhoto(video, video.videoWidth, video.videoHeight, facing === 'user'))
  }

  async function pickFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) onChange(await photoFromFile(file))
  }

  return (
    <div className="camera">
      <div className={`camera__viewport ${facing === 'user' ? 'is-mirrored' : ''}`}>
        {showingPhoto ? (
          <img src={photo} alt="" className="camera__media" />
        ) : (
          <video ref={videoRef} className="camera__media camera__video" playsInline muted autoPlay />
        )}
        {!showingPhoto && state !== 'live' && (
          <div className="camera__placeholder">
            {state === 'starting' ? <CameraIcon className="camera__placeholder-icon" /> : copy.cameraDenied}
          </div>
        )}
      </div>

      <div className="camera__actions">
        {showingPhoto ? (
          <button type="button" className="button" onClick={() => onChange('')}>
            <CameraIcon width={22} /> {copy.retake}
          </button>
        ) : state === 'unavailable' ? (
          <button type="button" className="button" onClick={() => setAttempt((count) => count + 1)}>
            {copy.retryCamera}
          </button>
        ) : (
          <>
            <button type="button" className="button button--primary" disabled={state !== 'live'} onClick={capture}>
              <CameraIcon width={22} /> {state === 'starting' ? copy.starting : copy.capture}
            </button>
            <button
              type="button"
              className="button camera__switch"
              aria-label={copy.switchCamera}
              onClick={() => setFacing((current) => (current === 'user' ? 'environment' : 'user'))}
            >
              <SwitchCameraIcon width={22} />
            </button>
          </>
        )}
      </div>
      <button type="button" className="link" onClick={() => fileRef.current?.click()}>
        {copy.pickFile}
      </button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickFile} />
    </div>
  )
}
