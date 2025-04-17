'use client'

import { useEffect } from 'react'
import { useSession, useUser } from '@clerk/nextjs'
import { createBrowserClient } from '@supabase/ssr'

export default function Home() {
  const { user } = useUser()
  const { session } = useSession()

  function createClerkSupabaseClient() {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!
    )
  }

  const client = createClerkSupabaseClient()

  // ✅ プロファイル保存処理：ログイン後に1回だけ実行
  useEffect(() => {
    console.log('🟡 useEffect called')
    console.log('👤 user:', user)

    if (!user) {
      console.log('⛔ user is not ready yet')
      return
    }

    const saveProfileToSupabase = async () => {
      console.log('🚀 Executing upsert...')
      const { error } = await client.from('profiles').upsert(
        {
          user_id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
        },
        { onConflict: 'user_id' }
      )

      if (error) {
        console.error('❌ Profile insert error:', error.message)
      } else {
        console.log('✅ Profile saved to Supabase')
      }
    }

    saveProfileToSupabase()
  }, [user])

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <h1 className="text-2xl font-bold">Welcome</h1>
      <p>プロフィールデータはサインイン時にSupabaseへ保存されます。</p>
    </div>
  )
}
