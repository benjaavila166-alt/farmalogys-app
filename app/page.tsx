import { SessionProvider } from "@/lib/session-context"
import { DashboardShell } from "@/components/dashboard-shell"

export default function Home() {
  return (
    <SessionProvider>
      <DashboardShell />
    </SessionProvider>
  )
}
