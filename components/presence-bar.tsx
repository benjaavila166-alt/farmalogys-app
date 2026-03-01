"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useSession } from "@/lib/session-context"
import { Lock, Unlock } from "lucide-react"

export function PresenceBar() {
  const { isUnlocked, activeUser, presenceUsers } = useSession()
  const allUsers = activeUser
    ? [activeUser, ...presenceUsers.filter((u) => u.id !== activeUser.id)]
    : presenceUsers

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {allUsers.map((user) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <Avatar className="size-7 border-2 border-background ring-0">
                <AvatarFallback
                  className="text-[10px] font-semibold text-primary-foreground"
                  style={{ backgroundColor: user.color }}
                >
                  {user.nombre
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>{user.nombre}</TooltipContent>
          </Tooltip>
        ))}
      </div>
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {allUsers.map((u) => u.nombre).join(" y ")}{" "}
        {allUsers.length > 1 ? "estan editando" : "esta viendo"}
      </span>
      <div className="ml-1">
        {isUnlocked ? (
          <Unlock className="size-3.5 text-success" />
        ) : (
          <Lock className="size-3.5 text-muted-foreground" />
        )}
      </div>
    </div>
  )
}
