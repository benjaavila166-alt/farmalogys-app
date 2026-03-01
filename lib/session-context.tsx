"use client"

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { PresenceUser, SessionState } from "@/lib/types"
import { VALID_PINS, MOCK_PRESENCE_USERS } from "@/lib/mock-data"

interface SessionContextValue extends SessionState {
  unlock: (pin: string) => boolean
  lock: () => void
  presenceUsers: PresenceUser[]
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>({
    isUnlocked: false,
    activeUser: null,
  })

  const unlock = useCallback((pin: string): boolean => {
    const user = VALID_PINS[pin]
    if (user) {
      setSession({
        isUnlocked: true,
        activeUser: { id: `u-${pin}`, nombre: user.nombre, color: user.color },
      })
      return true
    }
    return false
  }, [])

  const lock = useCallback(() => {
    setSession({ isUnlocked: false, activeUser: null })
  }, [])

  return (
    <SessionContext value={{
      ...session,
      unlock,
      lock,
      presenceUsers: MOCK_PRESENCE_USERS,
    }}>
      {children}
    </SessionContext>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("useSession must be used within SessionProvider")
  return ctx
}
