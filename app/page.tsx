'use client'

import { useEffect, useState } from 'react'
import { useSession, useUser } from '@clerk/nextjs'
import { createBrowserClient } from '@supabase/ssr'

export default function Home() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
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

  useEffect(() => {
    if (!user) return

    async function loadTasks() {
      setLoading(true)
      const { data, error } = await client.from('tasks').select()
      if (!error) setTasks(data)
      setLoading(false)
    }

    loadTasks()
  }, [user])

  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const { error } = await client.from('tasks').insert({
      name,
      user_id: user?.id,
      email: user?.primaryEmailAddress?.emailAddress,
    })

    if (error) {
      console.error('Insert error:', error.message)
      alert('エラー: ' + error.message)
    } else {
      alert('タスク作成成功！')
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>

      {loading && <p>Loading...</p>}
      {!loading && tasks.length > 0 &&
        tasks.map((task: any) => <p key={task.id}>{task.name}</p>)}
      {!loading && tasks.length === 0 && <p>No tasks found</p>}

      <form onSubmit={createTask} className="mt-4">
        <input
          className="border px-2 py-1 mr-2"
          autoFocus
          type="text"
          name="name"
          placeholder="Enter new task"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">
          Add
        </button>
      </form>
    </div>
  )
}
