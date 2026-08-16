export function HeroMeshBackground() {
  return (
    <div className="hero-mesh-background">
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        <g className="hero-mesh-lines" vectorEffect="non-scaling-stroke">
          <path d="M-80 250 160 84 354 238 566 72 744 232 962 46 1198 206 1510 20" />
          <path d="M-54 492 160 84 236 430 354 238 480 474 566 72 676 430 744 232 888 474 962 46 1082 416 1198 206 1518 458" />
          <path d="M-44 718 236 430 414 704 480 474 650 738 676 430 850 694 888 474 1054 722 1082 416 1300 678 1518 458" />
          <path d="M160 84 480 474 744 232 1082 416 1510 20" />
          <path d="M-80 250 236 430 566 72 888 474 1198 206 1518 458" />
          <path d="M-44 718 480 474 676 430 1054 722 1300 678" />
          <path d="M236 430 650 738 888 474 1300 678" />
          <path d="M354 238 676 430 962 46" />
          <path d="M414 704 676 430 850 694" />
          <path d="M566 72 888 474 1082 416" />
          <path d="M744 232 1054 722 1198 206" />
          <path d="M850 694 1082 416 1518 458" />
        </g>
        <g className="hero-mesh-nodes">
          <circle cx="354" cy="238" r="3.5" />
          <circle cx="676" cy="430" r="4" />
          <circle cx="888" cy="474" r="3" />
          <circle cx="1082" cy="416" r="4" />
          <circle cx="1198" cy="206" r="3" />
        </g>
      </svg>
    </div>
  );
}
