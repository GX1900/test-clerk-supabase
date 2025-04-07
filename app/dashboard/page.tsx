'use client'

import { useEffect, useState } from 'react'
import { useSession, useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!

export default function Dashboard() {
  const { user } = useUser()
  const { session } = useSession()

  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Clerk公式準拠：accessToken() により Supabase クライアント作成
  function createClerkSupabaseClient() {
    return createClient(
      supabaseUrl,
      supabaseKey,
      {
        async accessToken() {
          return session?.getToken() ?? null
        },
      }
    )
  }

  const client = createClerkSupabaseClient()

  // タスク取得処理
  useEffect(() => {
    if (!user) return

    const loadTasks = async () => {
      setLoading(true)
      const { data, error } = await client
        .from('tasks')
        .select()
        .eq('user_id', user!.id) // 🔥 非null断言（userがnullでないと確信）

      if (!error) {
        setTasks(data || [])
      } else {
        console.error('タスク取得エラー:', error)
      }

      setLoading(false)
    }

    loadTasks()
  }, [user])

  // タスク追加処理
  const handleCreateTask = async () => {
    if (!user) return

    const { error } = await client.from('tasks').insert({
      name: 'New Task',
      user_id: user!.id, // 🔥 非null断言（安全に追加）
    })

    if (error) {
      console.error('タスク作成エラー:', error)
    } else {
      // 作成後に再取得
      const { data } = await client
        .from('tasks')
        .select()
        .eq('user_id', user!.id)
      setTasks(data || [])
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>

      {loading ? (
        <p>Loading...</p>
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
