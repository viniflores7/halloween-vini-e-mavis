interface CrewmateProps {
  color?: string
  withHat?: boolean
  className?: string
}

export function Crewmate({ color = '#1d1915', withHat = true, className = '' }: CrewmateProps) {
  return (
    <svg
      className={`crewmate ${className}`}
      viewBox={withHat ? '0 -38 124 172' : '0 14 124 120'}
      aria-hidden="true"
      fill="none"
      stroke="#120e0b"
      strokeWidth="3.5"
      strokeLinejoin="round"
    >
      <rect x="14" y="62" width="24" height="50" rx="10" fill={color} />
      <path
        d="M34 60C34 34 50 22 68 22C88 22 102 36 102 58V118C102 126 97 132 90 132H82C77 132 74 128 74 122V114H62V122C62 128 59 132 53 132H46C39 132 34 126 34 118Z"
        fill={color}
      />
      <rect x="58" y="40" width="52" height="28" rx="14" fill="#b8c7d1" />
      <rect x="70" y="45" width="22" height="7" rx="3.5" fill="#fff" fillOpacity="0.75" stroke="none" />
      {withHat && (
        <g>
          <path
            d="M46 28C54 14 58 -2 68 -14C76 -24 90 -30 104 -28C92 -22 86 -12 86 2C86 12 88 20 92 28Z"
            fill="#1d1915"
          />
          <ellipse cx="69" cy="29" rx="46" ry="8" fill="#1d1915" />
          <path d="M51 16H89L91 24H48Z" fill="#8a5a2b" />
          <rect x="64" y="14" width="11" height="12" rx="1.5" stroke="#d7b46a" strokeWidth="2.5" />
        </g>
      )}
    </svg>
  )
}
