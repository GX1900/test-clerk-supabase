'use client'

import { SignIn } from '@clerk/nextjs'

export const dynamic = 'force-dynamic'

export default function SignInPage() {
  return <SignIn redirectUrl="/dashboard" />
}
