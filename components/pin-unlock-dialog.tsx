"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import { LockOpen, AlertCircle } from "lucide-react"
import { useSession } from "@/lib/session-context"

export function PinUnlockDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { unlock } = useSession()
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)

  function handleSubmit() {
    if (pin.length === 4) {
      const success = unlock(pin)
      if (success) {
        setPin("")
        setError(false)
        onOpenChange(false)
      } else {
        setError(true)
        setPin("")
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <LockOpen className="size-5 text-primary" />
            Iniciar Turno
          </DialogTitle>
          <DialogDescription>
            Ingresa tu PIN de 4 digitos para desbloquear la edicion.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <InputOTP
            maxLength={4}
            value={pin}
            onChange={(val) => {
              setPin(val)
              setError(false)
            }}
            onComplete={handleSubmit}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
          {error && (
            <p className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="size-4" />
              PIN incorrecto. Intenta de nuevo.
            </p>
          )}
          <Button onClick={handleSubmit} disabled={pin.length < 4} className="w-full">
            Desbloquear
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
