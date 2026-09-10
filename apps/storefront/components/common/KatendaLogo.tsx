export function KatendaLogo({
  size = 40,
  showWordmark = true,
}: {
  size?: number;
  showWordmark?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="grid place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-pop"
        style={{ width: size, height: size }}
      >
        <span
          className="font-display font-extrabold"
          style={{ fontSize: size * 0.5 }}
        >
          K
        </span>
      </span>
      {showWordmark && (
        <span className="font-display font-extrabold text-xl tracking-tight">
          Katenda
        </span>
      )}
    </span>
  );
}
