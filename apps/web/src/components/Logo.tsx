export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="grid place-items-center rounded-2xl gradient-brand shadow-pop"
        style={{ width: size, height: size }}
      >
        <span
          className="font-display font-extrabold text-primary-foreground"
          style={{ fontSize: size * 0.5 }}
        >
          K
        </span>
      </div>
      <span className="font-display font-extrabold text-2xl tracking-tight">
        Katenda
      </span>
    </div>
  );
}
