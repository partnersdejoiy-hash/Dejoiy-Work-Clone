export function WorkdayBanner() {
  return (
    <div className="w-full h-28 sm:h-36 md:h-44 lg:h-52 xl:h-60 overflow-hidden relative bg-white">
      <svg viewBox="0 0 800 160" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <rect x="0" y="0" width="200" height="160" fill="#FFE9F1" />
        <circle cx="60" cy="80" r="36" fill="#E91E63" />
        <circle cx="60" cy="80" r="14" fill="#FFC107" />
        <path d="M 90 50 Q 130 30 150 80 T 190 130" stroke="#9C27B0" strokeWidth="6" fill="none" strokeLinecap="round" />

        <rect x="200" y="0" width="200" height="160" fill="#FFF6D6" />
        <path d="M 240 110 L 260 60 L 280 110 Z" fill="#42A5F5" />
        <rect x="295" y="70" width="30" height="40" fill="#FF7043" />
        <circle cx="345" cy="50" r="14" fill="#7E57C2" />
        <path d="M 260 130 Q 290 100 320 130 T 380 130" stroke="#1976D2" strokeWidth="4" fill="none" />

        <rect x="400" y="0" width="200" height="160" fill="#E0F7FA" />
        <path d="M 420 130 Q 440 40 470 130" stroke="#7B1FA2" strokeWidth="5" fill="none" />
        <path d="M 470 130 Q 490 60 520 130" stroke="#E91E63" strokeWidth="5" fill="none" />
        <path d="M 520 130 Q 540 50 570 130" stroke="#FBC02D" strokeWidth="5" fill="none" />
        <circle cx="520" cy="50" r="10" fill="#FF7043" />
        <path d="M 540 60 Q 555 40 570 60" stroke="#388E3C" strokeWidth="4" fill="none" />

        <rect x="600" y="0" width="200" height="160" fill="#FCE4EC" />
        <g fill="#E91E63">
          {Array.from({ length: 8 }).map((_, r) =>
            Array.from({ length: 6 }).map((_, c) => (
              <polygon key={`${r}-${c}`} points={`${620 + c * 28},${15 + r * 20} ${626 + c * 28},${5 + r * 20} ${632 + c * 28},${15 + r * 20}`} />
            ))
          )}
        </g>
        <rect x="700" y="60" width="80" height="60" fill="none" stroke="#1976D2" strokeWidth="4" />
        <rect x="710" y="70" width="60" height="40" fill="none" stroke="#1976D2" strokeWidth="4" />
        <rect x="720" y="80" width="40" height="20" fill="none" stroke="#1976D2" strokeWidth="4" />
      </svg>
    </div>
  );
}
