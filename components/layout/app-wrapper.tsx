"use client"

import { ReactNode } from 'react'
import { PermissionProvider } from '@/contexts/permission-context'
import { NotificationProvider } from '@/contexts/notification-context'
import { AppShell } from './app-shell'

interface AppWrapperProps {
  children?: ReactNode
}

export function AppWrapper({ children }: AppWrapperProps) {
  return (
    <PermissionProvider>
      <NotificationProvider>
        <AppShell />
      </NotificationProvider>
    </PermissionProvider>
  )
}
