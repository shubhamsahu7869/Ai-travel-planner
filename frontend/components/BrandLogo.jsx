export default function BrandLogo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-12 shrink-0">
        <svg viewBox="0 0 96 88" className="h-full w-full" aria-hidden="true">
          <path d="M7 22l23-9 18 11v55L30 68 7 77V22z" fill="#0f766e" />
          <path d="M49 24l19-11 21 9v55l-21-9-19 11V24z" fill="#0d9488" />
          <path d="M30 13l19 11v55L30 68V13z" fill="#115e59" />
          <path d="M14 35c13 0 14 18 26 18 12 0 12-22 32-22" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="5 6" strokeLinecap="round" />
          <circle cx="18" cy="36" r="4" fill="#fff" />
          <circle cx="72" cy="31" r="4" fill="#fff" />
          <path d="M48 4l4 12 12 4-12 4-4 12-4-12-12-4 12-4 4-12z" fill="#f97316" />
          <path d="M28 5l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6zM70 7l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" fill="#14b8a6" />
        </svg>
      </div>
      {!compact && (
        <span className="text-xl font-bold tracking-tight">
          <span className="text-white">Plan</span>
          <span className="text-teal-300">My</span>
          <span className="text-white">Yatra</span>
        </span>
      )}
    </div>
  );
}
