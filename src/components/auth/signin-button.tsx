"use client"

import * as React from "react"
import { signInAction } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"

interface SignInButtonProps {
  children?: React.ReactNode
  className?: string
}

export function SignInButton({ children, className }: SignInButtonProps) {
  return (
    <form action={signInAction}>
      {children ? (
        React.isValidElement(children)
          // If a React element (e.g., <Button />) is provided, make it the submit control
          ? (() => {
              const element = children as React.ReactElement;
              const isButtonElement = element.type === 'button' || 
                (typeof element.type === 'function' && 
                 (element.type as any).displayName?.includes('Button'));
              
              const props: any = {
                className: (element.props as any)?.className ?? className
              };
              
              if (isButtonElement) {
                props.type = "submit";
              }
              
              return React.cloneElement(element, props);
            })()
          // If non-element content is provided, render a native button
          : <button type="submit" className={className}>{children}</button>
      ) : (
        // Default rendering when no children are passed
        <Button type="submit" className={className}>
          {"Sign In with Google"}
        </Button>
      )}
    </form>
  )
}
