'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useUser, useSession, UserButton } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default function Dashboard() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const { session } = useSession()

  const [tasks, setTasks] = useState<any[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)

  // ✅ Clerk公式推奨のSupabaseクライアント
  function createClerkSupabaseClient() {
    return createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        async accessToken() {
          return session?.getToken({ template: 'supabase' }) ?? null
        },
      }
    )
  }

  const client = createClerkSupabaseClient()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/signin')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (!user) return

    async function loadTasks() {
      setLoading(true)
      const { data, error } = await client
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)

      if (!error) setTasks(data || [])
      else console.error('読み込みエラー:', error)

      setLoading(false)
    }

    loadTasks()
  }, [user])

  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    await client.from('tasks').insert({
      name,
      user_id: user?.id,
    })

    setName('')
    window.location.reload()
  }

  if (!isLoaded) return null

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex justify-end mb-6">
        <UserButton afterSignOutUrl="/signin" />
      </div>

      <h1 className="text-xl font-bold mb-4">タスク一覧</h1>

      {loading ? (
        <p>読み込み中...</p>
      ) : tasks.length === 0 ? (
        <p>タスクはありません</p>
      ) : (
        <ul className="list-disc list-inside mb-4">
          {tasks.map((task) => (
            <li key={task.id}>{task.name}</li>
          ))}
        </ul>
      )}

      <form onSubmit={createTask} className="flex gap-2">
        <input
          type="text"
          placeholder="新しいタスクを入力"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-2 py-1 rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          追加
        </button>
      </form>
    </div>
  )
}
