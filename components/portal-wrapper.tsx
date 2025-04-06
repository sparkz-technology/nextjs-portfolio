// components/PortalWrapper.tsx
'use client'

import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

interface PortalWrapperProps {
  children: React.ReactNode
  containerId?: string 
}

export function PortalWrapper({ children, containerId = 'unKnown' }: PortalWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const container = document.getElementById(containerId)
  return container ? createPortal(children, container) : null
}
