export function Logo({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className ?? ""}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <rect width="32" height="32" rx="9" fill="#14120f" />
        <path d="M7 19.5 25 11l-6.2 10.2-2.6-3.4L7 19.5Z" fill="#a8895c" />
        <path d="m16.2 17.8 2.6 3.4-1.7 2.8-.9-6.2Z" fill="#e9dfcd" />
      </svg>
      <span className="text-[17px] font-semibold tracking-[0.14em]">EXJET</span>
    </span>
  );
}
