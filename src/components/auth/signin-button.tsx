"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

interface SignInButtonProps {
  children?: React.ReactNode
  className?: string
}

export function SignInButton({ children, className }: SignInButtonProps) {
  return (
    <Button
      onClick={() => signIn("google")}
      className={className}
    >
      {children || "Sign In with Google"}
    </Button>
  )
}
