"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

interface SignOutButtonProps {
  children?: React.ReactNode
  className?: string
}

export function SignOutButton({ children, className }: SignOutButtonProps) {
  return (
    <Button
      onClick={() => signOut()}
      variant="outline"
      className={className}
    >
      {children || "Sign Out"}
    </Button>
  )
}
