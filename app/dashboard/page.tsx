'use client'

import { useEffect, useState } from 'react'
import { useUser, useSession } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!

export default function Dashboard() {
  const { isLoaded, user } = useUser()
  const { session } = useSession()

  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Clerkのトークンを渡してSupabaseクライアントを生成（公式推奨方式）
  const supabase = createClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      return session?.getToken() ?? null
    },
  })

  // ユーザーのタスクを取得
  useEffect(() => {
    if (!isLoaded || !user) return

    const loadTasks = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select()
        .eq('user_id', user.id)

      if (error) {
        console.error('読み込みエラー:', error)
      } else {
        setTasks(data || [])
      }
      setLoading(false)
    }

    loadTasks()
  }, [isLoaded, user])

  // タスクを追加（RLS対応のため user_id を含める）
  const handleCreateTask = async () => {
    if (!user) return

    const { error } = await supabase.from('tasks').insert({
      name: 'New Task',
      user_id: user.id,
    })

    if (error) {
      console.error('作成エラー:', error)
    } else {
      // 作成後に再取得
      const { data } = await supabase
        .from('tasks')
        .select()
        .eq('user_id', user.id)
      setTasks(data || [])
    }
  }

  if (!isLoaded) {
    return <p>Loading user...</p>
  }

  return (
    <div className="p-6 min-h-screen bg-white text-gray-900">
      <div className="flex justify-end mb-6">
        {/* ユーザーメニューはレイアウトで追加してもOK */}
      </div>

      <h1 className="text-2xl font-bold mb-4">Tasks</h1>

      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length > 0 ? (
        <ul className="list-disc list-inside mb-6">
          {tasks.map((task) => (
            <li key={task.id}>{task.name}</li>
          ))}
        </ul>
      ) : (
        <p className="mb-6">No tasks found</p>
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
