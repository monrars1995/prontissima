"use client"

/**
 * PRONTÍSSIMA — SVG Brand Mark
 * Pure SVG logo with golden hanger icon + wordmark
 * 
 * Variants:
 * - "full": Hanger icon + wordmark + tagline
 * - "mark": Hanger icon only (for small contexts like favicon, app icon)
 * - "wordmark": Text only (for headers)
 * 
 * Color modes:
 * - "gold": Gold gradient on transparent (for dark backgrounds)
 * - "dark": Burgundy solid on transparent (for light backgrounds)
 * - "white": White on transparent (for colored backgrounds)
 */
export default function AppLogo({
  variant = "wordmark",
  colorMode = "dark",
  size = "medium",
  className = "",
  showTagline = false
}) {
  const sizes = {
    tiny: { mark: 20, text: "text-sm", gap: "gap-1" },
    small: { mark: 28, text: "text-lg", gap: "gap-1.5" },
    medium: { mark: 36, text: "text-2xl", gap: "gap-2" },
    large: { mark: 56, text: "text-4xl", gap: "gap-3" },
    hero: { mark: 80, text: "text-6xl", gap: "gap-4" },
  }

  const s = sizes[size] || sizes.medium

  // Color tokens
  const colors = {
    gold: {
      text: "text-brand-gradient",
      stroke: "url(#goldGrad)",
      fill: "url(#goldGrad)",
      tagline: "text-[#C9B8A8]",
    },
    dark: {
      text: "text-[#5C1F33]",
      stroke: "#5C1F33",
      fill: "#5C1F33",
      tagline: "text-[#C9B8A8]",
    },
    white: {
      text: "text-white",
      stroke: "#FFFFFF",
      fill: "#FFFFFF",
      tagline: "text-white/50",
    },
  }

  const c = colors[colorMode] || colors.dark

  // SVG hanger icon
  const HangerIcon = ({ size: iconSize }) => (
    <svg
      width={iconSize}
      height={iconSize * 0.7}
      viewBox="0 0 80 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B8860B" />
          <stop offset="40%" stopColor="#FFD700" />
          <stop offset="60%" stopColor="#DAA520" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
      {/* Hook */}
      <path
        d="M40 2 C40 2, 44 2, 44 6 C44 10, 40 10, 40 10"
        stroke={c.stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Body — elegant curved hanger */}
      <path
        d="M40 10 L40 16 M40 16 C40 16, 30 20, 10 38 C6 41, 8 46, 12 46 L68 46 C72 46, 74 41, 70 38 C50 20, 40 16, 40 16"
        stroke={c.stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )

  // Wordmark text
  const Wordmark = () => (
    <span
      className={`font-bold tracking-[0.12em] ${s.text} ${colorMode === 'gold' ? '' : c.text}`}
      style={{
        fontFamily: "var(--font-display), Georgia, serif",
        ...(colorMode === 'gold' ? {
          background: "linear-gradient(135deg, #B8860B, #FFD700, #DAA520)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        } : {}),
      }}
    >
      PRONTÍSSIMA
    </span>
  )

  // Tagline
  const Tagline = () => (
    <span className={`text-[10px] tracking-[0.35em] uppercase ${c.tagline}`}
      style={{ fontFamily: "var(--font-body), sans-serif" }}
    >
      seu estilo · elevado
    </span>
  )

  if (variant === "mark") {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <HangerIcon size={s.mark} />
      </div>
    )
  }

  if (variant === "wordmark") {
    return (
      <div className={`inline-flex flex-col items-center ${s.gap} ${className}`}>
        <Wordmark />
        {showTagline && <Tagline />}
      </div>
    )
  }

  // Full: icon + wordmark + tagline
  return (
    <div className={`inline-flex flex-col items-center ${s.gap} ${className}`}>
      <HangerIcon size={s.mark} />
      <Wordmark />
      {showTagline && <Tagline />}
    </div>
  )
}
