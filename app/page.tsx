'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
)

export default function SaveClerkProfile() {
  const { user, isSignedIn } = useUser()

  useEffect(() => {
    if (!isSignedIn || !user) return

    const saveProfileToSupabase = async () => {
      const { error } = await supabase
        .from('profile')
        .upsert(
          {
            user_id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
          },
          { onConflict: 'user_id' } // 重複user_idなら更新
        )

      if (error) {
        console.error('Profile insert error:', error.message)
      } else {
        console.log('✅ Profile saved to Supabase')
      }
    }

    saveProfileToSupabase()
  }, [isSignedIn, user])

  return null // 表示用のUIはなし
}
