import type { SVGProps } from 'react'

const stroked: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function EmergencyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...props}>
      <ellipse cx="32" cy="50" rx="26" ry="9" fill="#5b5f66" stroke="#1d1915" strokeWidth="3" />
      <path d="M6 44v6c0 5 12 9 26 9s26-4 26-9v-6" fill="#3e4247" stroke="#1d1915" strokeWidth="3" />
      <path
        d="M14 44c0-14 8-26 18-26s18 12 18 26c0 4-8 6-18 6s-18-2-18-6z"
        fill="#c4231f"
        stroke="#1d1915"
        strokeWidth="3"
      />
      <path
        d="M22 32c2-6 5-9 9-10"
        stroke="#fff"
        strokeOpacity="0.7"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export function ReportIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...props}>
      <path d="M8 26h10l22-12v36L18 38H8z" fill="#d9c27a" stroke="#1d1915" strokeWidth="3" strokeLinejoin="round" />
      <path d="M14 38l4 16h8l-3-16" fill="#a8925a" stroke="#1d1915" strokeWidth="3" strokeLinejoin="round" />
      <path
        d="M48 22c4 3 6 7 6 10s-2 7-6 10M46 28c1.5 1 2.5 2.5 2.5 4s-1 3-2.5 4"
        stroke="#c4231f"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export function SkullIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...stroked} {...props}>
      <path d="M12 3a8 8 0 0 0-8 8c0 2.8 1.4 4.6 3 5.6V20h10v-3.4c1.6-1 3-2.8 3-5.6a8 8 0 0 0-8-8z" />
      <circle cx="9" cy="11" r="1.6" fill="currentColor" />
      <circle cx="15" cy="11" r="1.6" fill="currentColor" />
      <path d="M10 20v-2M14 20v-2" />
    </svg>
  )
}

export function ShareIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...stroked} {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  )
}

export function QrIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...stroked} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
    </svg>
  )
}

export function CameraIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...stroked} {...props}>
      <path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

export function SwitchCameraIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...stroked} {...props}>
      <path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4" />
    </svg>
  )
}

export function CrownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"
        fill="#d7b46a"
        stroke="#2e2318"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...stroked} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...stroked} {...props}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  )
}

export function BackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...stroked} {...props}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  )
}
