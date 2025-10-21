import { auth } from "@/lib/auth"

export default auth((req) => {
  // Define protected routes
  const protectedPaths = ['/dashboard', '/api/chat', '/api/usage', '/api/test-ai']
  
  // Allow access to settings pages for testing
  const isSettingsPage = req.nextUrl.pathname.startsWith('/dashboard/settings') || 
                        req.nextUrl.pathname.startsWith('/admin/settings')
  
  const isProtectedPath = protectedPaths.some(path =>
    req.nextUrl.pathname.startsWith(path)
  )

  // Allow access to protected routes only if user has a session
  // Exception: Allow settings pages for testing
  if (isProtectedPath && !req.auth && !isSettingsPage) {
    const newUrl = new URL('/auth/signin', req.nextUrl.origin)
    return Response.redirect(newUrl)
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
