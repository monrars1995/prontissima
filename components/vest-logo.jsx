export default function VestLogo({ className = "", size = 240 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cabide Dourado */}
      <path d="M80 50 Q120 30 160 50" stroke="#D4AF37" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="120" cy="35" r="8" stroke="#D4AF37" strokeWidth="3" fill="none" />
      <path
        d="M60 80 Q70 70 80 50 M160 50 Q170 70 180 80"
        stroke="#D4AF37"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* V Burgundy */}
      <path d="M80 80 L120 180 L160 80 L140 80 L120 140 L100 80 Z" fill="#5C1F33" />

      {/* Chip IA no centro do V */}
      <rect x="110" y="120" width="20" height="20" rx="2" fill="white" opacity="0.9" />
      <path
        d="M113 127 L117 127 M117 123 L117 131 M123 127 L127 127 M123 123 L123 131"
        stroke="#5C1F33"
        strokeWidth="1"
      />

      {/* Estrelinhas */}
      <path d="M185 75 L187 80 L192 80 L188 83 L190 88 L185 85 L180 88 L182 83 L178 80 L183 80 Z" fill="#D4AF37" />
      <path d="M195 95 L196 98 L199 98 L197 100 L198 103 L195 101 L192 103 L193 100 L191 98 L194 98 Z" fill="#D4AF37" />

      {/* Engrenagem */}
      <g transform="translate(50, 140)">
        <circle cx="0" cy="0" r="12" fill="#4A4A4A" />
        <circle cx="0" cy="0" r="6" fill="white" />
        <path
          d="M-3 -12 L3 -12 L3 -8 L-3 -8 Z M-3 8 L3 8 L3 12 L-3 12 Z M-12 -3 L-8 -3 L-8 3 L-12 3 Z M8 -3 L12 -3 L12 3 L8 3 Z"
          fill="#4A4A4A"
        />
      </g>

      {/* Texto VEST AI */}
      <text x="120" y="220" fontSize="42" fontWeight="600" textAnchor="middle" fontFamily="Inter, sans-serif">
        <tspan fill="#4A4A4A">VEST</tspan>
        <tspan fill="#5C1F33"> AI</tspan>
      </text>
    </svg>
  )
}
