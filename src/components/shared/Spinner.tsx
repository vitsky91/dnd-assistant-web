export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      style={{ display: 'inline-block' }}
    >
      <circle cx="12" cy="12" r="10" stroke="#4A5568" strokeWidth="3" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="#C9963A"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
