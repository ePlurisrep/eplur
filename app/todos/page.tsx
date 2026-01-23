import React from 'react'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export default async function Page() {
  // use cookies() inline to avoid an inferred Promise type in some TS configs

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // minimal cookie adapter for server components (read-only here)
      cookies: {
        async getAll() {
          const c = await cookies()
          return c.getAll()
        },
        setAll() {
          // noop in server component — cookie setting is done in API routes
        },
      },
    }
  )

  const { data: todos, error } = await supabase.from('todos').select('*')

  if (error) {
    return (
      <main>
        <h1>Todos</h1>
        <p>Error loading todos: {String(error.message)}</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Todos</h1>
      <ul>
        {Array.isArray(todos) && todos.length ? (
          todos.map((todo: any) => (
            <li key={todo.id ?? JSON.stringify(todo)}>{todo.title ?? String(todo)}</li>
          ))
        ) : (
          <li>No todos</li>
        )}
      </ul>
    </main>
  )
}
