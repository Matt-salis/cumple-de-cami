export function Clapper({ compact = false }) {
  return (
    <svg
      className={compact ? "clapper is-compact" : "clapper"}
      viewBox="0 0 200 150"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={compact ? "stick-compact" : "stick-main"}>
          <rect x="18" y="10" width="164" height="30" rx="3" transform="rotate(-14 28 40)" />
        </clipPath>
      </defs>
      <rect x="10" y="40" width="180" height="100" rx="8" fill="#eceae6" />
      <rect x="10" y="40" width="180" height="100" rx="8" fill="none" stroke="#141414" strokeWidth="3" />
      <circle cx="28" cy="42" r="5" fill="#141414" />
      <g clipPath={`url(#${compact ? "stick-compact" : "stick-main"})`}>
        <g transform="rotate(-14 28 40)">
          <rect x="18" y="10" width="164" height="30" rx="3" fill="#141414" />
          <g fill="#f4f1ec">
            <polygon points="46,10 62,10 46,40 30,40" />
            <polygon points="78,10 94,10 78,40 62,40" />
            <polygon points="110,10 126,10 110,40 94,40" />
            <polygon points="142,10 158,10 142,40 126,40" />
          </g>
          <polygon points="170,10 182,10 166,40 154,40" fill="#e36a58" />
        </g>
      </g>
      <text x="24" y="66" fill="#6a6864" fontSize="11" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="700">
        PROD
      </text>
      <text x="24" y="96" fill="#141414" fontSize="22" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800">
        CAMI
      </text>
      <text x="24" y="122" fill="#141414" fontSize="13" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="700">
        ESCENA 25 · TOMA 01
      </text>
    </svg>
  );
}
