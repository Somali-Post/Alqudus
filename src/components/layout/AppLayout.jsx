import { DesktopShell } from './DesktopShell'
import { MobileShell } from './MobileShell'

export function AppLayout() {
  return (
    <>
      <DesktopShell />
      <MobileShell />
    </>
  )
}
