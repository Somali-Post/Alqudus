export function LogoMark({ size = 'h-14 w-14', showText = false }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/assets/logos/alqudus-logo-circle.png"
        alt="Alqudus Express Trucking LLC"
        className={`${size} rounded-full object-contain`}
      />
      {showText ? (
        <span className="font-display text-base font-black tracking-normal text-navy">
          ALQUDUS EXPRESS
        </span>
      ) : null}
    </div>
  )
}
