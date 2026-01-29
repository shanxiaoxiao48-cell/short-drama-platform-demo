"use client"

import { HeroSection } from "./hero-section"
import { ProjectCards } from "./project-cards"
import { DashboardOverviewCards } from "./dashboard-overview-cards"

interface DashboardProps {
  onOpenWorkspace: (projectId: string) => void
  onNavigateToProjects: () => void
}

export function Dashboard({ onOpenWorkspace, onNavigateToProjects }: DashboardProps) {
  return (
    <div className="p-6 space-y-6">
      <HeroSection onNavigateToProjects={onNavigateToProjects} />
      <DashboardOverviewCards />
      <ProjectCards onOpenWorkspace={onOpenWorkspace} onNavigateToProjects={onNavigateToProjects} />
    </div>
  )
}
