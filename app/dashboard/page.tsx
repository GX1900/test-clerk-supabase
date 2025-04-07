'use client'

import { useEffect, useState } from 'react'
import { useSession, useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY! // または ANON_KEY を使っていればそれ

export default function Dashboard() {
  const { isLoaded, user } = useUser()
  const { session } = useSession()

  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ClerkのトークンでSupabaseクライアントを作成（公式スタイル）
  function createClerkSupabaseClient() {
    return createClient(supabaseUrl, supabaseKey, {
      async accessToken() {
        return session?.getToken() ?? null
      },
    })
  }

  const client = createClerkSupabaseClient()

  // タスクの取得
  useEffect(() => {
    if (!isLoaded || !user) return

    const fetchTasks = async () => {
      setLoading(true)
      const { data, error } = await client
        .from('tasks')
        .select()
        .eq('user_id', user!.id) // user_id の一致で RLS を通過
      if (!error) {
        setTasks(data || [])
      } else {
        console.error('タスク取得エラー:', error)
      }
      setLoading(false)
    }

    fetchTasks()
  }, [isLoaded, user])

  // タスクの作成（RLSに必要なuser_idを明示）
  const handleCreateTask = async () => {
    if (!user) return

    const { error } = await client.from('tasks').insert({
      name: 'New Task',
      user_id: user.id, // 🔐 RLSに対応（auth.jwt() ->> 'sub' = user_id）
    })

    if (error) {
      console.error('タスク作成エラー:', error)
    } else {
      // 作成後に再取得
      const { data } = await client
        .from('tasks')
        .select()
        .eq('user_id', user.id)
      setTasks(data || [])
    }
  }

  // 認証が読み込まれるまで何も表示しない
  if (!isLoaded) {
    return <p>Loading user...</p>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>

      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length > 0 ? (
        <ul className="list-disc list-inside mb-4">
          {tasks.map((task) => (
            <li key={task.id}>{task.name}</li>
          ))}
        </ul>
      ) : (
        <p>No tasks found</p>
      )}

      <button
        onClick={handleCreateTask}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        task作成
      </button>
    </div>
  )
}
