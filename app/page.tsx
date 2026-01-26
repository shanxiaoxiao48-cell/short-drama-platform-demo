import { AppShell } from "@/components/layout/app-shell"
import { PermissionProvider } from "@/contexts/permission-context"

export default function Home() {
  return (
    <PermissionProvider>
      <AppShell />
    </PermissionProvider>
  )
}
