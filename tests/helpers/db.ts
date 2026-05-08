import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://cejujszwthlacdgsllzx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlanVqc3p3dGhsYWNkZ3NsbHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMjc5MjQsImV4cCI6MjA5MzYwMzkyNH0.Wx_DQhg7VxvqGSyyLYH0d31B77XmlrqwNy4M9afLQqY',
)

// 2020-01-01 이후 생성된 레코드 전체 삭제 (FK 순서: matches → seniors → jobs)
export async function clearDb() {
  await supabase.from('matches').delete().gte('created_at', '2020-01-01')
  await supabase.from('seniors').delete().gte('created_at', '2020-01-01')
  await supabase.from('jobs').delete().gte('created_at', '2020-01-01')
}

export async function insertJob(job: {
  title: string
  region: string
  job_type: string
  required_career: number
}) {
  const { data, error } = await supabase.from('jobs').insert(job).select().single()
  if (error) throw new Error(`insertJob 실패: ${error.message}`)
  return data as { id: string }
}

export async function getSeniorByName(name: string) {
  const { data } = await supabase
    .from('seniors')
    .select('id, name')
    .eq('name', name)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as { id: string; name: string } | null
}

export async function countSeniors() {
  const { count } = await supabase
    .from('seniors')
    .select('*', { count: 'exact', head: true })
  return count ?? 0
}
