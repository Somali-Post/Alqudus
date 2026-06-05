import { ClipboardList, Home, Info, Phone, Truck } from 'lucide-react'

export const navigationItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Owner Operators', path: '/owner-operators', icon: Truck },
  { label: 'Apply', path: '/apply', icon: ClipboardList },
  { label: 'About', path: '/about', icon: Info },
  { label: 'Contact', path: '/contact', icon: Phone },
]
