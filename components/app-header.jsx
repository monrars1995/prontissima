"use client"

export default function AppHeader({ step, totalSteps = 6 }) {
  return (
    <header className="w-full px-6 pt-6 pb-4">
      <div className="flex items-center justify-between mb-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 relative">
            <svg viewBox="0 0 200 240" className="w-full h-full">
              {/* Cabide dourado */}
              <path
                d="M100 20 Q100 10, 105 10 L105 15"
                stroke="#C4A05A"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <path d="M60 50 Q100 40, 140 50" stroke="#C4A05A" strokeWidth="5" fill="none" strokeLinecap="round" />
              {/* V burgundy */}
              <path d="M70 60 L100 140 L130 60" fill="#5C1F33" />
              {/* Chip IA */}
              <rect x="92" y="95" width="16" height="16" fill="white" rx="2" />
              <path d="M94 103 h12 M100 97 v12" stroke="#5C1F33" strokeWidth="1" />
              {/* Engrenagem */}
              <circle cx="50" cy="130" r="8" fill="#6B7280" />
              <circle cx="50" cy="130" r="4" fill="white" />
              {/* Estrelas */}
              <path d="M145 70 l2 6 l6 0 l-5 4 l2 6 l-5-4 l-5 4 l2-6 l-5-4 l6 0 z" fill="#5C1F33" />
              <path d="M125 55 l1 3 l3 0 l-2 2 l1 3 l-3-2 l-3 2 l1-3 l-2-2 l3 0 z" fill="#5C1F33" />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-gray-700 font-light text-xs tracking-wide">VEST</span>
            <span className="text-[#5C1F33] font-semibold text-xs tracking-wide">AI</span>
          </div>
        </div>

        {/* Progress indicator */}
        {step && (
          <span className="text-xs text-gray-500 font-light">
            {step}/{totalSteps}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {step && (
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gray-400 to-[#5C1F33] transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      )}
    </header>
  )
}

export { AppHeader }
