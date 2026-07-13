import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="h-dvh overflow-hidden bg-[#1a1a1a]">
      <div className="flex h-full min-h-0">
        <AppSidebar />
        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-background">
          <DashboardHeader />
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  )
}
