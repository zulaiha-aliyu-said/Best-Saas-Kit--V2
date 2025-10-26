"use client"

import * as React from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

interface SignInButtonProps {
  children?: React.ReactNode
  className?: string
}

export function SignInButton({ children, className }: SignInButtonProps) {
  const handleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error("Sign in error:", error)
    }
  }

  return (
    <>
      {children ? (
        React.isValidElement(children)
          // If a React element (e.g., <Button />) is provided, make it clickable
          ? React.cloneElement(children as React.ReactElement<any>, { 
              onClick: handleSignIn,
              className: (children as any).props?.className ?? className 
            })
          // If non-element content is provided, render a native button
          : <button onClick={handleSignIn} className={className}>{children}</button>
      ) : (
        // Default rendering when no children are passed
        <Button onClick={handleSignIn} className={className}>
          {"Sign In with Google"}
        </Button>
      )}
    </>
  )
}
