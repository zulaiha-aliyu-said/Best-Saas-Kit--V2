import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "@/lib/auth"

export async function signIn() {
  await nextAuthSignIn("google")
}

export async function signOut() {
  await nextAuthSignOut()
}
