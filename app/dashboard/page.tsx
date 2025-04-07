'use client'

import { useEffect, useState } from 'react'
import { useSession, useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY! // or _ANON_KEY depending on your setup

export default function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const { user } = useUser()
  const { session } = useSession()

  // Clerk公式推奨：accessToken() を使ってSupabaseクライアントを作成
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

  // タスク一覧を取得
  useEffect(() => {
    if (!user) return

    async function loadTasks() {
      setLoading(true)
      const { data, error } = await client
        .from('tasks')
        .select()
        .eq('user_id', user.id)

      if (!error) {
        setTasks(data || [])
      } else {
        console.error('タスク取得エラー:', error)
      }

      setLoading(false)
    }

    loadTasks()
  }, [user])

  // タスク作成（仮の名前 "New Task" を使用）
  async function handleCreateTask() {
    if (!user) return

    const { error } = await client.from('tasks').insert({
      name: 'New Task',
      user_id: user.id,
    })

    if (error) {
      console.error('タスク作成エラー:', error)
    } else {
      // 作成後にタスクを再取得
      const { data } = await client
        .from('tasks')
        .select()
        .eq('user_id', user.id)
      setTasks(data || [])
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>

      {loading ? (
        <p>Loading...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks found</p>
      ) : (
        <ul className="list-disc list-inside mb-4">
          {tasks.map((task) => (
            <li key={task.id}>{task.name}</li>
          ))}
        </ul>
      )}

      {/* 「task作成」ボタン */}
      <button
        onClick={handleCreateTask}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        task作成
      </button>
    </div>
  )
}
