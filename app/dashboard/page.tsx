'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useUser, useSession, UserButton } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

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

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/signin')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (!user || !session) return

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${await session.getToken({ template: 'supabase' })}`,
        },
      },
    })

    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)

      if (!error) setTasks(data || [])
      else console.error('読み込みエラー:', error)
      setLoading(false)
    }

    fetchTasks()
  }, [user, session])

  const createTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !session) return

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${await session.getToken({ template: 'supabase' })}`,
        },
      },
    })

    const { error } = await supabase.from('tasks').insert({
      name,
      user_id: user.id,
    })

    if (error) {
      console.error('追加エラー:', error)
    } else {
      setName('')
      window.location.reload() // 簡単にリロードして反映
    }
  }

  if (!isLoaded) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* ヘッダー（ユーザーメニュー） */}
      <div className="flex justify-end mb-6">
        <UserButton afterSignOutUrl="/signin" />
      </div>

      {/* タスク一覧 */}
      <h1 className="text-2xl font-bold mb-4">タスク一覧</h1>

      {loading ? (
        <p>読み込み中...</p>
      ) : tasks.length === 0 ? (
        <p>タスクがありません</p>
      ) : (
        <ul className="list-disc list-inside mb-6">
          {tasks.map((task) => (
            <li key={task.id}>{task.name}</li>
          ))}
        </ul>
      )}

      {/* タスク追加フォーム */}
      <form onSubmit={createTask} className="flex gap-2">
        <input
          type="text"
          placeholder="新しいタスクを入力"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          追加
        </button>
      </form>
    </div>
  )
}
