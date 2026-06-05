import { Link } from 'react-router-dom'

const variants = {
  primary: 'bg-royal text-white hover:bg-navy',
  secondary: 'border border-light-steel bg-white text-navy hover:bg-off-white',
  dark: 'bg-navy text-white hover:bg-navy-dark',
}

export function Button({ children, to, variant = 'primary', className = '', ...props }) {
  const classes = `inline-flex min-h-12 items-center justify-center rounded-lg px-5 py-3 text-sm font-bold transition ${variants[variant]} ${className}`

  if (to) {
    return (
      <Link className={classes} to={to}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
