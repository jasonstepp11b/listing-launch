import logoIcon from '../assets/logo-icon.svg'

type Size = 'sm' | 'md' | 'lg'

interface Props {
  size?: Size
}

const sizes: Record<Size, { icon: number; fontSize: string; gap: string; letterSpacing: string }> = {
  sm: { icon: 24, fontSize: '14px', gap: '7px',  letterSpacing: '-1px' },
  md: { icon: 30, fontSize: '16px', gap: '9px',  letterSpacing: '-1px' },
  lg: { icon: 40, fontSize: '22px', gap: '12px', letterSpacing: '-1px' },
}

export default function Logo({ size = 'md' }: Props) {
  const { icon, fontSize, gap, letterSpacing } = sizes[size]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap, flexShrink: 0 }}>
      <img
        src={logoIcon}
        alt="ListingIgnite"
        width={icon}
        height={icon}
        style={{ display: 'block', flexShrink: 0 }}
      />
      <span style={{ fontSize, letterSpacing, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", lineHeight: 1 }}>
        <span style={{ fontWeight: '500', color: '#a0a8b8' }}>Listing</span><span style={{ fontWeight: '800', color: '#a855f7' }}>Ignite</span>
      </span>
    </div>
  )
}
